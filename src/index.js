// @flow

const path = require('path');
const loaderUtils = require('loader-utils');

const MIMES = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png'
};

const EXTS = {
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

type Config = {
  size: string | number | void,
  sizes: [string | number] | void,
  min: string | number | void,
  max: string | number | void,
  steps: string | number | void,
  name: string | void,
  outputPath: string | void,
  publicPath: string | void,
  context: string | void,
  placeholderSize: string | number | void,
  quality: string | number | void,
  background: string | number | void,
  placeholder: string | boolean | void,
  adapter: ?Function,
  format: 'png' | 'jpg' | 'jpeg',
  disable: ?boolean,
};

module.exports = function loader(content: Buffer) {
  const loaderCallback = this.async();
  const parsedResourceQuery = this.resourceQuery ? loaderUtils.parseQuery(this.resourceQuery) : {};
  const config: Config = Object.assign({}, loaderUtils.getOptions(this), parsedResourceQuery);
  const outputContext: string = config.context || '';
  const outputPlaceholder: boolean = Boolean(config.placeholder) || false;
  const placeholderSize: number = parseInt(config.placeholderSize, 10) || 40;
  // JPEG compression
  const quality: number = parseInt(config.quality, 10) || 85;
  // Useful when converting from PNG to JPG
  const background: string | number | void = config.background;
  // Specify mimetype to convert to another format
  let mime: string;
  let ext: string;
  if (config.format) {
    if (!MIMES.hasOwnProperty(config.format)) {
      return loaderCallback(new Error('Format "' + config.format + '" not supported'));
    }
    mime = MIMES[config.format];
    ext = EXTS[mime];
  } else {
    ext = path.extname(this.resourcePath).replace(/\./, '');
    mime = MIMES[ext];
    if (!mime) {
      return loaderCallback(new Error('No mime type for file with extension ' + ext + 'supported'));
    }
  }

  const name = (config.name || '[hash]-[width].[ext]').replace(/\[ext\]/ig, ext);
  const publicPath = config.publicPath || '';
  const outputPath = config.outputPath || '';

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
      .replace(/\[height\]/ig, '100');
    loaderContext.emitFile(f, content);
    const p = '__webpack_public_path__ + ' + JSON.stringify(f);
    return loaderCallback(null, 'module.exports = {srcSet:' + p + ',images:[{path:' + p + ',width:100,height:100}],src: ' + p + ',toString:function(){return ' + p + '}};');
  }

  const createFile = ({data, width, height}) => {
    const fileName = loaderUtils.interpolateName(loaderContext, name, {
      context: outputContext,
      content: data
    })
    .replace(/\[width\]/ig, width)
    .replace(/\[height\]/ig, height);

    const filePath = outputPath + fileName;
    loaderContext.emitFile(filePath, data);

    return {
      src: '__webpack_public_path__ + ' + JSON.stringify(filePath + ' ' + width + 'w'),
      path: '__webpack_public_path__ + ' + JSON.stringify(publicPath + fileName),
      width: width,
      height: height
    };
  };

  const createPlaceholder = ({data}: {data: Buffer}) => {
    const placeholder = data.toString('base64');
    return JSON.stringify('data:' + (mime ? mime + ';' : '') + 'base64,' + placeholder);
  };

  const img = adapter(loaderContext.resourcePath);
  return img.metadata()
    .then((metadata) => {
      let promises = [];
      const widthsToGenerate = new Set();

      (Array.isArray(sizes) ? sizes : [sizes]).forEach((size) => {
        const width = Math.min(metadata.width, parseInt(size, 10));

        // Only resize images if they aren't an exact copy of one already being resized...
        if (!widthsToGenerate.has(width)) {
          widthsToGenerate.add(width);
          promises.push(img.resize({
            width,
            mime,
            options: adapterOptions
          }));
        }
      });

      if (outputPlaceholder) {
        promises.push(img.resize({
          width: placeholderSize,
          options: adapterOptions,
          mime
        }));
      }

      return Promise.all(promises)
        .then(results => outputPlaceholder
          ? {
            files: results.slice(0, -1).map(createFile),
            placeholder: createPlaceholder(results[results.length - 1])
          }
          : {
            files: results.map(createFile)
          }
         );
    })
    .then(({files, placeholder}) => {
      const srcset = files.map(f => f.src).join('+","+');

      const images = files.map(f => '{path:' + f.path + ',width:' + f.width + ',height:' + f.height + '}').join(',');

      const firstImage = files[0];

      loaderCallback(null, 'module.exports = {' +
          'srcSet:' + srcset + ',' +
          'images:[' + images + '],' +
          'src:' + firstImage.path + ',' +
          'toString:function(){return ' + firstImage.path + '},' +
          'placeholder: ' + placeholder + ',' +
          'width:' + firstImage.width + ',' +
          'height:' + firstImage.height +
      '};');
    })
    .catch(err => loaderCallback(err));
};

module.exports.raw = true; // get buffer stream instead of utf8 string
