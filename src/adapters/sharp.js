// @flow

const sharp = require("sharp");

type Options = { background?: number, quality: number, progressive?: boolean };

type Parameters = {
  width: number,
  mime: string,
  options: Options,
};

module.exports = (imagePath: string) => {
  const image = sharp(imagePath);

  return {
    metadata: () => image.metadata(),
    resize: ({
      width,
      mime,
      options,
    }: Parameters): Promise<{ width: number, height: number, data: Buffer }> =>
      new Promise((resolve, reject) => {
        let resized = image.clone().resize(width, null);

        if (options.background) {
          resized = resized.flatten({
            background: options.background,
          });
        }

        if (mime === "image/jpeg") {
          resized = resized.jpeg({
            quality: options.quality,
            progressive: options.progressive,
          });
        }
        if (mime === "image/webp") {
          resized = resized.webp({
            quality: options.quality,
          });
        }

        // .toBuffer() strips EXIF metadata like orientation, so portrait
        // images will become landscape. This updates the image to reflect 
        // the EXIF metadata (if an EXIF orientation is set; otherwise unchanged).
        resized = resized.rotate();

        resized.toBuffer((err, data, { height }) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              data,
              width,
              height,
            });
          }
        });
      }),
  };
};
