import { toAST, removeWhitespace } from './syntacticAnalysis'

test('should skip over @media, or error if something else', async () => {
  expect(toAST('@media all')).toEqual([
    { mediaCondition: null, mediaPrefix: null, mediaType: 'all' }
  ])
  expect(toAST('@media,all;')).toEqual(null)
  expect(toAST('@media all;')).toEqual(null)
  expect(toAST('@media all { /* ... */ }')).toEqual([
    { mediaCondition: null, mediaPrefix: null, mediaType: 'all' }
  ])
})

test('removeWhitespace', async () => {
  const removeHints = <T extends { wsBefore: boolean; wsAfter: boolean }>(
    tokens: T[]
  ): Omit<T, 'wsBefore' | 'wsAfter'>[] => tokens.map((t) => removeHint(t))
  const removeHint = <T extends { wsBefore: boolean; wsAfter: boolean }>({
    wsBefore: _0,
    wsAfter: _1,
    ...rest
  }: T): Omit<T, 'wsBefore' | 'wsAfter'> => rest

  expect(removeHints(removeWhitespace([]))).toEqual([])
  expect(removeHints(removeWhitespace([{ type: '<colon-token>' }]))).toEqual([
    { type: '<colon-token>' }
  ])
  expect(
    removeHints(removeWhitespace([{ type: '<whitespace-token>' }]))
  ).toEqual([])
  expect(
    removeHints(
      removeWhitespace([
        { type: '<whitespace-token>' },
        { type: '<whitespace-token>' }
      ])
    )
  ).toEqual([])
  expect(
    removeHints(
      removeWhitespace([
        { type: '<colon-token>' },
        { type: '<whitespace-token>' }
      ])
    )
  ).toEqual([{ type: '<colon-token>' }])
  expect(
    removeHints(
      removeWhitespace([
        { type: '<whitespace-token>' },
        { type: '<colon-token>' }
      ])
    )
  ).toEqual([{ type: '<colon-token>' }])
  expect(
    removeHints(
      removeWhitespace([
        { type: '<whitespace-token>' },
        { type: '<colon-token>' },
        { type: '<whitespace-token>' },
        { type: '<colon-token>' },
        { type: '<whitespace-token>' }
      ])
    )
  ).toEqual([{ type: '<colon-token>' }, { type: '<colon-token>' }])

  // validate ws hints
  expect(
    removeWhitespace([
      { type: '<whitespace-token>' },
      { type: '<colon-token>' },
      { type: '<whitespace-token>' },
      { type: '<colon-token>' },
      { type: '<whitespace-token>' }
    ])
  ).toEqual([
    { type: '<colon-token>', wsBefore: true, wsAfter: true },
    { type: '<colon-token>', wsBefore: true, wsAfter: true }
  ])
  expect(
    removeWhitespace([
      { type: '<whitespace-token>' },
      { type: '<colon-token>' },
      { type: '<colon-token>' },
      { type: '<whitespace-token>' }
    ])
  ).toEqual([
    { type: '<colon-token>', wsBefore: true, wsAfter: false },
    { type: '<colon-token>', wsBefore: false, wsAfter: true }
  ])
  expect(
    removeWhitespace([
      { type: '<colon-token>' },
      { type: '<whitespace-token>' },
      { type: '<colon-token>' }
    ])
  ).toEqual([
    { type: '<colon-token>', wsBefore: false, wsAfter: true },
    { type: '<colon-token>', wsBefore: true, wsAfter: false }
  ])
})

test('should toAST media query', async () => {
  expect(toAST('')).toEqual([
    { mediaCondition: null, mediaPrefix: null, mediaType: 'all' }
  ])
  expect(toAST(',')).toEqual(null)
  expect(toAST('all,')).toEqual([
    { mediaCondition: null, mediaPrefix: null, mediaType: 'all' }
  ])
  expect(toAST('all, all, all')).toEqual([
    { mediaCondition: null, mediaPrefix: null, mediaType: 'all' },
    { mediaCondition: null, mediaPrefix: null, mediaType: 'all' },
    { mediaCondition: null, mediaPrefix: null, mediaType: 'all' }
  ])
  expect(toAST('only screen and (color)')).toEqual([
    {
      mediaCondition: {
        children: [{ context: 'boolean', feature: 'color' }],
        operator: null
      },
      mediaPrefix: 'only',
      mediaType: 'screen'
    }
  ])
  expect(toAST('not print and (min-width: 10px)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'width',
            prefix: 'min',
            value: {
              flag: 'number',
              type: '<dimension-token>',
              unit: 'px',
              value: 10
            }
          }
        ],
        operator: null
      },
      mediaPrefix: 'not',
      mediaType: 'print'
    }
  ])
  expect(toAST('not print, screen, (max-width: 1000px)')).toEqual([
    { mediaCondition: null, mediaPrefix: 'not', mediaType: 'print' },
    { mediaCondition: null, mediaPrefix: null, mediaType: 'screen' },
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'width',
            prefix: 'max',
            value: {
              flag: 'number',
              type: '<dimension-token>',
              unit: 'px',
              value: 1000
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  // as url( ) cannot contain a ), so it's a lexer error even before the list is separated by commas
  expect(
    toAST('url(fun()) screen and (color), projection and (color)')
  ).toEqual(null)
  expect(toAST('all,, all')).toEqual([
    { mediaCondition: null, mediaPrefix: null, mediaType: 'all' },
    { mediaCondition: null, mediaPrefix: null, mediaType: 'all' }
  ])
  expect(toAST(',all, all')).toEqual([
    { mediaCondition: null, mediaPrefix: null, mediaType: 'all' },
    { mediaCondition: null, mediaPrefix: null, mediaType: 'all' }
  ])
  expect(toAST('(all, all), all')).toEqual([
    { mediaCondition: null, mediaPrefix: null, mediaType: 'all' }
  ])
  expect(toAST('((min-width: -100px)')).toEqual(null)

  expect(toAST('(min-width: -100px)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'width',
            prefix: 'min',
            value: {
              flag: 'number',
              type: '<dimension-token>',
              unit: 'px',
              value: 100
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(max-width:1199.98px)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'width',
            prefix: 'max',
            value: {
              flag: 'number',
              type: '<dimension-token>',
              unit: 'px',
              value: 1199.98
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(max-width:1399.98px)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'width',
            prefix: 'max',
            value: {
              flag: 'number',
              type: '<dimension-token>',
              unit: 'px',
              value: 1399.98
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(max-width:575.98px)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'width',
            prefix: 'max',
            value: {
              flag: 'number',
              type: '<dimension-token>',
              unit: 'px',
              value: 575.98
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(max-width:767.98px)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'width',
            prefix: 'max',
            value: {
              flag: 'number',
              type: '<dimension-token>',
              unit: 'px',
              value: 767.98
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(max-width:991.98px)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'width',
            prefix: 'max',
            value: {
              flag: 'number',
              type: '<dimension-token>',
              unit: 'px',
              value: 991.98
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(min-width:1200px)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'width',
            prefix: 'min',
            value: {
              flag: 'number',
              type: '<dimension-token>',
              unit: 'px',
              value: 1200
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(min-width:1400px)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'width',
            prefix: 'min',
            value: {
              flag: 'number',
              type: '<dimension-token>',
              unit: 'px',
              value: 1400
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(min-width:576px)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'width',
            prefix: 'min',
            value: {
              flag: 'number',
              type: '<dimension-token>',
              unit: 'px',
              value: 576
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(min-width:768px)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'width',
            prefix: 'min',
            value: {
              flag: 'number',
              type: '<dimension-token>',
              unit: 'px',
              value: 768
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(min-width:992px)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'width',
            prefix: 'min',
            value: {
              flag: 'number',
              type: '<dimension-token>',
              unit: 'px',
              value: 992
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(prefers-reduced-motion:no-preference)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'prefers-reduced-motion',
            prefix: null,
            value: {
              type: '<ident-token>',
              value: 'no-preference'
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(any-hover:hover)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'any-hover',
            prefix: null,
            value: {
              type: '<ident-token>',
              value: 'hover'
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(any-hover:none)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'any-hover',
            prefix: null,
            value: {
              type: '<ident-token>',
              value: 'none'
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(any-hover:anything)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'any-hover',
            prefix: null,
            value: {
              type: '<ident-token>',
              value: 'anything'
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(grid:0)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'grid',
            prefix: null,
            value: {
              flag: 'integer',
              type: '<number-token>',
              value: 0
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(aspect-ratio:16/9)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'aspect-ratio',
            prefix: null,
            value: { denominator: 9, numerator: 16, type: '<ratio-token>' }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(prefers-reduced-motion:reduce)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'prefers-reduced-motion',
            prefix: null,
            value: {
              type: '<ident-token>',
              value: 'reduce'
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('print')).toEqual([
    {
      mediaCondition: null,
      mediaPrefix: null,
      mediaType: 'print'
    }
  ])
  expect(toAST('(height > 600px)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'range',
            feature: 'height',
            range: {
              featureName: 'height',
              leftOp: null,
              leftToken: null,
              rightOp: '>',
              rightToken: {
                flag: 'number',
                type: '<dimension-token>',
                unit: 'px',
                value: 600
              }
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(600px < height)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'range',
            feature: 'height',
            range: {
              featureName: 'height',
              leftOp: '<',
              leftToken: {
                flag: 'number',
                type: '<dimension-token>',
                unit: 'px',
                value: 600
              },
              rightOp: null,
              rightToken: null
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(600px > width)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'range',
            feature: 'width',
            range: {
              featureName: 'width',
              leftOp: '>',
              leftToken: {
                flag: 'number',
                type: '<dimension-token>',
                unit: 'px',
                value: 600
              },
              rightOp: null,
              rightToken: null
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(width < 600px)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'range',
            feature: 'width',
            range: {
              featureName: 'width',
              leftOp: null,
              leftToken: null,
              rightOp: '<',
              rightToken: {
                flag: 'number',
                type: '<dimension-token>',
                unit: 'px',
                value: 600
              }
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('((not (color))) or (hover)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            children: [{ context: 'boolean', feature: 'color' }],
            operator: 'not'
          },
          { context: 'boolean', feature: 'hover' }
        ],
        operator: 'or'
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('screen and (not (color)) or (hover)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            children: [{ context: 'boolean', feature: 'color' }],
            operator: 'not'
          },
          { context: 'boolean', feature: 'hover' }
        ],
        operator: 'or'
      },
      mediaPrefix: null,
      mediaType: 'screen'
    }
  ])
  expect(toAST('screen and (100px <= width <= 200px)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'range',
            feature: 'width',
            range: {
              featureName: 'width',
              leftOp: '<=',
              leftToken: {
                flag: 'number',
                type: '<dimension-token>',
                unit: 'px',
                value: 100
              },
              rightOp: '<=',
              rightToken: {
                flag: 'number',
                type: '<dimension-token>',
                unit: 'px',
                value: 200
              }
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'screen'
    }
  ])
  expect(toAST('(100px <= width) and (width <= 200px)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'range',
            feature: 'width',
            range: {
              featureName: 'width',
              leftOp: '<=',
              leftToken: {
                flag: 'number',
                type: '<dimension-token>',
                unit: 'px',
                value: 100
              },
              rightOp: null,
              rightToken: null
            }
          },
          {
            context: 'range',
            feature: 'width',
            range: {
              featureName: 'width',
              leftOp: null,
              leftToken: null,
              rightOp: '<=',
              rightToken: {
                flag: 'number',
                type: '<dimension-token>',
                unit: 'px',
                value: 200
              }
            }
          }
        ],
        operator: 'and'
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(1/2 < aspect-ratio < 1/1)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'range',
            feature: 'aspect-ratio',
            range: {
              featureName: 'aspect-ratio',
              leftOp: '<',
              leftToken: {
                denominator: 2,
                numerator: 1,
                type: '<ratio-token>'
              },
              rightOp: '<',
              rightToken: {
                denominator: 1,
                numerator: 1,
                type: '<ratio-token>'
              }
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('(100px <= width <= 200px)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'range',
            feature: 'width',
            range: {
              featureName: 'width',
              leftOp: '<=',
              leftToken: {
                flag: 'number',
                type: '<dimension-token>',
                unit: 'px',
                value: 100
              },
              rightOp: '<=',
              rightToken: {
                flag: 'number',
                type: '<dimension-token>',
                unit: 'px',
                value: 200
              }
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
  expect(toAST('only screen and (color)')).toEqual([
    {
      mediaCondition: {
        children: [{ context: 'boolean', feature: 'color' }],
        operator: null
      },
      mediaPrefix: 'only',
      mediaType: 'screen'
    }
  ])
})
