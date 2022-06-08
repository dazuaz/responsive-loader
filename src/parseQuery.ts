import * as JSON5 from 'json5'

interface LooseObject {
  [key: string]: any
}

const specialValues: LooseObject = {
  null: null,
  true: true,
  false: false,
}

function parseQuery(query: string): LooseObject {
  if (query.slice(0, 1) !== '?') {
    throw new Error("A valid query string passed to parseQuery should begin with '?'")
  }

  query = query.slice(1)

  if (!query) {
    return {}
  }

  if (query.slice(0, 1) === '{' && query.slice(-1) === '}') {
    return JSON5.parse(query)
  }

  const queryArgs = query.split(/[,&]/g)
  const result: LooseObject = {}

  queryArgs.forEach((arg) => {
    const idx = arg.indexOf('=')

    if (idx >= 0) {
      let name = arg.slice(0, idx)
      let value = decodeURIComponent(arg.slice(idx + 1))
      // const specialValues: LooseObject = {}

      // eslint-disable-next-line no-prototype-builtins
      if (specialValues.hasOwnProperty(value)) {
        value = specialValues[value]
      }
      if (name.slice(-2) === '[]') {
        name = decodeURIComponent(name.slice(0, name.length - 2))

        if (!Array.isArray(result[name])) {
          result[name] = []
        }

        result[name].push(value)
      } else {
        name = decodeURIComponent(name)
        result[name] = value
      }
    } else {
      if (arg.slice(0, 1) === '-') {
        result[decodeURIComponent(arg.slice(1))] = false
      } else if (arg.slice(0, 1) === '+') {
        result[decodeURIComponent(arg.slice(1))] = true
      } else {
        result[decodeURIComponent(arg)] = true
      }
    }
  })

  return result
}
export { parseQuery }
