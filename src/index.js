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
  size: string | number | void;
  sizes: [string | number] | void;
  name: string | void;
  context: string | void;
  outputPlaceholder: string | boolean | void;
  placeholderSize: string | number | void;
  quality: string | number | void;
  background: string | number | void;
  placeholder: string | boolean | void;
  adapter: ?Function;
  format: 'png' | 'jpg' | 'jpeg'
};

module.exports = function loader(content: Buffer) {
  const loaderCallback = this.async();
  const parsedResourceQuery = this.resourceQuery ? loaderUtils.parseQuery(this.resourceQuery) : {};
  const config: Config = Object.assign({}, loaderUtils.getOptions(this), parsedResourceQuery);
  const sizes = config.size || config.sizes || [Number.MAX_SAFE_INTEGER];
  const outputContext: string = config.context || '';
  const outputPlaceholder: boolean = Boolean(config.placeholder) || false;
  const placeholderSize: number = parseInt(config.placeholderSize, 10) || 40;
  // JPEG compression
  const quality: number = parseInt(config.quality, 10) || 95;
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

  const adapter: Function = config.adapter || require('./adapters/jimp');
  const loaderContext: any = this;

  if (!sizes) {
    return loaderCallback(null, content);
  }

  if (config.pass) {
    // emit original content only
    const f = loaderUtils.interpolateName(loaderContext, name, {context: outputContext, content: content});
    loaderContext.emitFile(f, content);
    const p = '__webpack_public_path__ + ' + JSON.stringify(f);
    return loaderCallback(null, 'module.exports = {srcSet:' + p + ',images:[{path:' + p + ',width:1}],src: ' + p + ',toString:function(){return ' + p + '}};');
  }

  const createFile = ({data, width, height}) => {
    const fileName = loaderUtils.interpolateName(loaderContext, name, {
      context: outputContext,
      content: data
    })
    .replace(/\[width\]/ig, width)
    .replace(/\[height\]/ig, height);

    loaderContext.emitFile(fileName, data);

    return {
      src: '__webpack_public_path__ + ' + JSON.stringify(fileName + ' ' + width + 'w'),
      path: '__webpack_public_path__ + ' + JSON.stringify(fileName),
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
            quality,
            background,
            mime
          }));
        }
      });

      if (outputPlaceholder) {
        promises.push(img.resize({
          width: placeholderSize,
          quality,
          background,
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
