import * as path from 'path'
import type { Options, MimeType, ImageOptions, CacheOptions } from './types'

const version = '3'

enum MIMES {
  jpg = 'image/jpeg',
  jpeg = 'image/jpeg',
  png = 'image/png',
  webp = 'image/webp',
  avif = 'image/avif',
}

enum EXTS {
  'image/jpeg' = 'jpg',
  'image/png' = 'png',
  'image/webp' = 'webp',
  'image/avif' = 'avif',
}

type ParsedOptions = {
  outputPlaceholder: boolean
  placeholderSize: number
  name: string
  mime: MimeType | undefined
  ext: string
  sizes: number[]
  imageOptions: ImageOptions
  cacheOptions: CacheOptions
}

function parseOptions(resourcePath: string, options: Options): ParsedOptions {
  const outputPlaceholder = Boolean(options.placeholder)
  const placeholderSize: number = parseInt(options.placeholderSize + '', 10)

  // Adapter compression options
  const imageOptions: ImageOptions = {
    quality: parseInt(options.quality + '', 10),
    rotate: parseInt(options.rotate + '', 10),
    background: options.background,
    progressive: Boolean(options.progressive),
  }

  // let mime: MimeType | undefined
  // let ext: FileExt | string
  let mime
  let ext
  if (options.format) {
    mime = MIMES[options.format]
    ext = EXTS[mime]
  } else {
    ext = path.extname(resourcePath).replace(/\./, '')
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
      case 'avif':
        mime = MIMES[ext]
        break
      default:
        mime = undefined
        break
    }
  }

  const name = options.name.replace(/\[ext\]/gi, ext)
  const min: number | void = options.min !== undefined ? parseInt(options.min + '', 10) : undefined
  const max: number | void = options.max !== undefined ? parseInt(options.max + '', 10) : undefined
  const steps: number = parseInt(options.steps + '', 10)

  let generatedSizes
  if (typeof min === 'number' && max) {
    generatedSizes = []

    for (let step = 0; step < steps; step++) {
      const size = min + ((max - min) / (steps - 1)) * step
      generatedSizes.push(Math.ceil(size))
    }
  }
  const size = parseInt(options.size + '', 10)
  const sizes = size
    ? [size]
    : options.sizes?.map((size) => parseInt(size + '', 10)) || generatedSizes || [Number.MAX_SAFE_INTEGER]

  // Cache options
  const cacheOptions: CacheOptions = {
    cacheDirectory: options.cacheDirectory,
    cacheIdentifier: JSON.stringify({
      options,
      'responsive-loader': version,
    }),
    cacheCompression: Boolean(options.cacheCompression),
  }
  return {
    ext,
    mime,
    name,
    sizes,
    outputPlaceholder,
    placeholderSize,
    cacheOptions,
    imageOptions,
  }
}

const createPlaceholder = ({ data }: { data: any }, mime: string): string => {
  return `"data:${mime};base64,${data.toString('base64')}"`
}
// return `"data:${mime};base64,${data.toString("base64")}"`

interface GetOutputAndPublicPath {
  (
    fileName: string,
    {
      outputPath: configOutputPath,
      publicPath: configPublicPath,
    }: {
      outputPath?: ((...args: Array<unknown>) => string) | string
      publicPath?: ((...args: Array<unknown>) => string) | string
    }
  ): {
    outputPath: string
    publicPath: string
  }
}
/**
 * **Responsive Loader Paths**
 *
 * Returns the output and public path
 *
 * @method getOutputAndPublicPath
 *
 * @param {string} fileName
 * @param {Config} outputPath
 * @param {Config} publicPath
 *
 * @return {Config} Paths Result
 */
const getOutputAndPublicPath: GetOutputAndPublicPath = (
  fileName: string,
  { outputPath: configOutputPath, publicPath: configPublicPath }
) => {
  let outputPath = fileName
  if (configOutputPath) {
    if (typeof configOutputPath === 'function') {
      outputPath = configOutputPath(fileName)
    } else {
      outputPath = path.posix.join(configOutputPath, fileName)
    }
  }
  let publicPath = `__webpack_public_path__ + ${JSON.stringify(outputPath)}`

  if (configPublicPath) {
    if (typeof configPublicPath === 'function') {
      publicPath = configPublicPath(fileName)
    } else {
      // publicPath can be a url or local path
      // check if it's a valid url
      if (isValidUrl(configPublicPath)) {
        const url = new URL(configPublicPath)
        url.pathname = path.posix.join(url.pathname, fileName)
        publicPath = url.toString()
      } else {
        publicPath = path.posix.join(configPublicPath, fileName)
      }
    }
    publicPath = JSON.stringify(publicPath)
  }

  return {
    outputPath,
    publicPath,
  }
}
const isValidUrl = (urlString: string) => {
  try {
    return Boolean(new URL(urlString))
  } catch (e) {
    return false
  }
}

export { parseOptions, getOutputAndPublicPath, createPlaceholder }
