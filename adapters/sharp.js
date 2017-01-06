const sharp = require('sharp');

module.exports = (imagePath) => {
  const image = sharp(imagePath);

  return {
    metadata: () => image.metadata(),
    resize: ({width, quality, background}) =>
      new Promise((resolve, reject) => {
        image.clone()
          .resize(width, null)
          .quality(quality)
          .background(background)
          .toBuffer((err, data, {height}) => {
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
