export const tokenize = (str: string): MediaQueryListToken | null => {
  str = str.trim()
  return tokenizeMediaQueryList(str)
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
  | MfPlainToken
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
  data?: {
    modifier: 'not' | 'only' | null
  }
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
export type MfPlainToken = {
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
  data: {
    value: string
  }
}
export type NumberToken = {
  type: 'Number'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type DimensionToken = {
  type: 'Dimension'
  data?: { [k: string]: any }
  children?: UnknownToken[]
}
export type RatioToken = {
  type: 'Ratio'
  data?: { [k: string]: any }
  children?: UnknownToken[]
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

const tokenizeMediaQueryList = (str: string): MediaQueryListToken | null => {
  str = str.trim()
  const mediaQueries = str
    .split(',')
    .map((str) => str.trim())
    .filter(Boolean)
  return {
    type: 'MediaQueryList',
    children: map(mediaQueries, tokenizeMediaQuery)
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
export const tokenizeMediaQuery = (str: string): MediaQueryToken | null => {
  try {
    const fragments = toFragments(str.trim())

    const first = fragments[0]
    if (first.startsWith('(')) {
      // <media-condition> => <media-in-parens> [ <media-and>* | <media-or>* ]
      // where <media-in-parens> => ( <media-condition> ) | <media-feature> | <general-enclosed>
      // where <general-enclosed> => ( <ident> <any-value> )
      return {
        type: 'MediaQuery',
        children: map([str], tokenizeMediaCondition)
      }
    }

    const firstFrags = first.split('(')
    if (firstFrags.length > 0 && tokenizeIdent(firstFrags[0]) !== null) {
      // <media-condition> => <media-in-parens> [ <media-and>* | <media-or>* ]
      // where <media-in-parens> => <general-enclosed> => <function-token> <any-value> )
      return {
        type: 'MediaQuery',
        children: map([str], tokenizeMediaCondition)
      }
    }

    // must start with an ident
    const ident = tokenizeIdent(first)
    if (ident === null) throw new Error('Expected identifier')

    const identValue = ident.data.value
    if (identValue === 'only') {
      // only <media-type> [ and <media-condition-without-or> ]?
    } else if (identValue === 'not') {
      // not <media-type> [ and <media-condition-without-or> ]?
      // <media-not> = not <media-in-parens> = not <media-in-parens>
    } else {
      // <media-type>
    }

    return {
      type: 'MediaQuery',
      children: map([str], tokenizeMediaCondition)
    }
  } catch (err) {
    return {
      type: 'MediaQuery',
      data: {
        modifier: 'not'
      },
      children: []
    }
  }
}

/*
<media-type> = <ident>
*/
export const tokenizeMediaType = (str: string): MediaTypeToken | null => {
  str = str.trim()
  return {
    type: 'MediaType',
    data: {
      str
    }
  }
}

/*
<media-condition> = <media-not> | <media-in-parens> [ <media-and>* | <media-or>* ]
*/
export const tokenizeMediaCondition = (
  str: string
): MediaConditionToken | null => {
  str = str.trim()
  return {
    type: 'MediaCondition',
    data: {
      str
    }
  }
}

/*
<media-condition-without-or> = <media-not> | <media-in-parens> <media-and>*
*/
export const tokenizeMediaConditionWithoutOr = (
  str: string
): MediaConditionWithoutOrToken | null => {
  str = str.trim()
  return {
    type: 'MediaConditionWithoutOr',
    data: {
      str
    }
  }
}

/*
<media-not> = not <media-in-parens>
*/
export const tokenizeMediaNot = (str: string): MediaNotToken | null => {
  str = str.trim()
  return {
    type: 'MediaNot',
    data: {
      str
    }
  }
}

/*
<media-and> = and <media-in-parens>
*/
export const tokenizeMediaAnd = (str: string): MediaAndToken | null => {
  str = str.trim()
  return {
    type: 'MediaAnd',
    data: {
      str
    }
  }
}

/*
<media-or> = or <media-in-parens>
*/
export const tokenizeMediaOr = (str: string): MediaOrToken | null => {
  str = str.trim()
  return {
    type: 'MediaOr',
    data: {
      str
    }
  }
}

/*
<media-in-parens> = ( <media-condition> ) | <media-feature> | <general-enclosed>
*/
export const tokenizeMediaInParens = (
  str: string
): MediaInParensToken | null => {
  str = str.trim()
  return {
    type: 'MediaInParens',
    data: {
      str
    }
  }
}

/*
<media-feature> = ( [ <mf-plain> | <mf-boolean> | <mf-range> ] )
*/
export const tokenizeMediaFeature = (str: string): MediaFeatureToken | null => {
  str = str.trim()
  return {
    type: 'MediaFeature',
    data: {
      str
    }
  }
}

/*
<mf-plain> = <mf-name> : <mf-value>
*/
export const tokenizeMfPlain = (str: string): MfPlainToken | null => {
  str = str.trim()
  return {
    type: 'MfPlain',
    data: {
      str
    }
  }
}

/*
<mf-boolean> = <mf-name>
*/
export const tokenizeMFBoolean = (str: string): MFBooleanToken | null => {
  str = str.trim()
  return {
    type: 'MFBoolean',
    data: {
      str
    }
  }
}

/*
<mf-range> = <mf-name> <mf-comparison> <mf-value>
           | <mf-value> <mf-comparison> <mf-name>
           | <mf-value> <mf-lt> <mf-name> <mf-lt> <mf-value>
           | <mf-value> <mf-gt> <mf-name> <mf-gt> <mf-value>
*/
export const tokenizeMFRange = (str: string): MFRangeToken | null => {
  str = str.trim()
  return {
    type: 'MFRange',
    data: {
      str
    }
  }
}

/*
<mf-name> = <ident>
*/
export const tokenizeMFName = (str: string): MFNameToken | null => {
  str = str.trim()
  return {
    type: 'MFName',
    data: {
      str
    }
  }
}

/*
<mf-value> = <number> | <dimension> | <ident> | <ratio>
*/
export const tokenizeMFValue = (str: string): MFValueToken | null => {
  str = str.trim()
  return {
    type: 'MFValue',
    data: {
      str
    }
  }
}

/*
<mf-lt> = '<' '='?
*/
export const tokenizeMFLT = (str: string): MFLTToken | null => {
  str = str.trim()
  return {
    type: 'MFLT',
    data: {
      str
    }
  }
}

/*
<mf-gt> = '>' '='?
*/
export const tokenizeMFGT = (str: string): MFGTToken | null => {
  str = str.trim()
  return {
    type: 'MFGT',
    data: {
      str
    }
  }
}

/*
<mf-eq> = '='
*/
export const tokenizeMFEq = (str: string): MFEqToken | null => {
  str = str.trim()
  return {
    type: 'MFEq',
    data: {
      str
    }
  }
}

/*
<mf-comparison> = <mf-lt> | <mf-gt> | <mf-eq>
*/
export const tokenizeMFComparison = (str: string): MFComparisonToken | null => {
  str = str.trim()
  return {
    type: 'MFComparison',
    data: {
      str
    }
  }
}

/*
<general-enclosed> = [ <function-token> <any-value> ) ] | ( <ident> <any-value> )
*/
export const tokenizeGeneralEnclosed = (
  str: string
): GeneralEnclosedToken | null => {
  str = str.trim()
  return {
    type: 'GeneralEnclosed',
    data: {
      str
    }
  }
}

const identRegex = /^-?([a-zA-Z_]|[^\u0000-\u007F]|\\([^0-9a-f\n]|[0-9a-f]{1,6}\s?))([a-zA-Z0-9_\-]|[^\u0000-\u007F]|\\([^0-9a-f\n]|[0-9a-f]{1,6}\s?))*$/u
/*
Excluding --custom-variables from this definition
*/
export const tokenizeIdent = (str: string): IdentToken | null => {
  str = str.trim()
  return identRegex.test(str)
    ? {
        type: 'Ident',
        data: {
          value: str
        }
      }
    : null
}

/*

*/
export const tokenizeNumber = (str: string): NumberToken | null => {
  str = str.trim()
  return {
    type: 'Number',
    data: {
      str
    }
  }
}

/*

*/
export const tokenizeDimension = (str: string): DimensionToken | null => {
  str = str.trim()
  return {
    type: 'Dimension',
    data: {
      str
    }
  }
}

/*

*/
export const tokenizeRatio = (str: string): RatioToken | null => {
  str = str.trim()
  return {
    type: 'Ratio',
    data: {
      str
    }
  }
}
