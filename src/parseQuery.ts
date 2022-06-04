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
  if (query.substring(0, 1) !== '?') {
    throw new Error("A valid query string passed to parseQuery should begin with '?'")
  }

  query = query.substring(1)

  if (!query) {
    return {}
  }

  if (query.substring(0, 1) === '{' && query.substring(-1) === '}') {
    return JSON5.parse(query)
  }

  const queryArgs = query.split(/[,&]/g)
  const result: LooseObject = {}

  queryArgs.forEach((arg) => {
    const idx = arg.indexOf('=')

    if (idx >= 0) {
      let name = arg.substr(0, idx)
      let value = decodeURIComponent(arg.substr(idx + 1))
      // const specialValues: LooseObject = {}

      // eslint-disable-next-line no-prototype-builtins
      if (specialValues.hasOwnProperty(value)) {
        value = specialValues[value]
      }
      if (name.substring(-2) === '[]') {
        name = decodeURIComponent(name.substring(0, name.length - 2))

        if (!Array.isArray(result[name])) {
          result[name] = []
        }

        result[name].push(value)
      } else {
        name = decodeURIComponent(name)
        result[name] = value
      }
    } else {
      if (arg.substring(0, 1) === '-') {
        result[decodeURIComponent(arg.substring(1))] = false
      } else if (arg.substring(0, 1) === '+') {
        result[decodeURIComponent(arg.substring(1))] = true
      } else {
        result[decodeURIComponent(arg)] = true
      }
    }
  })

  return result
}
export { parseQuery }
