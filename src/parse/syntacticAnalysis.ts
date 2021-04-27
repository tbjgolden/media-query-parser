import { lexicalAnalysis, Token } from './lexicalAnalysis'

export const tokenize = (str: string): MediaQueryToken[] | null => {
  let tokenList = lexicalAnalysis(str.trim())

  // failed tokenizing
  if (tokenList === null) return null

  // trim the @media and { where applicable
  let startIndex = 0
  let endIndex = tokenList.length - 1
  if (
    tokenList[0].type === '<at-keyword-token>' &&
    tokenList[0].value === 'media'
  ) {
    if (tokenList[1].type !== '<whitespace-token>') return null

    startIndex = 2
    for (let i = 2; i < tokenList.length - 1; i++) {
      const token = tokenList[i]
      if (token.type === '<{-token>') {
        endIndex = i
        break
      } else if (token.type === '<semicolon-token>') {
        return null
      }
    }
  }

  tokenList = tokenList.slice(startIndex, endIndex)

  return syntacticAnalysis(tokenList)
}

export const removeWhitespace = (tokenList: Token[]): Token[] => {
  const newTokenList: Token[] = []

  for (let i = 0; i < tokenList.length; i++) {
    if (tokenList[i].type !== '<whitespace-token>') {
      newTokenList.push(tokenList[i])
    }
  }

  return newTokenList
}

export const syntacticAnalysis = (
  tokenList: Token[]
): MediaQueryToken[] | null => {
  const mediaQueryList: Array<Array<Token>> = [[]]
  for (let i = 0; i < tokenList.length; i++) {
    const token = tokenList[i]
    if (token.type === '<comma-token>') {
      mediaQueryList.push([])
    } else {
      mediaQueryList[mediaQueryList.length - 1].push(token)
    }
  }

  const mediaQueries = mediaQueryList.map(removeWhitespace)
  if (mediaQueries.length === 1 && mediaQueries[0].length === 0) {
    // '@media {' is fine, treat as all
    return [
      tokenizeMediaQuery([
        { type: '<ident-token>', value: 'all' }
      ]) as MediaQueryToken
    ]
  } else if (mediaQueries.some((mediaQuery) => mediaQuery.length === 0)) {
    // but '@media screen, {' is not
    return null
  } else {
    const mediaQueryTokens = mediaQueries.map(tokenizeMediaQuery)
    const nonNullMediaQueryTokens: MediaQueryToken[] = []

    for (const mediaQueryToken of mediaQueryTokens) {
      if (mediaQueryToken !== null) {
        nonNullMediaQueryTokens.push(mediaQueryToken)
      }
    }

    return nonNullMediaQueryTokens
  }
}

export type MediaQueryToken = {
  type: 'MediaQuery'
  data?: { [k: string]: any }
}

export const tokenizeMediaQuery = (tokens: Token[]): MediaQueryToken | null => {
  const firstToken = tokens[0]
  if (firstToken.type === '<(-token>') {
    tokenizeMediaCondition(tokens)

    return {
      type: 'MediaQuery',
      data: {
        tokens
      }
    }
  } else if (firstToken.type === '<ident-token>') {
    let unaryOperator: 'not' | 'only' | null = null
    let mediaType: 'print' | 'screen' | boolean = true

    const { value } = firstToken
    if (value === 'only' || value === 'not') {
      unaryOperator = value
    }

    const firstIndex = unaryOperator === null ? 0 : 1

    if (tokens.length <= firstIndex) return null

    const firstNonUnaryToken = tokens[firstIndex]

    if (firstNonUnaryToken.type === '<ident-token>') {
      const { value } = firstNonUnaryToken

      if (value === 'all') {
        mediaType = true
      } else if (value === 'print' || value === 'screen') {
        mediaType = value
      } else if (
        value === 'tty' ||
        value === 'tv' ||
        value === 'projection' ||
        value === 'handheld' ||
        value === 'braille' ||
        value === 'embossed' ||
        value === 'aural' ||
        value === 'speech'
      ) {
        mediaType = false
      } else {
        return null
      }
    } else {
      return null
    }

    if (firstIndex + 1 === tokens.length) {
      console.log(unaryOperator, mediaType)

      return {
        type: 'MediaQuery',
        data: {
          tokens
        }
      }
    } else if (firstIndex + 4 < tokens.length) {
      const secondNonUnaryToken = tokens[firstIndex + 1]
      if (
        secondNonUnaryToken.type === '<ident-token>' &&
        secondNonUnaryToken.value === 'and'
      ) {
        tokenizeMediaCondition(tokens.slice(firstIndex + 2))

        return {
          type: 'MediaQuery',
          data: {
            tokens
          }
        }
      } else {
        return null
      }
    } else {
      return null
    }
  } else {
    return null
  }
}

export const tokenizeMediaCondition = (
  tokens: Token[],
  previousOperator: 'and' | 'or' | 'not' | null = null
): any | null => {
  console.log(previousOperator, tokens)

  // parse the first media feature (deeply if wrapped in parentheses)
  // pass in "and", "not", "or", null as previously encountered boolean operators

  if (
    tokens.length < 3 ||
    tokens[0].type !== '<(-token>' ||
    tokens[tokens.length - 1].type !== '<)-token>'
  ) {
    return null
  }

  let endIndexOfFirstFeature = tokens.length - 1
  let maxDepth = 0
  let count = 0
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type === '<(-token>') {
      count += 1
      maxDepth = Math.max(maxDepth, count)
    } else if (token.type === '<)-token>') {
      count -= 1
    }
    if (count === 0) {
      endIndexOfFirstFeature = i
      break
    }
  }

  let mediaFeature
  const featureTokens = tokens.slice(0, endIndexOfFirstFeature + 1)
  if (maxDepth === 1) {
    mediaFeature = [tokenizeMediaFeature(featureTokens)]
  } else {
    mediaFeature = tokenizeMediaCondition(featureTokens)
  }

  if (endIndexOfFirstFeature === tokens.length - 1) {
    return [mediaFeature]
  } else {
    // read for a boolean op "and", "not", "or"
    const nextToken = tokens[endIndexOfFirstFeature + 1]
    if (
      nextToken.type !== '<ident-token>' ||
      (nextToken.value !== 'and' &&
        nextToken.value !== 'or' &&
        nextToken.value !== 'not') ||
      (previousOperator !== null && previousOperator !== nextToken.value)
    ) {
      return null
    }
    return [
      mediaFeature,
      ...tokenizeMediaCondition(
        tokens.slice(endIndexOfFirstFeature + 2),
        nextToken.value
      )
    ]
  }
}

export const tokenizeMediaFeature = (tokens: Token[]): any | null => {
  console.log(tokens)
  return null
}
