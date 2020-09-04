// @flow
import path from "path";
import type { Config } from "./types";

const MIMES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const EXTS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function parseConfig(loaderContext: any, config: Config, defaults: Object) {
  const outputContext: string =
    config.context ||
    loaderContext.rootContext ||
    (loaderContext.options && loaderContext.options.context);

  const outputPlaceholder: boolean =
    Boolean(config.placeholder) || defaults.outputPlaceholder;

  const placeholderSize: number =
    parseInt(config.placeholderSize, 10) || defaults.placeholderSize;

  // JPEG and WEBP compression
  const quality: number = parseInt(config.quality, 10) || defaults.quality;

  // Useful when converting from PNG to JPG
  const background: string | number | void = config.background;

  // Progressive JPEG scan
  const progressive: boolean | void = config.progressive;

  let mime: string;
  let ext: string;
  if (config.format) {
    mime = MIMES[config.format];
    ext = EXTS[mime];
  } else {
    ext = path.extname(loaderContext.resourcePath).replace(/\./, "");
    mime = MIMES[ext];
  }

  const name = (config.name || defaults.name).replace(/\[ext\]/gi, ext);

  const min: number | void =
    config.min !== undefined ? parseInt(config.min, 10) : undefined;

  const max: number | void =
    config.max !== undefined ? parseInt(config.max, 10) : undefined;

  const steps: number =
    config.steps === undefined ? defaults.steps : parseInt(config.steps, 10);

  let generatedSizes;
  if (typeof min === "number" && max) {
    generatedSizes = [];

    for (let step = 0; step < steps; step++) {
      const size = min + ((max - min) / (steps - 1)) * step;
      generatedSizes.push(Math.ceil(size));
    }
  }

  const esModule: boolean =
    config.esModule !== undefined ? config.esModule : defaults.esModule;

  const emitFile: boolean =
    config.emitFile !== undefined ? config.emitFile : defaults.emitFile;

  return {
    outputContext,
    outputPlaceholder,
    placeholderSize,
    quality,
    background,
    progressive,
    ext,
    mime,
    name,
    generatedSizes,
    esModule,
    emitFile,
  };
}

const createPlaceholder = ({ data }: { data: Buffer }, mime: string) => {
  return `"data:${mime};base64,${data.toString("base64")}"`;
};

/**
 * **Responsive Loader Paths**
 *
 * Returs the output and public path
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
  { outputPath: configOutputPath, publicPath: configPublicPath }: Config
) => {
  let outputPath = fileName;

  if (configOutputPath) {
    if (typeof configOutputPath === "function") {
      outputPath = configOutputPath(fileName);
    } else {
      outputPath = path.posix.join(configOutputPath, fileName);
    }
  }

  let publicPath = `__webpack_public_path__ + ${JSON.stringify(outputPath)}`;

  if (configPublicPath) {
    if (typeof configPublicPath === "function") {
      publicPath = configPublicPath(fileName);
    } else if (configPublicPath.endsWith("/")) {
      publicPath = configPublicPath + fileName;
    } else {
      publicPath = `${configPublicPath}/${fileName}`;
    }

    publicPath = JSON.stringify(publicPath);
  }

  return {
    outputPath,
    publicPath,
  };
};

export { parseConfig, getOutputAndPublicPath, createPlaceholder };
