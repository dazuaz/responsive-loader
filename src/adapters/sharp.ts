import sharp from "sharp"

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

class SharpAdapter {
  image: sharp.Sharp
  constructor(imagePath: string | Buffer) {
    this.image = sharp(imagePath)
  }
  metadata(): Promise<sharp.Metadata> {
    return this.image.metadata()
  }
  resize({ width, mime, options }: ResizeProps): Promise<{ data: Buffer; width: number; height: number }> {
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
      if (mime === "image/avif") {
        // @ts-ignore
        resized = resized.avif({
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
// export default SharpAdapter
module.exports = (imagePath: string | Buffer): SharpAdapter => {
  return new SharpAdapter(imagePath)
}
