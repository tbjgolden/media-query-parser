import { lexicalAnalysis, Token } from './lexicalAnalysis'

export const tokenize = (
  str: string,
  index: number
): MediaQueryListToken | null => {
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

export const syntacticAnalysis = (
  tokenList: Token[]
): MediaQueryListToken | null => {
  return tokenizeMediaQueryList(tokenList, 0)
}

export type UnknownToken =
  | MediaQueryToken
  | MediaTypeToken
  | MediaConditionToken
  | MediaConditionWithoutOrToken
  | MediaNotToken
  | MediaAndToken
  | MediaOrToken
  | MediaInParensToken
  | MediaFeatureToken
  | MFPlainToken
  | MFBooleanToken
  | MFRangeToken
  | MFNameToken
  | MFValueToken
  | MFLTToken
  | MFGTToken
  | MFEqToken
  | MFComparisonToken
  | GeneralEnclosedToken
  | IdentToken
  | NumberToken
  | DimensionToken
  | RatioToken
export type MediaQueryListToken = {
  type: 'MediaQueryList'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type MediaQueryToken = {
  type: 'MediaQuery'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type MediaTypeToken = {
  type: 'MediaType'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type MediaConditionToken = {
  type: 'MediaCondition'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type MediaConditionWithoutOrToken = {
  type: 'MediaConditionWithoutOr'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type MediaNotToken = {
  type: 'MediaNot'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type MediaAndToken = {
  type: 'MediaAnd'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type MediaOrToken = {
  type: 'MediaOr'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type MediaInParensToken = {
  type: 'MediaInParens'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type MediaFeatureToken = {
  type: 'MediaFeature'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type MFPlainToken = {
  type: 'MfPlain'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type MFBooleanToken = {
  type: 'MFBoolean'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type MFRangeToken = {
  type: 'MFRange'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type MFNameToken = {
  type: 'MFName'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type MFValueToken = {
  type: 'MFValue'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type MFLTToken = {
  type: 'MFLT'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type MFGTToken = {
  type: 'MFGT'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type MFEqToken = {
  type: 'MFEq'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type MFComparisonToken = {
  type: 'MFComparison'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type GeneralEnclosedToken = {
  type: 'GeneralEnclosed'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type IdentToken = {
  type: 'Ident'
  data?: { [k: string]: any }
}
export type NumberToken = {
  type: 'Number'
  data?: { [k: string]: any }
}
export type DimensionToken = {
  type: 'Dimension'
  data?: { [k: string]: any }
}
export type RatioToken = {
  type: 'Ratio'
  data?: { [k: string]: any }
}

const toFragments = (str: string): string[] => {
  return str.trim().split(/\s+/g)
}

const map = <
  T,
  U extends
    | string
    | number
    | boolean
    | symbol
    | bigint
    | Record<string, unknown>
>(
  arr: T[],
  fn: (value: T) => U | null
): U[] => {
  return arr.reduce<U[]>((arr, input) => {
    const result = fn(input)
    if (result !== null) arr.push(result)
    return arr
  }, [])
}

const tokenizeMediaQueryList = (
  tokens: Token[],
  index: number
): MediaQueryListToken | null => {
  // const mediaQueries = str
  //   .split(',')
  //   .map((str) => str.trim())
  //   .filter(Boolean)
  return {
    type: 'MediaQueryList',
    data: {
      tokens,
      index
    }
    // children: map(mediaQueries, tokenizeMediaQuery)
  }
}

/*
<media-query> = <media-condition>
             | [ not | only ]? <media-type> [ and <media-condition-without-or> ]?

// okay so what can it start with?
not | only | <ident> | (
> <media-condition> = <media-not> | <media-in-parens> [ <media-and>* | <media-or>* ]
> <media-type> = <ident>
>> <media-not> = not
>> <media-in-parens> = '(' | [<ident> '(']
>> <ident> = tokenizeIdent and not other
*/
export const tokenizeMediaQuery = (
  tokens: Token[],
  index: number
): MediaQueryToken | null => {
  return {
    type: 'MediaQuery',
    data: {
      tokens,
      index
    }
  }
}

/*
<media-type> = <ident>
*/
export const tokenizeMediaType = (
  tokens: Token[],
  index: number
): MediaTypeToken | null => {
  return {
    type: 'MediaType',
    data: {
      tokens,
      index
    }
  }
}

/*
<media-condition> = <media-not> | <media-in-parens> [ <media-and>* | <media-or>* ]
*/
export const tokenizeMediaCondition = (
  tokens: Token[],
  index: number
): MediaConditionToken | null => {
  return {
    type: 'MediaCondition',
    data: {
      tokens,
      index
    }
  }
}

/*
<media-condition-without-or> = <media-not> | <media-in-parens> <media-and>*
*/
export const tokenizeMediaConditionWithoutOr = (
  tokens: Token[],
  index: number
): MediaConditionWithoutOrToken | null => {
  return {
    type: 'MediaConditionWithoutOr',
    data: {
      tokens,
      index
    }
  }
}

/*
<media-not> = not <media-in-parens>
*/
export const tokenizeMediaNot = (
  tokens: Token[],
  index: number
): MediaNotToken | null => {
  return {
    type: 'MediaNot',
    data: {
      tokens,
      index
    }
  }
}

/*
<media-and> = and <media-in-parens>
*/
export const tokenizeMediaAnd = (
  tokens: Token[],
  index: number
): MediaAndToken | null => {
  return {
    type: 'MediaAnd',
    data: {
      tokens,
      index
    }
  }
}

/*
<media-or> = or <media-in-parens>
*/
export const tokenizeMediaOr = (
  tokens: Token[],
  index: number
): MediaOrToken | null => {
  return {
    type: 'MediaOr',
    data: {
      tokens,
      index
    }
  }
}

/*
<media-in-parens> = ( <media-condition> ) | <media-feature> | <general-enclosed>
*/
export const tokenizeMediaInParens = (
  tokens: Token[],
  index: number
): MediaInParensToken | null => {
  return {
    type: 'MediaInParens',
    data: {
      tokens,
      index
    }
  }
}

/*
<media-feature> = ( [ <mf-plain> | <mf-boolean> | <mf-range> ] )
*/
export const tokenizeMediaFeature = (
  tokens: Token[],
  index: number
): MediaFeatureToken | null => {
  return {
    type: 'MediaFeature',
    data: {
      tokens,
      index
    }
  }
}

/*
<mf-plain> = <mf-name> : <mf-value>
*/
export const tokenizeMfPlain = (
  tokens: Token[],
  index: number
): MFPlainToken | null => {
  return {
    type: 'MfPlain',
    data: {
      tokens,
      index
    }
  }
}

/*
<mf-boolean> = <mf-name>
*/
export const tokenizeMFBoolean = (
  tokens: Token[],
  index: number
): MFBooleanToken | null => {
  return {
    type: 'MFBoolean',
    data: {
      tokens,
      index
    }
  }
}

/*
<mf-range> = <mf-name> <mf-comparison> <mf-value>
           | <mf-value> <mf-comparison> <mf-name>
           | <mf-value> <mf-lt> <mf-name> <mf-lt> <mf-value>
           | <mf-value> <mf-gt> <mf-name> <mf-gt> <mf-value>
*/
export const tokenizeMFRange = (
  tokens: Token[],
  index: number
): MFRangeToken | null => {
  return {
    type: 'MFRange',
    data: {
      tokens,
      index
    }
  }
}

/*
<mf-name> = <ident>
*/
export const tokenizeMFName = (
  tokens: Token[],
  index: number
): MFNameToken | null => {
  return {
    type: 'MFName',
    data: {
      tokens,
      index
    }
  }
}

/*
<mf-value> = <number> | <dimension> | <ident> | <ratio>
*/
export const tokenizeMFValue = (
  tokens: Token[],
  index: number
): MFValueToken | null => {
  return {
    type: 'MFValue',
    data: {
      tokens,
      index
    }
  }
}

/*
<mf-lt> = '<' '='?
*/
export const tokenizeMFLT = (
  tokens: Token[],
  index: number
): MFLTToken | null => {
  return {
    type: 'MFLT',
    data: {
      tokens,
      index
    }
  }
}

/*
<mf-gt> = '>' '='?
*/
export const tokenizeMFGT = (
  tokens: Token[],
  index: number
): MFGTToken | null => {
  return {
    type: 'MFGT',
    data: {
      tokens,
      index
    }
  }
}

/*
<mf-eq> = '='
*/
export const tokenizeMFEq = (
  tokens: Token[],
  index: number
): MFEqToken | null => {
  return {
    type: 'MFEq',
    data: {
      tokens,
      index
    }
  }
}

/*
<mf-comparison> = <mf-lt> | <mf-gt> | <mf-eq>
*/
export const tokenizeMFComparison = (
  tokens: Token[],
  index: number
): MFComparisonToken | null => {
  return {
    type: 'MFComparison',
    data: {
      tokens,
      index
    }
  }
}

/*
<general-enclosed> = [ <function-token> <any-value> ) ] | ( <ident> <any-value> )
*/
export const tokenizeGeneralEnclosed = (
  tokens: Token[],
  index: number
): GeneralEnclosedToken | null => {
  return {
    type: 'GeneralEnclosed',
    data: {
      tokens,
      index
    }
  }
}

/*
Excluding --custom-variables from this definition
*/
export const tokenizeIdent = (
  tokens: Token[],
  index: number
): IdentToken | null => {
  return {
    type: 'Ident',
    data: {
      tokens,
      index
    }
  }
}

/*

*/
export const tokenizeNumber = (
  tokens: Token[],
  index: number
): NumberToken | null => {
  return {
    type: 'Number',
    data: {
      tokens,
      index
    }
  }
}

/*

*/
export const tokenizeDimension = (
  tokens: Token[],
  index: number
): DimensionToken | null => {
  return {
    type: 'Dimension',
    data: {
      tokens,
      index
    }
  }
}

/*

*/
export const tokenizeRatio = (
  tokens: Token[],
  index: number
): RatioToken | null => {
  return {
    type: 'Ratio',
    data: {
      tokens,
      index
    }
  }
}
