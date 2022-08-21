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
  cacheDirectory: string | boolean
  cacheIdentifier: string
  cacheCompression: boolean
}
export type Format = 'png' | 'jpg' | 'jpeg' | 'webp' | 'avif'
export type FileExt = 'jpg' | 'png' | 'webp' | 'avif'
export type MimeType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif'

export interface CacheOptions {
  cacheDirectory: string | boolean
  cacheIdentifier: string
  cacheCompression: boolean
}

export type Adapter = (imagePath: string) => AdapterImplementation
export interface ImageOptions {
  quality: number
  background?: string | number
  progressive: boolean
  rotate?: number
}
export interface AdapterImplementation {
  metadata: () => Promise<{ width: number; height: number }>
  resize: (config: { width: number; mime: string; options: Options }) => Promise<AdapterResizeResponse>
}
export type AdapterResizeResponse = { data: string | Buffer; width: number; height: number }

export interface TransformParams {
  adapterModule: Adapter | undefined
  resourcePath: string
  createFile: ({ data, width, height }: AdapterResizeResponse) => {
    src: string
    path: string
    width: number
    height: number
  }
  outputPlaceholder: boolean
  placeholderSize: number
  mime: MimeType
  sizes: number[]
  adapterOptions: Options & ImageOptions
}
