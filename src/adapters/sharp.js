// @flow

const sharp = require('sharp');

module.exports = (imagePath: string) => {
  const image = sharp(imagePath);

  return {
    metadata: () => image.metadata(),
    resize: ({width, quality, background, mime}: {width: number, quality: number | void, background: string, mime: string}) =>
      new Promise((resolve, reject) => {
        let resized = image.clone()
          .resize(width, null);

        if (background) {
          resized = resized.background(background)
          .flatten();
        }

        if (mime === 'image/jpeg') {
          resized = resized.jpeg({
            quality
          });
        }

        resized.toBuffer((err, data, {height}) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              data,
              width,
              height
            });
          }
        });
      })
  };
};
