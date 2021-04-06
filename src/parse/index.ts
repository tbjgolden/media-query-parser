import csstree, { toPlainObject, Atrule, AtrulePlain, AtrulePreludePlain, MediaQueryListPlain, MediaQueryPlain, MediaFeature } from 'css-tree'

export const parse = (mediaQuery: string): string | null => {
  try {
    const ast = csstree.parse(`@media ${mediaQuery} {}`, {
      context: 'atrule'
    }) as Atrule
    const node = toPlainObject(ast) as AtrulePlain
    let prelude = node.prelude
    if (prelude?.type === "Raw") {
      // css-tree can't parse these, so transform them to regular input and retry
      const newQuery = expandShorthandMediaQuery(prelude.value)
      const ast = csstree.parse(`@media ${newQuery} {}`, {
        context: 'atrule'
      }) as Atrule
      const node = toPlainObject(ast) as AtrulePlain
      prelude = node.prelude
    }

    if (prelude?.type === 'AtrulePrelude') {
      parseMediaRulePrelude(prelude)
      return ''
    } else {
      return null
    }
  } catch (e) {
    return null
  }
}

export const parseMediaRulePrelude = (prelude: AtrulePreludePlain) => {
  for (const child of prelude.children) {
    if (child.type === "MediaQueryList") {
      parseMediaQueryList(child)
    }
  }
}

export const parseMediaQueryList = (mediaQueryList: MediaQueryListPlain) => {
  for (const child of mediaQueryList.children) {
    if (child.type === "MediaQuery") {
      parseMediaQuery(child)
    }
  }
}

export const parseMediaQuery = (mediaQuery: MediaQueryPlain) => {
  for (const child of mediaQuery.children) {
    if (child.type === "Identifier") {
      // console.log(child.name)
    } else if (child.type === "MediaFeature") {
      parseMediaFeature(child)
    } else if (child.type === "WhiteSpace") {
      // skip
    } else {
      console.log(child)
    }
  }
}

type Range<T> = { firstIntervalOn: boolean, ranges: T[] }
type Wrapper<T> = {
  [P in keyof T]?: { value: T[P], inverse: boolean };
};

export type Conditions = Wrapper<{
  // enums
  'any-hover': 'none' | 'hover',
  'any-pointer': 'none' | 'coarse' | 'fine',
  'color-gamut': 'srgb' | 'p3' | 'rec2020',
  'display-mode': 'browser' | 'minimal-ui' | 'standalone' | 'fullscreen',
  'forced-colors': 'none' | 'active',
  'hover': 'none' | 'hover',
  'inverted-colors': 'none' | 'inverted',
  'orientation': 'portrait' | 'landscape',
  'overflow-block': 'none' | 'scroll' | 'optional-paged' | 'paged',
  'overflow-inline': 'none' | 'scroll',
  'pointer': 'none' | 'coarse' | 'fine',
  'prefers-color-scheme': 'light' | 'dark',
  'prefers-contrast': 'no-preference' | 'more' | 'less',
  'prefers-reduced-motion': 'no-preference' | 'reduce',
  'prefers-reduced-transparency': 'no-preference' | 'reduce',
  'scan': 'interlace' | 'progressive',
  'scripting': 'none' | 'initial-only' | 'enabled',
  'update': 'none' | 'slow' | 'fast',
  'grid': 0 | 1,
  // ranges (ratio)
  'aspect-ratio': Range<[number, number]>,
  'device-aspect-ratio': Range<[number, number]>,
  // ranges (number)
  'color': Range<number>,
  'color-index': Range<number>,
  'device-height': Range<number>,
  'device-width': Range<number>,
  'height': Range<number>,
  'monochrome': Range<number>,
  'resolution': Range<number>,
  'width': Range<number>,
}>

const magic = <T>(value: T) => ({ value, inverse: false })

// any pair of numbers, left exclusive, right inclusive, equal = inclusive single point
const createRange = <T>(input: T, prefix: string): Range<T> => {
  if (prefix === "min-") {
    return {
      firstIntervalOn: false,
      ranges: [input]
    }
  } else if (prefix === "max-") {
    return {
      firstIntervalOn: true,
      ranges: [input]
    }
  } else {
    return {
      firstIntervalOn: false,
      ranges: [input, input]
    }
  }
}

const shorthandRegex = /\([ \t]*(?:([0-9]*\.?[0-9]+)(|%|[a-zA-Z]+)[ \t]+(>=|>|<|<=)[ \t]+)?([a-z\-]+)(?:[ \t]+(>=|>|<|<=)[ \t]+([0-9]*\.?[0-9]+)(|%|[a-zA-Z]+))?[ \t]*\)/g
export const expandShorthandMediaQuery = (mediaQuery: string): string => {
  const results = Array.from(mediaQuery.matchAll(shorthandRegex))

  for (let i = results.length - 1; i >= 0; i--) {
    const [source, left, leftUnit, leftOp, feat, rightOp, right, rightUnit] = results[i]

    if (!left && !right) {
      throw new Error(`Could not parse "${mediaQuery}" as a shorthand media query`)
    }

    const index = results[i].index ?? 0
    const sourceLength = source.length

    let newSource = ""
    if (left) {
      const prefix = (leftOp === ">" || leftOp === ">=") ? "max" : "min"
      let num = parseFloat(left)
      if (leftOp === ">") num -= 0.02
      if (leftOp === "<") num += 0.02
      newSource = `(${prefix}-${feat}: ${num}${leftUnit})`
    }
    if (right) {
      const prefix = (rightOp === ">" || rightOp === ">=") ? "min" : "max"
      let num = parseFloat(right)
      if (rightOp === ">") num += 1
      if (rightOp === "<") num -= 1
      newSource += `${newSource === "" ? "" : " and "}(${prefix}-${feat}: ${num}${rightUnit})`
    }

    mediaQuery = `${mediaQuery.slice(0, index)}${newSource}${mediaQuery.slice(index + sourceLength)}`
  }

  return mediaQuery
}

export const parseMediaFeature = (mediaFeature: MediaFeature): Conditions => {
  const conditions: Conditions = {}

  let feat = mediaFeature.name
  const prefix = mediaFeature.name.slice(0, 4)
  if (prefix === "min-" || prefix === "max-") {
    feat = mediaFeature.name.slice(4)
  }

  const value = mediaFeature.value ?? { type: "No Value" }
  // enums
  if (value.type === "Identifier") {
    if (feat === 'any-hover') {
      if ((value.name === 'none' || value.name === 'hover' )) {
        conditions[feat] = magic(value.name)
      }
    } else if (feat === 'any-pointer') {
      if ((value.name === 'none' || value.name === 'coarse' || value.name === 'fine' )) {
        conditions[feat] = magic(value.name)
      }
    } else if (feat === 'color-gamut') {
      if ((value.name === 'srgb' || value.name === 'p3' || value.name === 'rec2020' )) {
        conditions[feat] = magic(value.name)
      }
    } else if (feat === 'display-mode') {
      if ((value.name === 'browser' || value.name === 'minimal-ui' || value.name === 'standalone' || value.name === 'fullscreen' )) {
        conditions[feat] = magic(value.name)
      }
    } else if (feat === 'forced-colors') {
      if ((value.name === 'none' || value.name === 'active' )) {
        conditions[feat] = magic(value.name)
      }
    } else if (feat === 'hover') {
      if ((value.name === 'none' || value.name === 'hover' )) {
        conditions[feat] = magic(value.name)
      }
    } else if (feat === 'inverted-colors') {
      if ((value.name === 'none' || value.name === 'inverted' )) {
        conditions[feat] = magic(value.name)
      }
    } else if (feat === 'orientation') {
      if ((value.name === 'portrait' || value.name === 'landscape' )) {
        conditions[feat] = magic(value.name)
      }
    } else if (feat === 'overflow-block') {
      if ((value.name === 'none' || value.name === 'scroll' || value.name === 'optional-paged' || value.name === 'paged' )) {
        conditions[feat] = magic(value.name)
      }
    } else if (feat === 'overflow-inline') {
      if ((value.name === 'none' || value.name === 'scroll' )) {
        conditions[feat] = magic(value.name)
      }
    } else if (feat === 'pointer') {
      if ((value.name === 'none' || value.name === 'coarse' || value.name === 'fine' )) {
        conditions[feat] = magic(value.name)
      }
    } else if (feat === 'prefers-color-scheme') {
      if ((value.name === 'light' || value.name === 'dark' )) {
        conditions[feat] = magic(value.name)
      }
    } else if (feat === 'prefers-contrast') {
      if ((value.name === 'no-preference' || value.name === 'more' || value.name === 'less' )) {
        conditions[feat] = magic(value.name)
      }
    } else if (feat === 'prefers-reduced-motion') {
      if ((value.name === 'no-preference' || value.name === 'reduce' )) {
        conditions[feat] = magic(value.name)
      }
    } else if (feat === 'prefers-reduced-transparency') {
      if ((value.name === 'no-preference' || value.name === 'reduce' )) {
        conditions[feat] = magic(value.name)
      }
    } else if (feat === 'scan') {
      if ((value.name === 'interlace' || value.name === 'progressive' )) {
        conditions[feat] = magic(value.name)
      }
    } else if (feat === 'scripting') {
      if ((value.name === 'none' || value.name === 'initial-only' || value.name === 'enabled' )) {
        conditions[feat] = magic(value.name)
      }
    } else if (feat === 'update') {
      if ((value.name === 'none' || value.name === 'slow' || value.name === 'fast' )) {
        conditions[feat] = magic(value.name)
      }
    }
  } else if (value.type === "Number") {
    const { value: stringValue } = value
    const number = parseInt(stringValue)
    if (feat === 'grid') {
      conditions[feat] = magic(number as 0 | 1)
    } else if (feat === 'color' || feat === 'color-index' || feat === 'monochrome') {
      conditions[feat] = magic(createRange(number, prefix))
    }
  } else if (value.type === "Dimension") {
    const { value: stringValue, unit } = value
    if (feat === 'resolution') {
      if (unit !== "dpi") {
        throw new Error(`This library is unable to convert "${stringValue}${unit}" to dpi`)
      }
    } else {
      if (unit !== "px") {
        throw new Error(`This library is unable to convert "${stringValue}${unit}" to px`)
      }
    }

    const number = parseFloat(stringValue)
    if (feat === 'device-height' || feat === 'device-width' || feat === 'height' || feat === 'resolution' || feat === 'width') {
      conditions[feat] = magic(createRange(number, prefix))
    }
  } else if (value.type === "Ratio") {
    if (feat === "aspect-ratio" || feat === "device-aspect-ratio") {
      const { left: stringLeft, right: stringRight } = value
      const left = parseInt(stringLeft)
      const right = parseInt(stringRight)
      conditions[feat] = magic(createRange([left, right], prefix))
    }
  } else {
    console.log(value)
  }

  // console.log(JSON.stringify(conditions))

  return conditions
}
