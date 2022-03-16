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
  expect(toAST('not (min-width: 100px) and (max-width: 200px)')).toBe(null)

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
