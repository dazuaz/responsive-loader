// @flow
type Options = {
  size: string | number | void,
  sizes: [string | number] | void,
  min: string | number | void,
  max: string | number | void,
  steps: string | number | void,
  name?: string,
  outputPath: Function | string | void,
  publicPath: Function | string | void,
  context?: string,
  placeholder: string | boolean | void,
  placeholderSize: string | number | void,
  quality: string | number | void,
  background: string | number | void,
  progressive: boolean | void,
  rotate: number | void,
  adapter: ?Function,
  format: "png" | "jpg" | "jpeg" | "webp",
  disable: ?boolean,
  esModule?: boolean,
  emitFile?: boolean,
}
type ParsedOptions = {
  outputContext: string,
  outputPlaceholder: boolean,
  placeholderSize: number,
  quality: number,
  background?: string | number,
  progressive?: boolean,
  rotate?: number,
  name: string,
  mime: string,
  ext: string,
  generatedSizes?: number[],
  esModule: boolean,
  emitFile: boolean,
}
type AdapterOptions = {
  background?: number,
  rotate: number,
  quality: number,
  progressive?: boolean,
}
declare type AdapterParameters = {
  width: number,
  mime: string,
  options: AdapterOptions,
}

export type { Options, ParsedOptions, AdapterParameters }
