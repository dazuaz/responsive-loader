// @flow

const sharp = require('sharp');

module.exports = (imagePath: string) => {
  const image = sharp(imagePath);

  return {
    metadata: () => image.metadata(),
    resize: ({width, mime, options}: {width: number, mime: string, options: {background?: number, quality: number}}): Promise<{width: number, height: number, data: Buffer}> =>
      new Promise((resolve, reject) => {
        let resized = image.clone()
          .resize(width, null);

        if (options.background) {
          resized = resized.flatten({
            background: options.background
          })
        }

        if (mime === 'image/jpeg') {
          resized = resized.jpeg({
            quality: options.quality
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
      }),
    webp: ({width, mime, options}: {width: number, mime: string, options: {background?: number, quality: number}}): Promise<{width: number, height: number, data: Buffer, isWebp: boolean}> =>
      new Promise((resolve, reject) => {
        let resized = image.clone()
          .resize(width, null);

        if (options.background) {
          resized = resized.flatten({
            background: options.background
          })
        }

        if (mime === 'image/jpeg') {
          resized = resized.jpeg({
            quality: options.quality
          });
        }

        resized.webp().toBuffer((err, data, {format, height}) => {
          if (err) {
            reject(err);
          } else {
            const isWebp = (format === 'webp')? true : false;
            resolve({
              data,
              width,
              height,
              isWebp
            });
          }
        });
      })
  };
};
