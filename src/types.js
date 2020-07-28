// @flow
type Config = {
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
  adapter: ?Function,
  format: "png" | "jpg" | "jpeg" | "webp",
  disable: ?boolean,
  esModule?: boolean,
};
type ParsedConfig = {
  outputContext: string,
  outputPlaceholder: boolean,
  placeholderSize: number,
  quality: number,
  background?: string | number,
  name: string,
  mime: string,
  ext: string,
  generatedSizes?: number[],
  esModule: boolean,
};
export type { Config, ParsedConfig };
