import { util } from 'webpack'
import * as path from 'path'

type Options = {
  context: string
  content: string
}

export default function interpolateName(
  loaderResourcePath: string,
  loaderResourceQuery: string,
  name: string,
  options: Options
): string {
  const filename = name || '[hash].[ext]'

  const context = options.context
  const content = options.content

  let ext = 'bin'
  let basename = 'file'
  let directory = ''
  let folder = ''
  let query = ''

  if (loaderResourcePath) {
    const parsed = path.parse(loaderResourcePath)
    let resourcePath = loaderResourcePath

    if (parsed.ext) {
      ext = parsed.ext.slice(1)
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
      directory = directory.slice(0, directory.length - 1)
    } else {
      directory = resourcePath.replace(/\\/g, '/').replace(/\.\.(\/)?/g, '_$1')
    }

    if (directory.length === 1) {
      directory = ''
    } else if (directory.length > 1) {
      folder = path.basename(directory)
    }
  }

  if (loaderResourceQuery && loaderResourceQuery.length > 1) {
    query = loaderResourceQuery

    const hashIdx = query.indexOf('#')

    if (hashIdx >= 0) {
      query = query.slice(0, hashIdx)
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

  return url
}
