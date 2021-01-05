import type * as webpack from "webpack"

export type LoaderContext = webpack.loader.LoaderContext
export type Options = {
  size?: string | number
  sizes?: [string | number]
  min?: string | number
  max?: string | number
  steps: string | number
  name: string
  outputPath?: ((...args: Array<unknown>) => string) | string
  publicPath?: ((...args: Array<unknown>) => string) | string
  context?: string
  placeholder: string | boolean
  placeholderSize: string | number
  quality: string | number
  background?: string | number
  progressive?: boolean
  rotate: string | number
  adapter?: Adapter
  format?: Format
  disable?: boolean | null
  esModule: boolean
  emitFile: boolean
}
export type Format = "png" | "jpg" | "jpeg" | "webp" | "avif"
export type FileExt = "jpg" | "png" | "webp" | "avif"
export type MimeType = "image/jpeg" | "image/png" | "image/webp" | "image/avif"

export type ParsedOptions = {
  outputContext: string
  outputPlaceholder: boolean
  placeholderSize: number
  quality: number
  background?: string
  progressive?: boolean
  rotate?: number
  name: string
  mime: MimeType | undefined
  ext: string
  sizes: number[]
}

export type Adapter = (imagePath: string) => AdapterImplementation

export interface AdapterImplementation {
  metadata: () => Promise<{ width: number; height: number }>
  resize: (config: { width: number; mime: string; options: Options }) => Promise<AdapterResizeResponse>
}
export type AdapterResizeResponse = { data: Buffer; width: number; height: number }
export type CreateFile = {
  loaderContext: LoaderContext
  data: Buffer
  width: string
  height: string
  outputPath?: ((...args: Array<unknown>) => string) | string
  inputPath?: ((...args: Array<unknown>) => string) | string
}
