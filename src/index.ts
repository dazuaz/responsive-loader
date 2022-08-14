import * as schema from './schema.json'
import { validate } from 'schema-utils'
import { JSONSchema7 } from 'schema-utils/declarations/ValidationError'

import { parseOptions, getOutputAndPublicPath, createPlaceholder } from './utils'
import { cache } from './cache'
import type { LoaderContext } from 'webpack'

import { interpolateName } from 'loader-utils'
import { parseQuery } from './parseQuery'

import type {
  Adapter,
  Options,
  CacheOptions,
  AdapterImplementation,
  MimeType,
  AdapterResizeResponse,
  TransformParams,
} from './types'

const DEFAULTS = {
  quality: 85,
  placeholder: false,
  placeholderSize: 40,
  name: '[hash]-[width].[ext]',
  steps: 4,
  esModule: false,
  emitFile: true,
  rotate: 0,
  cacheDirectory: false,
  cacheCompression: true,
  cacheIdentifier: '',
}

/**
 * **Responsive Loader**
 *
 * Creates multiple images from one source image, and returns a srcset
 * [Responsive Loader](https://github.com/dazuaz/responsive-loader)
 *
 * @param {Buffer} content Source
 *
 * @return {loaderCallback} loaderCallback Result
 */
export default function loader(this: LoaderContext<Options>, content: string): void {
  const loaderCallback = this.async()
  if (typeof loaderCallback == 'undefined') {
    new Error('Responsive loader callback error')
    return
  }

  // Parsers the query string and options
  const parsedResourceQuery = this.resourceQuery ? parseQuery(this.resourceQuery) : {}

  // Combines defaults, webpack options and query options,
  const options = { ...DEFAULTS, ...this.getOptions(), ...parsedResourceQuery }

  validate(schema as JSONSchema7, options, { name: 'Responsive Loader' })

  const outputContext = options.context || this.rootContext
  const { mime, ext, name, sizes, outputPlaceholder, placeholderSize, imageOptions, cacheOptions } = parseOptions(
    this.resourcePath,
    options
  )

  if (!mime) {
    loaderCallback(new Error('No mime type for file with extension ' + ext + ' supported'))
    return
  }

  const createFile = ({ data, width, height }: AdapterResizeResponse) => {
    const fileName = interpolateName(this, name, {
      context: outputContext,
      content: data.toString(),
    })
      .replace(/\[width\]/gi, width + '')
      .replace(/\[height\]/gi, height + '')

    const { outputPath, publicPath } = getOutputAndPublicPath(fileName, {
      outputPath: options.outputPath,
      publicPath: options.publicPath,
    })

    if (options.emitFile) {
      this.emitFile(outputPath, data)
    }

    return {
      src: publicPath + `+${JSON.stringify(` ${width}w`)}`,
      path: publicPath,
      width: width,
      height: height,
    }
  }

  /**
   * Disable processing of images by this loader (useful in development)
   */
  if (options.disable) {
    const { path } = createFile({ data: content, width: 100, height: 100 })
    loaderCallback(
      null,
      `${options.esModule ? 'export default' : 'module.exports ='} {
        srcSet: ${path},
        images: [{path:${path},width:100,height:100}],
        src: ${path},
        toString: function(){return ${path}}
      }`
    )
    return
  }
  // The full config is passed to the adapter, later sources' properties overwrite earlier ones.
  const adapterOptions = Object.assign({}, options, imageOptions)

  const transformParams = {
    adapterModule: options.adapter,
    resourcePath: this.resourcePath,
    adapterOptions,
    createFile,
    outputPlaceholder,
    placeholderSize,
    mime,
    sizes,
    esModule: options.esModule,
  }
  orchestrate({ cacheOptions, transformParams })
    .then((result) => loaderCallback(null, result))
    .catch((err) => loaderCallback(err))
}
interface OrchestrateParams {
  cacheOptions: CacheOptions
  transformParams: TransformParams
}
async function orchestrate(params: OrchestrateParams) {
  // use cached, or create new image.
  let result
  const { transformParams, cacheOptions } = params

  if (cacheOptions.cacheDirectory) {
    result = await cache(cacheOptions, transformParams)
  } else {
    result = await transform(transformParams)
  }

  return result
}

// Transform based on the parameters
export async function transform({
  adapterModule,
  resourcePath,
  createFile,
  sizes,
  mime,
  outputPlaceholder,
  placeholderSize,
  adapterOptions,
  esModule,
}: TransformParams): Promise<string> {
  const adapter: Adapter = adapterModule || require('./adapters/sharp')
  const img = adapter(resourcePath)
  const results = await transformations({ img, sizes, mime, outputPlaceholder, placeholderSize, adapterOptions })

  let placeholder
  let files

  if (outputPlaceholder) {
    files = results.slice(0, -1).map(createFile)
    placeholder = createPlaceholder(results[results.length - 1], mime)
  } else {
    files = results.map(createFile)
  }

  const srcset = files.map((f) => f.src).join('+","+')
  const images = files.map((f) => `{path: ${f.path},width: ${f.width},height: ${f.height}}`).join(',')
  // default to the biggest image
  const defaultImage = files[files.length - 1]

  return `${esModule ? 'export default' : 'module.exports ='} {
        srcSet: ${srcset},
        images: [${images}],
        src: ${defaultImage.path},
        toString: function(){return ${defaultImage.path}},
        ${placeholder ? 'placeholder: ' + placeholder + ',' : ''}
        width: ${defaultImage.width},
        height: ${defaultImage.height}
      }`
}

interface TransformationParams {
  img: AdapterImplementation
  sizes: number[]
  mime: MimeType
  outputPlaceholder: boolean
  placeholderSize: number
  adapterOptions: Options
}
/**
 * **Run Transformations**
 *
 * For each size defined in the parameters, resize an image via the adapter
 *
 */
async function transformations({
  img,
  sizes,
  mime,
  outputPlaceholder,
  placeholderSize,
  adapterOptions,
}: TransformationParams): Promise<AdapterResizeResponse[]> {
  const metadata = await img.metadata()
  const promises = []
  const widthsToGenerate = new Set()

  sizes.forEach((size) => {
    const width = Math.min(metadata.width, size)
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
  return Promise.all(promises)
}
export const raw = true
