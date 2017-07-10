// @flow

const jimp = require('jimp');

module.exports = (imagePath: string) => {
  const readImage: Promise<Object> = jimp.read(imagePath);

  return {
    metadata: () => readImage
      .then(image => ({width: image.bitmap.width, height: image.bitmap.height})),
    resize: ({width, mime, options}: {width: number, mime: string, options: {background?: number, quality: number}}, ) =>
      new Promise((resolve, reject) => {
        readImage.then(image => {
          image.clone()
            .resize(width, jimp.AUTO)
            .quality(options.quality)
            .background(parseInt(options.background, 16) || 0xFFFFFFFF)
            .getBuffer(mime, function(err, data) { // eslint-disable-line func-names
              if (err) {
                reject(err);
              } else {
                resolve({
                  data,
                  width,
                  height: this.bitmap.height
                });
              }
            });
        });
      })
  };
};
