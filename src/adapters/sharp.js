// @flow
const sharp = require("sharp")

import type { AdapterParameters } from "../types"

class SharpAdapter {
  image: any
  constructor(imagePath: string | Buffer) {
    this.image = sharp(imagePath)
  }
  metadata(): Promise<any> {
    return this.image.metadata()
  }
  resize({
    width,
    mime,
    options,
  }: AdapterParameters): Promise<{
    data: any,
    height: number,
    width: number,
  }> {
    return new Promise((resolve, reject) => {
      let resized = this.image.clone().resize(width, null)
      if (!options.rotate) {
        // .toBuffer() strips EXIF metadata like orientation, so portrait
        // images will become landscape. This updates the image to reflect
        // the EXIF metadata (if an EXIF orientation is set; otherwise unchanged).
        resized.rotate()
      }
      if (options.background) {
        resized = resized.flatten({
          background: options.background,
        })
      }

      if (mime === "image/jpeg") {
        resized = resized.jpeg({
          quality: options.quality,
          progressive: options.progressive,
        })
      }
      if (mime === "image/webp") {
        resized = resized.webp({
          quality: options.quality,
        })
      }

      // rotate
      if (options.rotate && options.rotate !== 0) {
        resized = resized.rotate(options.rotate)
      }

      resized.toBuffer((err, data, { height }) => {
        if (err) {
          reject(err)
        } else {
          resolve({
            data,
            width,
            height,
          })
        }
      })
    })
  }
}
module.exports = (imagePath: string | Buffer): SharpAdapter => {
  return new SharpAdapter(imagePath)
}
