const path = require('path');
const loaderUtils = require('loader-utils');
const jimp = require('jimp');
const queue = require('d3-queue').queue;

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

  return jimp.read(loaderContext.resourcePath, (err, img) => {
    if (err) {
      return loaderCallback(err);
    }

    function resizeImage(width, queueCallback) {
      img
          .clone()
          .resize(width, jimp.AUTO)
          .quality(quality)
          .background(background)
          .getBuffer(mime, function resizeCallback(queueErr, buf) {
            if (err) {
              return queueCallback(queueErr);
            }

            const fileName = loaderUtils.interpolateName(loaderContext, name + ext, {
              context: outputContext,
              content: buf
            }).replace(/\[width\]/ig, width);

            loaderContext.emitFile(fileName, buf);

            return queueCallback(null, {
              src: '__webpack_public_path__ + ' + JSON.stringify(fileName + ' ' + width + 'w'),
              path: '__webpack_public_path__ + ' + JSON.stringify(fileName),
              width: width
            });
          });
    }

    const q = queue();
    const widthsToGenerate = new Set();

    (Array.isArray(sizes) ? sizes : [sizes]).forEach((size) => {
      const width = Math.min(img.bitmap.width, parseInt(size, 10));

      // Only resize images if they aren't an exact copy of one already being resized...
      if (!widthsToGenerate.has(width)) {
        widthsToGenerate.add(width);
        q.defer(resizeImage, width);
      }
    });

    return q.awaitAll((queueErr, files) => {
      const srcset = files.map(f => f.src).join('+","+');

      const images = files.map(f => '{path:' + f.path + ',width:' + f.width + '}').join(',');

      const firstImagePath = files[0].path;

      loaderCallback(null, 'module.exports = {srcSet:' + srcset + ',images:[' + images + '],src:' + firstImagePath + ',toString:function(){return ' + firstImagePath + '}};');
    });
  });
};

module.exports.raw = true; // get buffer stream instead of utf8 string
