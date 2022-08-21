/**
 * Filesystem Cache
 *
 * Given a file and a transform function, cache the result into files
 * or retrieve the previously cached files if the given file is already known.
 *
 * @see https://github.com/babel/babel-loader/
 */
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as zlib from 'zlib'
import * as crypto from 'crypto'
import * as findCacheDir from 'find-cache-dir'
import * as makeDir from 'make-dir'
import { promisify } from 'util'
import { CacheOptions, TransformParams } from './types'
import { transform } from '.'

// Lazily instantiated when needed
let defaultCacheDirectory: string | null = null

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const gunzip = promisify(zlib.gunzip)
const gzip = promisify(zlib.gzip)

/**
 * Read the contents from the compressed file.
 *
 * @async
 * @params {String} filename
 * @params {Boolean} compress
 */
const read = async function (filename: string, compress: boolean) {
  const data = await readFile(filename + (compress ? '.gz' : ''))
  const content = compress ? await gunzip(data) : data

  return JSON.parse(content.toString())
}

/**
 * Write contents into a compressed file.
 *
 * @async
 * @params {String} filename
 * @params {Boolean} compress
 * @params {String} result
 */
const write = async function (filename: string, compress: boolean, result: string) {
  const content = JSON.stringify(result)

  const data = compress ? await gzip(content) : content
  return await writeFile(filename + (compress ? '.gz' : ''), data)
}

/**
 * Build the filename for the cached file
 *
 * @params {String} source  File source code
 * @params {Object} options Options used
 *
 * @return {String}
 */
const filename = function (source: string, identifier: string) {
  const hash = crypto.createHash('md4')

  const contents = JSON.stringify({ source, identifier })

  hash.update(contents)

  return hash.digest('hex') + '.json'
}

/**
 * Handle the cache
 *
 * @params {String} directory
 * @params {Object} params
 */
const handleCache = async function (
  directory: string,
  cacheOptions: CacheOptions,
  params: TransformParams
): Promise<string> {
  const { cacheIdentifier, cacheDirectory, cacheCompression } = cacheOptions

  const file = path.join(directory, filename(params.resourcePath, cacheIdentifier))

  try {
    // No errors mean that the file was previously cached
    // we just need to return it
    return await read(file, cacheCompression)
  } catch (err) {
    // continue regardless of error
  }

  const fallback = typeof cacheDirectory !== 'string' && directory !== os.tmpdir()

  // Make sure the directory exists.
  try {
    await makeDir(directory)
  } catch (err) {
    if (fallback) {
      return handleCache(os.tmpdir(), cacheOptions, params)
    }

    throw err
  }

  // Otherwise just transform the file
  // return it to the user asap and write it in cache
  const result = await transform(params)

  try {
    await write(file, cacheCompression, result)
  } catch (err) {
    if (fallback) {
      // Fallback to tmpdir if node_modules folder not writable
      return handleCache(os.tmpdir(), cacheOptions, params)
    }

    throw err
  }

  return result
}

/**
 * Retrieve file from cache, or create a new one for future reads
 *
 * @async
 * @param  {CacheOptions}   cacheOptions
 * @param  {TransformParams}   transformParams  Options to be given to the transform fn
 *
 */

export async function cache(cacheOptions: CacheOptions, transformParams: TransformParams): Promise<string> {
  let directory

  if (typeof cacheOptions.cacheDirectory === 'string') {
    directory = cacheOptions.cacheDirectory
  } else {
    if (defaultCacheDirectory === null) {
      defaultCacheDirectory = findCacheDir({ name: 'responsive-loader' }) || os.tmpdir()
    }

    directory = defaultCacheDirectory
  }

  return await handleCache(directory, cacheOptions, transformParams)
}
