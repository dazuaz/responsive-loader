const path = require('path');
const loaderUtils = require('loader-utils');
// const jimp = require('jimp');
const adapter = require('./adapters/jimp');

const MIMES = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png'
};

module.exports = function loader(content) {
  this.cacheable && this.cacheable();
  const loaderCallback = this.async();
  const query = loaderUtils.parseQuery(this.query);
  const options = this.options.responsiveLoader || {};
  const sizes = query.sizes || query.size || options.sizes || [Number.MAX_SAFE_INTEGER];
  const name = query.name || options.name || '[hash]-[width].';
  const outputContext = query.context || options.context || '';
  const outputPlaceholder = query.placeholder || query.placeholder !== false && options.placeholder || false;
  const placeholderSize = query.placeholderSize || options.placeholderSize || 40;
  // JPEG compression
  const quality = parseInt(query.quality, 10) || options.quality || 95;
  // Useful when converting from PNG to JPG
  const background = parseInt(query.background, 16) || options.background || 0xFFFFFFFF;
  // Specify ext to convert to another format
  const ext = query.ext || path.extname(this.resourcePath).replace(/\./, '');
  const mime = MIMES[ext];
  const loaderContext = this;

  if (!sizes) {
    return loaderCallback(null, content);
  }

  if (!mime) {
    return loaderCallback(new Error('No mime type for file with extension ' + ext + 'supported'));
  }

  if (options.pass) {
    // emit original content only
    const f = loaderUtils.interpolateName(loaderContext, '[hash].[ext]', {context: outputContext, content: content});
    loaderContext.emitFile(f, content);
    const p = '__webpack_public_path__ + ' + JSON.stringify(f);
    return loaderCallback(null, 'module.exports = {srcSet:' + p + ',images:[{path:' + p + ',width:1}],src: ' + p + ',toString:function(){return ' + p + '}};');
  }

  const createFile = ({data, width, height}) => {
    const fileName = loaderUtils.interpolateName(loaderContext, name + ext, {
      context: outputContext,
      content: data
    }).replace(/\[width\]/ig, width);

    loaderContext.emitFile(fileName, data);

    return {
      src: '__webpack_public_path__ + ' + JSON.stringify(fileName + ' ' + width + 'w'),
      path: '__webpack_public_path__ + ' + JSON.stringify(fileName),
      width: width,
      height: height
    };
  };

  const createPlaceholder = ({data}) => {
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
