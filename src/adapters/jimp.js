// @flow
const jimp = require("jimp")

import type { AdapterParameters } from "../types"

class JimpAdapter {
  readImage: Promise<Object>
  constructor(imagePath: string) {
    this.readImage = jimp.read(imagePath)
  }
  metadata(): Promise<{ height: any, width: any, ... }> {
    return this.readImage.then((image) => ({
      width: image.bitmap.width,
      height: image.bitmap.height,
    }))
  }
  resize({
    width,
    mime,
    options,
  }: AdapterParameters): Promise<{
    width: number,
    height: number,
    data: Buffer,
  }> {
    return new Promise((resolve, reject) => {
      this.readImage.then((image) => {
        image
          .clone()
          .resize(width, jimp.AUTO)
          .quality(options.quality)
          .background(parseInt(options.background, 16) || 0xffffffff)
          .getBuffer(mime, function (err, data) {
            // eslint-disable-line func-names
            if (err) {
              reject(err)
            } else {
              resolve({
                data,
                width,
                height: this.bitmap.height,
              })
            }
          })
      })
    })
  }
}
module.exports = (imagePath: string): JimpAdapter => {
  return new JimpAdapter(imagePath)
}
