// @flow
import path from "path"

import { parseQuery, getOptions, interpolateName } from "loader-utils"
import { validate } from "schema-utils"

import {
  parseOptions,
  getOutputAndPublicPath,
  createPlaceholder,
} from "./utils"

import type { Options, ParsedOptions } from "./types"

import schema from "./schema.json"

const DEFAULTS = {
  outputPlaceholder: false,
  placeholderSize: 40,
  quality: 85,
  name: "[hash]-[width].[ext]",
  steps: 4,
  esModule: false,
  emitFile: true,
  rotate: 0,
}

/**
 * **Responsive Loader**
 *
 * Creates multiple images from one source image, and returns a srcset
 * [Responsive Images Loader](https://github.com/dazuaz/responsive-loader)
 *
 * @method loader
 *
 * @param {Buffer} content Source
 *
 * @return {loaderCallback} loaderCallback Result
 */
export default function loader(content: Buffer): void {
  const loaderCallback = this.async()
  const parsedResourceQuery = this.resourceQuery
    ? parseQuery(this.resourceQuery)
    : {}

  // combine webpack options with query options
  const options: Options = Object.assign(
    {},
    getOptions(this),
    parsedResourceQuery
  )
  validate(schema, options, "Responsive Loader")

  // parses options and set defaults options
  const {
    outputContext,
    outputPlaceholder,
    placeholderSize,
    quality,
    background,
    rotate,
    progressive,
    mime,
    ext,
    name,
    generatedSizes,
    esModule,
    emitFile,
  }: ParsedOptions = parseOptions(this, options, DEFAULTS)

  let sizes = parsedResourceQuery.size ||
    parsedResourceQuery.sizes ||
    generatedSizes ||
    options.size ||
    options.sizes || [Number.MAX_SAFE_INTEGER]

  // ensure is an array
  sizes = [].concat(sizes)

  if (!sizes.length) {
    return loaderCallback(null, content)
  }

  if (!mime) {
    return loaderCallback(
      new Error("No mime type for file with extension " + ext + " supported")
    )
  }

  const createFile = ({
    data,
    width,
    height,
  }: {
    data: Buffer,
    width: string | number,
    height: string | number,
  }) => {
    const fileName = interpolateName(this, name, {
      context: outputContext,
      content: data,
    })
      .replace(/\[width\]/gi, width)
      .replace(/\[height\]/gi, height)

    const { outputPath, publicPath } = getOutputAndPublicPath(fileName, options)

    if (emitFile) {
      this.emitFile(outputPath, data)
    }

    return {
      src: publicPath + `+${JSON.stringify(` ${width}w`)}`,
      path: publicPath,
      width: width,
      height: height,
    }
  }

  // Disable processing of images by this loader (useful in development)
  if (options.disable) {
    const { path } = createFile({ data: content, width: "100", height: "100" })
    loaderCallback(
      null,
      `${esModule ? "export default" : "module.exports ="} {
        srcSet:${path},
        images:[{path:${path},width:100,height:100}],
        src: ${path},
        toString:function(){return ${path}}
      };`
    )
    return
  }

  const adapter: Function = options.adapter || require("./adapters/jimp")

  // The config that is passed to the adapters
  const adapterOptions = Object.assign({}, options, {
    quality,
    background,
    rotate,
    progressive,
  })
  const img = adapter(this.resourcePath)

  transformations({
    img,
    sizes,
    mime,
    outputPlaceholder,
    placeholderSize,
    adapterOptions,
  })
    .then((results) => {
      let placeholder
      let files = new Map()

      if (outputPlaceholder) {
        files = results.slice(0, -1).map(createFile)
        placeholder = createPlaceholder(results[results.length - 1], mime)
      } else {
        files = results.map(createFile)
      }

      const srcset = files.map((f) => f.src).join('+","+')
      const images = files
        .map((f) => `{path: ${f.path},width: ${f.width},height: ${f.height}}`)
        .join(",")
      const firstImage = files[0]

      loaderCallback(
        null,
        `${esModule ? "export default" : "module.exports ="} {
          srcSet: ${srcset},
          images:[ ${images}],
          src: ${firstImage.path},
          toString:function(){return ${firstImage.path}},
          ${placeholder ? "placeholder: " + placeholder + "," : ""}
          width: ${firstImage.width},
          height: ${firstImage.height}
        }`
      )
    })
    .catch((err) => loaderCallback(err))
}

/**
 * **Run Transformations**
 *
 * For each size defined in the parameters, resize an image via the adapter
 *
 * @method transformations
 *
 * @return {Map} Results
 */

const transformations = async ({
  img,
  sizes,
  mime,
  outputPlaceholder,
  placeholderSize,
  adapterOptions,
}) => {
  const metadata = await img.metadata()
  let promises = []
  const widthsToGenerate = new Set()

  sizes.forEach((size) => {
    const width = Math.min(metadata.width, parseInt(size, 10))
    // Only resize images if they aren't an exact copy of one already being resized...
    if (!widthsToGenerate.has(width)) {
      widthsToGenerate.add(width)
      promises.push(
        img.resize({
          width,
          mime,
          options: adapterOptions,
        })
      )
    }
  })

  if (outputPlaceholder) {
    promises.push(
      img.resize({
        width: placeholderSize,
        options: adapterOptions,
        mime,
      })
    )
  }
  return await Promise.all(promises)
}
export const raw = true
