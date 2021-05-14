'use strict'
import type { LoaderContext } from 'webpack'
import { util } from 'webpack'
import * as path from 'path'

type Options = {
  context: string
  content: string
}

function interpolateName(loaderContext: LoaderContext<any>, name: string, options: Options): string {
  const filename = name || '[hash].[ext]'

  const context = options.context
  const content = options.content

  let ext = 'bin'
  let basename = 'file'
  let directory = ''
  let folder = ''
  let query = ''

  if (loaderContext.resourcePath) {
    const parsed = path.parse(loaderContext.resourcePath)
    let resourcePath = loaderContext.resourcePath

    if (parsed.ext) {
      ext = parsed.ext.substr(1)
    }

    if (parsed.dir) {
      basename = parsed.name
      resourcePath = parsed.dir + path.sep
    }

    if (typeof context !== 'undefined') {
      directory = path
        .relative(context, resourcePath + '_')
        .replace(/\\/g, '/')
        .replace(/\.\.(\/)?/g, '_$1')
      directory = directory.substr(0, directory.length - 1)
    } else {
      directory = resourcePath.replace(/\\/g, '/').replace(/\.\.(\/)?/g, '_$1')
    }

    if (directory.length === 1) {
      directory = ''
    } else if (directory.length > 1) {
      folder = path.basename(directory)
    }
  }

  if (loaderContext.resourceQuery && loaderContext.resourceQuery.length > 1) {
    query = loaderContext.resourceQuery

    const hashIdx = query.indexOf('#')

    if (hashIdx >= 0) {
      query = query.substr(0, hashIdx)
    }
  }

  let url = filename

  if (content) {
    const hash = util.createHash('md4')
    hash.update(content)
    // Match hash template
    url = url
      // `hash` and `contenthash` are same in `loader-utils` context
      // let's keep `hash` for backward compatibility
      .replace(/\[(?:([^:\]]+):)?(?:hash|contenthash)(?::([a-z]+\d*))?(?::(\d+))?\]/gi, `${hash.digest('hex')}`)
  }

  url = url
    .replace(/\[ext\]/gi, () => ext)
    .replace(/\[name\]/gi, () => basename)
    .replace(/\[path\]/gi, () => directory)
    .replace(/\[folder\]/gi, () => folder)
    .replace(/\[query\]/gi, () => query)

  // if (
  //   typeof loaderContext.getOptions() === 'object' &&
  //   typeof loaderContext.getOptions().customInterpolateName === 'function'
  // ) {
  //   url = loaderContext.getOptions().customInterpolateName.call(loaderContext, url, name, options)
  // }

  return url
}

export { interpolateName }
