// @flow
import path from "path";

import { parseQuery, getOptions, interpolateName } from "loader-utils";
import validateOptions from "schema-utils";

import {
  parseConfig,
  getOutputAndPublicPath,
  createPlaceholder,
} from "./utils";

import type { Config, ParsedConfig } from "./types";
import schema from "./options.json";

const DEFAULTS = {
  outputPlaceholder: false,
  placeholderSize: 40,
  quality: 85,
  name: "[hash]-[width].[ext]",
  steps: 4,
  esModule: false,
};

/**
 * **Responsive Images Loader**
 *
 * Creates multiple images from one source image, and returns a srcset
 * [Responsive Images Loader](https://github.com/dazuaz/responsive-images-loader)
 *
 * @method loader
 *
 * @param {Buffer} content Source
 *
 * @return {loaderCallback} loaderCallback Result
 */
export default function loader(content: Buffer) {
  const loaderCallback = this.async();
  const parsedResourceQuery = this.resourceQuery
    ? parseQuery(this.resourceQuery)
    : {};

  // combine webpack options with query options
  const config: Config = Object.assign(
    {},
    getOptions(this),
    parsedResourceQuery
  );
  validateOptions(schema, config, "Responsive Images Loader");

  // parses configs and set defaults options
  const {
    outputContext,
    outputPlaceholder,
    placeholderSize,
    quality,
    background,
    mime,
    ext,
    name,
    generatedSizes,
    esModule,
  }: ParsedConfig = parseConfig(this, config, DEFAULTS);

  const sizes = parsedResourceQuery.size ||
    parsedResourceQuery.sizes ||
    generatedSizes ||
    config.size ||
    config.sizes || [Number.MAX_SAFE_INTEGER];

  if (!sizes) {
    return loaderCallback(null, content);
  }

  if (!mime) {
    return loaderCallback(
      new Error("No mime type for file with extension " + ext + "supported")
    );
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
      .replace(/\[height\]/gi, height);

    const { outputPath, publicPath } = getOutputAndPublicPath(fileName, config);

    this.emitFile(outputPath, data);

    return {
      src: publicPath + `+${JSON.stringify(` ${width}w`)}`,
      path: publicPath,
      width: width,
      height: height,
    };
  };

  // Disable processing of images by this loader (useful in development)
  if (config.disable) {
    const { path } = createFile({ data: content, width: "100", height: "100" });
    loaderCallback(
      null,
      `${esModule ? "export default" : "module.exports ="} {
        srcSet:${path},
        images:[{path:${path},width:100,height:100}],
        src: ${path},
        toString:function(){return ${path}}
      };`
    );
    return;
  }

  const adapter: Function = config.adapter || require("./adapters/jimp");

  // The config that is passed to the adatpers
  const adapterOptions = Object.assign({}, config, {
    quality,
    background,
  });
  const img = adapter(this.resourcePath);

  img
    .metadata()
    .then((metadata) => {
      let promises = [];
      const widthsToGenerate = new Set();

      (Array.isArray(sizes) ? sizes : [sizes]).forEach((size) => {
        const width = Math.min(metadata.width, parseInt(size, 10));
        // Only resize images if they aren't an exact copy of one already being resized...
        if (!widthsToGenerate.has(width)) {
          widthsToGenerate.add(width);
          promises.push(
            img.resize({
              width,
              mime,
              options: adapterOptions,
            })
          );
        }
      });

      if (outputPlaceholder) {
        promises.push(
          img.resize({
            width: placeholderSize,
            options: adapterOptions,
            mime,
          })
        );
      }

      return Promise.all(promises).then((results) =>
        outputPlaceholder
          ? {
              files: results.slice(0, -1).map(createFile),
              placeholder: createPlaceholder(results[results.length - 1], mime),
            }
          : {
              files: results.map(createFile),
            }
      );
    })
    .then(({ files, placeholder }) => {
      const srcset = files.map((f) => f.src).join('+","+');
      const images = files
        .map((f) => `{path: ${f.path},width: ${f.width},height: ${f.height}}`)
        .join(",");
      const firstImage = files[0];

      loaderCallback(
        null,
        `${esModule ? "export default" : "module.exports ="} {
          srcSet: ${srcset},
          images:[ ${images}],
          src: ${firstImage.path},
          toString:function(){return ${firstImage.path}},
          placeholder: ${placeholder},
          width: ${firstImage.width},
          height: ${firstImage.height}
      }`
      );
    })
    .catch((err) => loaderCallback(err));
}
export const raw = true;
