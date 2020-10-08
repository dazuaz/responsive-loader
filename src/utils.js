// @flow
import path from "path"
import type { Options, ParsedOptions } from "./types"

const MIMES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
}

const EXTS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

function parseOptions(
  loaderContext: any,
  options: Options,
  defaults: Object
): ParsedOptions {
  const outputContext: string =
    options.context ||
    loaderContext.rootContext ||
    (loaderContext.options && loaderContext.options.context)

  const outputPlaceholder: boolean =
    Boolean(options.placeholder) || defaults.outputPlaceholder

  const placeholderSize: number =
    parseInt(options.placeholderSize, 10) || defaults.placeholderSize

  // JPEG and WEBP compression
  const quality: number = parseInt(options.quality, 10) || defaults.quality

  // Useful when converting from PNG to JPG
  const background: string | number | void = options.background

  // Progressive JPEG scan
  const progressive: boolean | void = options.progressive

  const rotate: number = parseInt(options.rotate, 10) || defaults.rotate

  let mime: string
  let ext: string
  if (options.format) {
    mime = MIMES[options.format]
    ext = EXTS[mime]
  } else {
    ext = path.extname(loaderContext.resourcePath).replace(/\./, "")
    mime = MIMES[ext]
  }

  const name = (options.name || defaults.name).replace(/\[ext\]/gi, ext)

  const min: number | void =
    options.min !== undefined ? parseInt(options.min, 10) : undefined

  const max: number | void =
    options.max !== undefined ? parseInt(options.max, 10) : undefined

  const steps: number =
    options.steps === undefined ? defaults.steps : parseInt(options.steps, 10)

  let generatedSizes
  if (typeof min === "number" && max) {
    generatedSizes = []

    for (let step = 0; step < steps; step++) {
      const size = min + ((max - min) / (steps - 1)) * step
      generatedSizes.push(Math.ceil(size))
    }
  }

  const esModule: boolean =
    options.esModule !== undefined ? options.esModule : defaults.esModule

  const emitFile: boolean =
    options.emitFile !== undefined ? options.emitFile : defaults.emitFile

  return {
    outputContext,
    outputPlaceholder,
    placeholderSize,
    quality,
    background,
    progressive,
    rotate,
    ext,
    mime,
    name,
    generatedSizes,
    esModule,
    emitFile,
  }
}

const createPlaceholder = (
  { data }: { data: Buffer },
  mime: string
): string => {
  return `"data:${mime};base64,${data.toString("base64")}"`
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
const getOutputAndPublicPath = (
  fileName: string,
  { outputPath: configOutputPath, publicPath: configPublicPath }: Options
): { outputPath: any | string, publicPath: string, ... } => {
  let outputPath = fileName

  if (configOutputPath) {
    if (typeof configOutputPath === "function") {
      outputPath = configOutputPath(fileName)
    } else {
      outputPath = path.posix.join(configOutputPath, fileName)
    }
  }

  let publicPath = `__webpack_public_path__ + ${JSON.stringify(outputPath)}`

  if (configPublicPath) {
    if (typeof configPublicPath === "function") {
      publicPath = configPublicPath(fileName)
    } else if (configPublicPath.endsWith("/")) {
      publicPath = configPublicPath + fileName
    } else {
      publicPath = `${configPublicPath}/${fileName}`
    }

    publicPath = JSON.stringify(publicPath)
  }

  return {
    outputPath,
    publicPath,
  }
}

export { parseOptions, getOutputAndPublicPath, createPlaceholder }
