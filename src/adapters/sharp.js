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
          resized = resized.background(options.background)
          .flatten();
        }

        if (mime === 'image/jpeg') {
          resized = resized.jpeg({
            quality: options.quality,
            progressive: options.progressive,
            trellisQuantisation: options.trellisQuantisation,
            chromaSubsampling: options.chromaSubsampling,
            overshootDeringing: options.overshootDeringing,
            optimiseScans: options.optimiseScans,
            optimizeScans: options.optimizeScans,
            optimiseCoding: options.optimiseCoding,
            optimizeCoding: options.optimizeCoding,
            quantisationTable: options.quantisationTable,
            quantizationTable: options.quantizationTable
            
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
