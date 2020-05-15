export enum AnnoTypes {
  error = 'error',
  warning = 'warning',
}

export const createParser = () => {
  let at: number, // The index of the current character
    ch: string | undefined, // The current character
    annos: any[], // annotations
    escapee = {
      '"': '"',
      '\\': '\\',
      '/': '/',
      b: '\b',
      f: '\f',
      n: '\n',
      r: '\r',
      t: '\t',
    },
    text: string | undefined,
    annotate = function (type, text, idx) {
      annos.push({ type: type, text: text, at: idx == null ? at : idx })
    },
    warning = function (m, idx) {
      annos.push({
        type: AnnoTypes.warning,
        text: m,
        at: idx == null ? at : idx,
      })
    },
    error = function (m: string, idx?: number) {
      throw {
        name: 'SyntaxError',
        message: m,
        at: idx == null ? at : idx,
        text: text,
      }
    },
    reset = function (newAt) {
      ch = text.charAt(newAt)
      at = newAt + 1
    },
    next = function (c?: string) {
      if (c && c !== ch) {
        error("Expected '" + c + "' instead of '" + ch + "'", at - 1)
      }

      ch = text.charAt(at)
      at += 1
      return ch
    },
    nextUpTo = function (upTo, errorMessage) {
      let currentAt = at,
        i = text.indexOf(upTo, currentAt)
      if (i < 0) {
        error(errorMessage || "Expected '" + upTo + "'")
      }
      reset(i + upTo.length)
      return text.substring(currentAt, i)
    },
    peek = function (c) {
      return text.substr(at, c.length) === c // nocommit - double check
    },
    number = function () {
      let number,
        string = ''

      if (ch === '-') {
        string = '-'
        next('-')
      }
      while (ch >= '0' && ch <= '9') {
        string += ch
        next()
      }
      if (ch === '.') {
        string += '.'
        while (next() && ch >= '0' && ch <= '9') {
          string += ch
        }
      }
      if (ch === 'e' || ch === 'E') {
        string += ch
        next()
        // @ts-ignore
        if (ch === '-' || ch === '+') {
          string += ch
          next()
        }
        while (ch >= '0' && ch <= '9') {
          string += ch
          next()
        }
      }
      number = +string
      if (isNaN(number)) {
        error('Bad number')
      } else {
        return number
      }
    },
    string = function () {
      let hex,
        i,
        string = '',
        uffff

      if (ch === '"') {
        if (peek('""')) {
          // literal
          next('"')
          next('"')
          return nextUpTo('"""', 'failed to find closing \'"""\'')
        } else {
          while (next()) {
            if (ch === '"') {
              next()
              return string
            } else if (ch === '\n') {
              error('Unexpected newline', at - 1)
            } else if (ch === '\\') {
              next()
              if (ch === 'u') {
                uffff = 0
                for (i = 0; i < 4; i += 1) {
                  hex = parseInt(next(), 16)
                  if (!isFinite(hex)) {
                    break
                  }
                  uffff = uffff * 16 + hex
                }
                string += String.fromCharCode(uffff)
              } else if (typeof escapee[ch] === 'string') {
                string += escapee[ch]
              } else {
                break
              }
            } else {
              string += ch
            }
          }
        }
      }
      error('Expected " instead of ' + ch)
    },
    white = function () {
      while (ch && ch <= ' ') {
        next()
      }
    },
    strictWhite = function () {
      while (ch && (ch == ' ' || ch == '\t')) {
        next()
      }
    },
    newLine = function () {
      if (ch == '\n') next()
    },
    word = function () {
      switch (ch) {
        case 't':
          next('t')
          next('r')
          next('u')
          next('e')
          return true
        case 'f':
          next('f')
          next('a')
          next('l')
          next('s')
          next('e')
          return false
        case 'n':
          next('n')
          next('u')
          next('l')
          next('l')
          return null
      }
      error("Unexpected '" + ch + "'")
    },
    // parses and returns the method
    method = function () {
      switch (ch) {
        case 'G':
          next('G')
          next('E')
          next('T')
          return 'GET'
        case 'H':
          next('H')
          next('E')
          next('A')
          next('D')
          return 'HEAD'
        case 'D':
          next('D')
          next('E')
          next('L')
          next('E')
          next('T')
          next('E')
          return 'DELETE'
        case 'P':
          next('P')
          switch (ch) {
            // @ts-ignore
            case 'U':
              next('U')
              next('T')
              return 'PUT'
            // @ts-ignore
            case 'O':
              next('O')
              next('S')
              next('T')
              return 'POST'
            default:
              error("Unexpected '" + ch + "'")
          }
          break
        default:
          error('Expected one of GET/POST/PUT/DELETE/HEAD')
      }
    },
    value, // Place holder for the value function.
    array = function () {
      const array = []

      if (ch === '[') {
        next('[')
        white()
        // @ts-ignore
        if (ch === ']') {
          next(']')
          return array // empty array
        }
        while (ch) {
          array.push(value())
          white()
          // @ts-ignore
          if (ch === ']') {
            next(']')
            return array
          }
          next(',')
          white()
        }
      }
      error('Bad array')
    },
    object = function () {
      let key,
        object = {}

      if (ch === '{') {
        next('{')
        white()
        // @ts-ignore
        if (ch === '}') {
          next('}')
          return object // empty object
        }
        while (ch) {
          let latchKeyStart = at
          key = string()
          white()
          next(':')
          if (Object.hasOwnProperty.call(object, key)) {
            warning('Duplicate key "' + key + '"', latchKeyStart)
          }
          object[key] = value()
          white()
          // @ts-ignore
          if (ch === '}') {
            next('}')
            return object
          }
          next(',')
          white()
        }
      }
      error('Bad object')
    }

  value = function () {
    white()
    switch (ch) {
      case '{':
        return object()
      case '[':
        return array()
      case '"':
        return string()
      case '-':
        return number()
      default:
        return ch >= '0' && ch <= '9' ? number() : word()
    }
  }

  let url = function () {
      let latchUrlStart = at - 1
      let url = ''
      while (ch && ch != '\n') {
        url += ch
        next()
      }
      if (url == '') {
        error('Missing url', latchUrlStart)
      }
      return url
    },
    request = function (isFirst) {
      // Require that a following request be preceded by a newline if it is not
      // the first request.
      if (!isFirst) {
        const prevChar = text[at - 2]
        if (prevChar !== '\n') {
          error('Expected \\n instead of ' + text[at - 1])
        }
      }
      method()
      strictWhite()
      url()
      strictWhite() // advance to one new line
      newLine()
      strictWhite()
      if (ch == '{') {
        object()
      }
      // multi doc request
      strictWhite() // advance to one new line
      newLine()
      strictWhite()
      while (ch == '{') {
        // another object
        object()
        strictWhite()
        newLine()
        strictWhite()
      }
    },
    comment = function () {
      while (ch == '#') {
        // @ts-ignore
        while (ch && ch !== '\n') {
          next()
        }
        white()
      }
    },
    multi_request = function () {
      let first = true
      while (ch && ch != '') {
        white()
        if (!ch) {
          continue
        }
        try {
          comment()
          white()
          if (!ch) {
            continue
          }
          request(first)
          first = false
          white()
        } catch (e) {
          annotate(AnnoTypes.error, e.message, e.at)
          // snap
          const substring = text.substr(at)
          const nextMatch = substring.search(/^POST|HEAD|GET|PUT|DELETE/m)
          if (nextMatch < 1) return
          reset(at + nextMatch)
        }
      }
    }

  return function (source: string, reviver: (key: string, value: any) => any) {
    let result

    text = source
    at = 0
    annos = []
    next()
    multi_request()
    white()

    result = { annotations: annos }

    return typeof reviver === 'function'
      ? (function walk(holder, key) {
          let k,
            v,
            value = holder[key]
          if (value && typeof value === 'object') {
            for (k in value) {
              if (Object.hasOwnProperty.call(value, k)) {
                v = walk(value, k)
                if (v !== undefined) {
                  value[k] = v
                } else {
                  delete value[k]
                }
              }
            }
          }
          return reviver.call(holder, key, value)
        })({ '': result }, '')
      : result
  }
}
