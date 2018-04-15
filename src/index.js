// @flow

const path = require('path');
const loaderUtils = require('loader-utils');

const MIMES = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'webp': 'image/webp',
};

const EXTS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

type Config = {
  size: string | number | void,
  sizes: [string | number] | void,
  min: string | number | void,
  max: string | number | void,
  steps: string | number | void,
  name: string | void,
  context: string | void,
  placeholderSize: string | number | void,
  quality: string | number | void,
  background: string | number | void,
  placeholder: string | boolean | void,
  adapter: ?Function,
  // for backward compatibility
  format: 'png' | 'jpg' | 'jpeg',
  formats: ['png' | 'jpg' | 'jpeg' | 'webp'],
  disable: ?boolean,
};

module.exports = function loader(content: Buffer) {
  const loaderCallback = this.async();
  const parsedResourceQuery = this.resourceQuery ? loaderUtils.parseQuery(this.resourceQuery) : {};
  const config: Config = Object.assign({}, loaderUtils.getOptions(this), parsedResourceQuery);
  const outputContext: string = config.context || this.rootContext || this.options && this.options.context;
  const outputPlaceholder: boolean = Boolean(config.placeholder) || false;
  const placeholderSize: number = parseInt(config.placeholderSize, 10) || 40;
  // JPEG compression
  const quality: number = parseInt(config.quality, 10) || 85;
  // Useful when converting from PNG to JPG
  const background: string | number | void = config.background;
  // Specify mimetype to convert to another format
  let originalExtension = path.extname(this.resourcePath).replace(/\./, '');
  let formats: [string];
  if (config.format) {
    formats = [config.format];
  } else if (config.formats) {
    formats = config.formats;
  } else {
    formats = originalExtension;
  }

  // throw a more friendly error than jimp failing to encode
  if (!config.adapter && formats.find(f => f === 'webp')) {
    return loaderCallback(new Error('JIMP does not support webp encoding, use sharp adapter.'));
  }

  const mimes = formats.map(f => MIMES[f]);
  const errFormats = mimes.reduce((m, i) => !m ? [...acc, formats[i]] : acc, []);
  if (errFormats.length > 0) {
    return loaderCallback(new Error('Formats not supported: ', JSON.stringify(errFormats)));
  }

  const name = (config.name || '[hash]-[width].[ext]');

  const adapter: Function = config.adapter || require('./adapters/jimp');
  const loaderContext: any = this;

  // The config that is passed to the adatpers
  const adapterOptions = Object.assign({}, config, {
    quality,
    background
  });

  const min: number | void = config.min !== undefined ? parseInt(config.min, 10) : undefined;
  const max: number | void = config.max !== undefined ? parseInt(config.max, 10) : undefined;
  const steps: number = config.steps === undefined ? 4 : parseInt(config.steps, 10);

  let generatedSizes;
  if (typeof min === 'number' && max) {
    generatedSizes = [];

    for (let step = 0; step < steps; step++) {
      const size = min + (max - min) / (steps - 1) * step;
      generatedSizes.push(Math.ceil(size));
    }
  }

  const sizes = parsedResourceQuery.size || parsedResourceQuery.sizes || generatedSizes || config.size || config.sizes || [Number.MAX_SAFE_INTEGER];

  if (!sizes) {
    return loaderCallback(null, content);
  }

  if (config.disable) {
    // emit original content only
    const f = loaderUtils.interpolateName(loaderContext, name, {
      context: outputContext,
      content: content
    })
      .replace(/\[width\]/ig, '100')
      .replace(/\[height\]/ig, '100')
      .replace(/\[ext\]/ig, originalExtension);
    loaderContext.emitFile(f, content);
    const p = '__webpack_public_path__ + ' + JSON.stringify(f);
    return loaderCallback(null, 'module.exports = {srcSet:' + p + ',images:[{path:' + p + ',width:100,height:100}],src: ' + p + ',toString:function(){return ' + p + '}};');
  }

  const createFile = (mime, {data, width, height}) => {
    const ext = EXTS[mime];

    const fileName = loaderUtils.interpolateName(loaderContext, name, {
      context: outputContext,
      content: data
    })
      .replace(/\[width\]/ig, width)
      .replace(/\[height\]/ig, height)
      .replace(/\[ext\]/ig, ext);

    loaderContext.emitFile(fileName, data);

    return {
      src: '__webpack_public_path__ + ' + JSON.stringify(fileName + ' ' + width + 'w'),
      path: '__webpack_public_path__ + ' + JSON.stringify(fileName),
      width: width,
      height: height
    };
  };

  const createPlaceholder = (mime, {data}: {data: Buffer}) => {
    const placeholder = data.toString('base64');
    return JSON.stringify('data:' + (mime ? mime + ';' : '') + 'base64,' + placeholder);
  };

  const img = adapter(loaderContext.resourcePath);
  return img.metadata()
    .then((metadata) => {
      const promises = mimes.map(() => []);
      const widthsToGenerate = new Set();

      (Array.isArray(sizes) ? sizes : [sizes]).forEach((size) => {
        const width = Math.min(metadata.width, parseInt(size, 10));

        // Only resize images if they aren't an exact copy of one already being resized...
        if (!widthsToGenerate.has(width)) {
          widthsToGenerate.add(width);

          mimes.forEach((mime, i) => {
            promises[i] = img.resize({
              width,
              mime,
              options: adapterOptions
            });
          });
        }
      });

      return Promise.all(promises.map(arr => Promise.all(arr)))
        .then(imagesArr => imagesArr
          .map((images, i) => ({
            files: images.map(img => createFile(mime, img)),
            mime: mimes[i]
          }))
        )
        .then(filesByMime => {
          if (outputPlaceholder) {
            return img.resize({
              placeholderSize,
              mime: mimes[0],
              options: adapterOptions
            })
              .then(img => ({
                filesByMime,
                placeholder: createPlaceholder(mimes[0], img),
              }));
          }

          return { filesByMime };
        });
    })
    .then(({filesByMime, placeholder}) => {
      const srcSets = filesByMime.map(({ mime, files }) => ({
        mime,
        srcSet: files.map(f => f.src).join(' ')
      }));

      const images = filesByMime.reduce((acc, {mime, files}) =>
        acc.concat(
          files.map(({mime, path, width, height}) => ({ path, width, height }))
        )
      , []);

      const firstImage = images[0];

      loaderCallback(null,`
        const srcSets = ${JSON.stringify(srcSets)};

        module.exports = {
          srcSets,
          srcSet: srcSets[0].srcSet,
          images: ${JSON.stringify(images)};
          src: ${firstImage.path},
          toString:function(){return ${firstImage.path} },
          placeholder: ${placeholder},
          width: ${firstImage.width},
          height: ${firstImage.height}
        };
      `);
    })
    .catch(err => loaderCallback(err));
};

module.exports.raw = true; // get buffer stream instead of utf8 string
