// @flow

const jimp = require('jimp');

module.exports = (imagePath: string) => {
  const readImage: Promise<Object> = jimp.read(imagePath);

  return {
    metadata: () => readImage
      .then(image => ({width: image.bitmap.width, height: image.bitmap.height})),
    resize: ({width, quality, background, mime}: {width: number, quality: number | void, background: string, mime: string}) =>
      new Promise((resolve, reject) => {
        readImage.then(image => {
          image.clone()
            .resize(width, jimp.AUTO)
            .quality(quality)
            .background(parseInt(background, 16) || 0xFFFFFFFF)
            .getBuffer(mime, function(err, data) {
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
