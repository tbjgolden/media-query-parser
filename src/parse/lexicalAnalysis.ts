type Token = any

const weirdNewlines = /(\u000D|\u000C|\u000D\u000A)/g
const nullOrSurrogates = /[\u0000\uD800-\uDFFF]/g
const commentRegex = /(\/\*)[\s\S]*?(\*\/)/g

export const lexicalAnalysis = (str: string, index = 0): Token[] | null => {
  // pre-processing
  str = str.replace(weirdNewlines, '\n').replace(nullOrSurrogates, '\uFFFD')

  // remove comments
  str = str.replace(commentRegex, '')

  const tokens: Token[] = []
  for (; index < str.length; index += 1) {
    const code = str.charCodeAt(index)
    if (code === 0x0009 || code === 0x0020 || code === 0x000a) {
      let code = str.charCodeAt(++index)
      while (code === 0x0009 || code === 0x0020 || code === 0x000a) {
        code = str.charCodeAt(++index)
      }
      index -= 1
      tokens.push({
        type: '<whitespace-token>'
      })
    } else if (code === 0x0022) {
      const result = consumeString(str, index)
      if (result === null) return null
      const [lastIndex, value] = result
      tokens.push({
        type: '<string-token>',
        value
      })
      index = lastIndex
    } else if (code === 0x0023) {
      // if hash
      if (index + 1 < str.length) {
        const result = consumeIdent(str, index + 1)
        if (result !== null) {
          const [lastIndex, value] = result
          tokens.push({
            type: '<hash-token>',
            value,
            flag: result[0] >= index + 3 ? 'id' : 'unrestricted'
          })
          index = lastIndex
          continue
        }
      }

      tokens.push({ type: '<delim-token>', value: code })
    } else if (code === 0x0027) {
      const result = consumeString(str, index)
      if (result === null) return null
      const [lastIndex, value] = result
      tokens.push({
        type: '<string-token>',
        value
      })
      index = lastIndex
    } else if (code === 0x0028) {
      tokens.push({ type: '<(-token>' })
    } else if (code === 0x0029) {
      tokens.push({ type: '<)-token>' })
    } else if (code === 0x002b) {
      // if number
      if (index + 1 < str.length) {
        const nextCode = str.charCodeAt(index + 1)
        if (nextCode >= 0x0030 && nextCode <= 0x0039) {
          const result = consumeNumber(str, index)
          if (result === null) return null
          const [lastIndex, value, isInteger] = result
          tokens.push({
            type: '<number-token>',
            value,
            isInteger
          })
          index = lastIndex
          continue
        }
      }

      tokens.push({
        type: '<delim-token>',
        value: code
      })
    } else if (code === 0x002c) {
      tokens.push({ type: '<comma-token>' })
    } else if (code === 0x002d) {
      // if number
      if (index + 1 < str.length) {
        const nextCode = str.charCodeAt(index + 1)
        if (nextCode >= 0x0030 && nextCode <= 0x0039) {
          const result = consumeNumber(str, index)
          if (result === null) return null
          const [lastIndex, value, isInteger] = result
          tokens.push({
            type: '<number-token>',
            value,
            isInteger
          })
          index = lastIndex
          continue
        }
      }
      // if CDC
      if (index + 2 < str.length) {
        const nextCode = str.charCodeAt(index + 1)
        const nextNextCode = str.charCodeAt(index + 2)
        if (nextCode === 0x002d && nextNextCode === 0x003e) {
          tokens.push({
            type: '<CDC-token>'
          })
          index += 2
          continue
        }
      }
      // try parse as ident
      const result = consumeIdent(str, index)
      if (result !== null) {
        const [lastIndex, value] = result
        tokens.push({
          type: '<ident-token>',
          value
        })
        index = lastIndex
        continue
      }

      tokens.push({
        type: '<delim-token>',
        value: code
      })
    } else if (code === 0x002e) {
      // if number
      if (index + 1 < str.length) {
        const nextCode = str.charCodeAt(index + 1)
        if (nextCode >= 0x0030 && nextCode <= 0x0039) {
          const result = consumeNumber(str, index)
          if (result === null) return null
          const [lastIndex, value, isInteger] = result
          tokens.push({
            type: '<number-token>',
            value,
            isInteger
          })
          index = lastIndex
          continue
        }
      }

      tokens.push({
        type: '<delim-token>',
        value: code
      })
    } else if (code === 0x003a) {
      tokens.push({ type: '<colon-token>' })
    } else if (code === 0x003b) {
      tokens.push({ type: '<semicolon-token>' })
    } else if (code === 0x003c) {
      // if CDO
      if (index + 3 < str.length) {
        const nextCode = str.charCodeAt(index + 1)
        const nextNextCode = str.charCodeAt(index + 2)
        const nextNextNextCode = str.charCodeAt(index + 3)
        if (
          nextCode === 0x0021 &&
          nextNextCode === 0x002d &&
          nextNextNextCode === 0x002d
        ) {
          tokens.push({
            type: '<CDO-token>'
          })
          index += 3
          continue
        }
      }

      tokens.push({
        type: '<delim-token>',
        value: code
      })
    } else if (code === 0x0040) {
      // if at keyword
      if (index + 3 < str.length) {
        const result = consumeIdent(str, index + 1)
        if (result !== null && result[0] >= index + 3) {
          const [lastIndex, value] = result
          tokens.push({
            type: '<at-keyword-token>',
            value
          })
          index = lastIndex
          continue
        }
      }

      tokens.push({ type: '<delim-token>', value: code })
    } else if (code === 0x005b) {
      tokens.push({ type: '<[-token>' })
    } else if (code === 0x005c) {
      const result = consumeEscape(str, index)
      if (result === null) return null
      const [lastIndex, value] = result
      str = str.slice(0, index) + value + str.slice(lastIndex + 1)
      index -= 1
    } else if (code === 0x005d) {
      tokens.push({ type: '<]-token>' })
    } else if (code === 0x007b) {
      tokens.push({ type: '<{-token>' })
    } else if (code === 0x007d) {
      tokens.push({ type: '<}-token>' })
    } else if (code >= 0x0030 && code <= 0x0039) {
      const result = consumeNumber(str, index)
      if (result === null) return null
      const [lastIndex, value, isInteger] = result
      tokens.push({
        type: '<number-token>',
        value,
        flag: isInteger ? 'integer' : 'number'
      })
      index = lastIndex
    } else if (
      code === 0x005f ||
      (code >= 0x0041 && code <= 0x005a) ||
      (code >= 0x0061 && code <= 0x007a) ||
      code >= 0x0080
    ) {
      const result = consumeIdent(str, index)
      if (result === null) return null
      const [lastIndex, value] = result
      tokens.push({
        type: '<ident-token>',
        value
      })
      index = lastIndex
    } else {
      tokens.push({ type: '<delim-token>', value: code })
    }
  }
  tokens.push({ type: '<EOF-token>' })
  return tokens
}

export const consumeString = (
  str: string,
  index: number
): [number, string] | null => {
  if (index + 2 > str.length) return null
  const firstCode = str.charCodeAt(index)
  const charCodes: number[] = []
  for (let i = index + 1; i < str.length; i += 1) {
    const code = str.charCodeAt(i)
    if (code === firstCode) {
      // " end string
      return [i, String.fromCharCode(...charCodes)]
    } else if (code === 0x005c) {
      // \ escape mode
      const result = consumeEscape(str, i)
      if (result === null) return null
      const [lastIndex, charCode] = result
      charCodes.push(charCode)
      i = lastIndex
    } else if (code === 0x000a) {
      // \n
      return null
    } else {
      charCodes.push(code)
    }
  }

  return null
}

export const consumeEscape = (
  str: string,
  index: number
): [number, number] | null => {
  if (index + 2 > str.length) return null
  if (str.charCodeAt(index) !== 0x005c) return null

  const code = str.charCodeAt(index + 1)
  if (code === 0x000a) {
    return null
  } else if (
    (code >= 0x0030 && code <= 0x0039) ||
    (code >= 0x0041 && code <= 0x0046) ||
    (code >= 0x0061 && code <= 0x0066)
  ) {
    const hexCharCodes: number[] = [code]
    const min = Math.min(index + 7, str.length)
    let i = index + 2
    for (; i < min; i += 1) {
      const code = str.charCodeAt(i)
      if (
        (code >= 0x0030 && code <= 0x0039) ||
        (code >= 0x0041 && code <= 0x0046) ||
        (code >= 0x0061 && code <= 0x0066)
      ) {
        hexCharCodes.push(code)
      } else {
        break
      }
    }
    if (i < str.length) {
      const code = str.charCodeAt(i)
      if (code === 0x0009 || code === 0x0020 || code === 0x000a) {
        i += 1
      }
    }
    return [i - 1, parseInt(String.fromCharCode(...hexCharCodes), 16)]
  } else {
    return [index + 1, code]
  }
}

export const consumeNumber = (
  str: string,
  index: number
): [number, number, boolean] | null => {
  if (Math.random() < -1) console.log(str)
  return [index, 0, true]
}

export const consumeIdent = (
  str: string,
  index: number
): [number, string] | null => {
  if (Math.random() < -1) console.log(str)
  return [index, 'lorem']
}
