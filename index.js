/* eslint-disable */
var path = require('path');
var loaderUtils = require('loader-utils');
var jimp = require('jimp');
var queue = require('queue-async');

var MIMES = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png'
};

module.exports = function(content) {
  this.cacheable && this.cacheable();
  var loaderCallback = this.async();
  var query = loaderUtils.parseQuery(this.query);
  var options = this.options.responsiveLoader || {};
  var sizes = query.sizes || query.size || [Number.MAX_SAFE_INTEGER];
  var name = query.name || '[hash]-[width].';
  // JPEG compression
  var quality = parseInt(query.quality, 10) || 95;
  // Useful when converting from PNG to JPG
  var background = parseInt(query.background, 16) || 0xFFFFFFFF;
  // Specify ext to convert to another format
  var ext = query.ext || path.extname(this.resourcePath).replace(/\./, '');
  var mime = MIMES[ext];
  var loaderContext = this;

  if (!sizes) {
    return loaderCallback(null, content);
  }

  if (!mime) {
    return loaderCallback(new Error('No mime type for file with extension ' + ext + 'supported'));
  }

  if (options.pass) {
    // emit original content only
    const f = loaderUtils.interpolateName(loaderContext, '[hash].[ext]', {content: content});
    loaderContext.emitFile(f, content);
    const p = '__webpack_public_path__ + ' + JSON.stringify(f);
    return loaderCallback(null, 'module.exports = {srcSet:' + p + ',images:[{path:' + p + ',width:1}],src: ' + p + ',toString:function(){return ' + p + '}};');
  }

  jimp.read(loaderContext.resourcePath, function(err, img) {
    if (err) {
      return queueCallback(err);
    }

    function resizeImage(width, queueCallback) {
        img
          .clone()
          .resize(width, jimp.AUTO)
          .quality(quality)
          .background(background)
          .getBuffer(mime, function(err, buf) {
            if (err) {
              return queueCallback(err);
            }

            var fileName = loaderUtils.interpolateName(loaderContext, name + ext, {content: buf}).replace(/\[width\]/ig, width);

            loaderContext.emitFile(fileName, buf);

            queueCallback(null, {
              src: '__webpack_public_path__ + ' + JSON.stringify(fileName + ' ' + width + 'w'),
              path: '__webpack_public_path__ + ' + JSON.stringify(fileName),
              width: width
            });
          });
    }

    var q = queue();
    
    (Array.isArray(sizes) ? sizes : [sizes]).forEach(function(size) {
      var width = Math.min(img.bitmap.width, parseInt(size, 10));

      q.defer(resizeImage, width);
    });

    q.awaitAll(function(err, files) {
      var srcset = files.map(function(f) {
        return f.src;
      }).join('+","+');

      var images = files.map(function(f) {
        return '{path:' + f.path + ',width:' + f.width + '}';
      }).join(',');

      var firstImagePath = files[0].path;
      
      loaderCallback(null, 'module.exports = {srcSet:' + srcset + ',images:[' + images + '],src:' + firstImagePath + ',toString:function(){return ' + firstImagePath + '}};');
    });
  });
};

module.exports.raw = true; // get buffer stream instead of utf8 string
