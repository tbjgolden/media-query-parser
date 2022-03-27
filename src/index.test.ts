import { toAST } from '.'

test('toAST', () => {
  // sanity check
  expect(toAST('(((((hover)) and (((color))))))')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'boolean',
            feature: 'hover'
          },
          {
            context: 'boolean',
            feature: 'color'
          }
        ],
        operator: 'and'
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
})

test('previously discovered bugs', () => {
  expect(() =>
    toAST(
      'not screen and ((not ((min-width: 1000px) and (orientation: landscape))) or (color))'
    )
  ).toThrow()

  // @media (color-index <= 128)
  expect(toAST('@media (color-index <= 128)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'range',
            feature: 'color-index',
            range: {
              featureName: 'color-index',
              leftOp: null,
              leftToken: null,
              rightOp: '<=',
              rightToken: {
                flag: 'integer',
                type: '<number-token>',
                value: 128
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

  // not print and (110px <= width <= 220px) should have mediaPrefix
  expect(toAST('not print and (110px <= width <= 220px)')).toEqual([
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
                value: 110
              },
              rightOp: '<=',
              rightToken: {
                flag: 'number',
                type: '<dimension-token>',
                unit: 'px',
                value: 220
              }
            }
          }
        ],
        operator: null
      },
      mediaPrefix: 'not',
      mediaType: 'print'
    }
  ])

  // not ((min-width: 100px) and (max-width: 200px)) should not have mediaPrefix
  expect(toAST('not ((min-width: 100px) and (max-width: 200px))')).toEqual([
    {
      mediaCondition: {
        children: [
          {
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
              },
              {
                context: 'value',
                feature: 'width',
                prefix: 'max',
                value: {
                  flag: 'number',
                  type: '<dimension-token>',
                  unit: 'px',
                  value: 200
                }
              }
            ],
            operator: 'and'
          }
        ],
        operator: 'not'
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])

  // not (min-width: 100px) and (max-width: 200px) should fail
  expect(() => toAST('not (min-width: 100px) and (max-width: 200px)')).toThrow()

  // other media types like tty should never match, but not break query
  expect(toAST('not tty')).toEqual([
    {
      mediaCondition: null,
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])

  // negative numbers should parse correctly
  expect(toAST('(min-height: -100px)')).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: 'value',
            feature: 'height',
            prefix: 'min',
            value: {
              flag: 'number',
              type: '<dimension-token>',
              unit: 'px',
              value: -100
            }
          }
        ],
        operator: null
      },
      mediaPrefix: null,
      mediaType: 'all'
    }
  ])
})
