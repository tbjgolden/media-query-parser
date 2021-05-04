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
