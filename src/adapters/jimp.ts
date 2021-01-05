import * as jimp from "jimp"

type ResizeProps = {
  width: number
  mime: "image/jpeg" | "image/png" | "image/webp" | "image/avif"
  options: {
    background?: string
    rotate: number
    quality: number
    progressive?: boolean
  }
}

class JimpAdapter {
  readImage: Promise<jimp>
  constructor(imagePath: string) {
    this.readImage = jimp.read(imagePath)
  }
  metadata(): Promise<{ height: number; width: number }> {
    return this.readImage.then((image) => ({
      width: image.bitmap.width,
      height: image.bitmap.height,
    }))
  }
  resize({
    width,
    mime,
    options,
  }: ResizeProps): Promise<{
    width: number
    height: number
    data: Buffer
  }> {
    return new Promise((resolve, reject) => {
      this.readImage.then((image) => {
        image
          .clone()
          .resize(width, jimp.AUTO)
          .quality(options.quality)
          .background(parseInt(options.background + "", 16) || 0xffffffff)
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
