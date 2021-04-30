import { tokenize, removeWhitespace } from './syntacticAnalysis'

test('should skip over @media, or error if something else', async () => {
  expect(tokenize('@media all')).toEqual([
    { mediaCondition: null, mediaPrefix: null, mediaType: true }
  ])
  expect(tokenize('@media,all;')).toEqual(null)
  expect(tokenize('@media all;')).toEqual(null)
  expect(tokenize('@media all { /* ... */ }')).toEqual([
    { mediaCondition: null, mediaPrefix: null, mediaType: true }
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

test('should tokenize media query', async () => {
  expect(tokenize('')).toEqual([])
  expect(tokenize('all,')).toEqual(null)
  expect(tokenize('all, all, all')).toEqual([
    { mediaCondition: null, mediaPrefix: null, mediaType: true },
    { mediaCondition: null, mediaPrefix: null, mediaType: true },
    { mediaCondition: null, mediaPrefix: null, mediaType: true }
  ])
  expect(tokenize('only screen and (color)')).toEqual([
    {
      mediaCondition: {
        children: [{ context: 'boolean', feature: 'color' }],
        operator: null
      },
      mediaPrefix: 'only',
      mediaType: 'screen'
    }
  ])
  expect(tokenize('not print and (min-width: 10px)')).toEqual('')
  expect(tokenize('not print, screen, (max-width: 1000px)')).toEqual('')
  expect(
    tokenize('url(fun()) screen and (color), projection and (color)')
  ).toEqual(null)
  expect(tokenize('all, all, all')).toEqual('')
  expect(tokenize('all,, all')).toEqual(null)
  expect(tokenize(',all, all')).toEqual(null)
  expect(tokenize('(all, all), all')).toEqual(null)
  expect(tokenize('((min-width: -100px)')).toEqual(null)

  expect(tokenize('(max-width:1199.98px)')).toEqual('')
  expect(tokenize('(max-width:1399.98px)')).toEqual('')
  expect(tokenize('(max-width:575.98px)')).toEqual('')
  expect(tokenize('(max-width:767.98px)')).toEqual('')
  expect(tokenize('(max-width:991.98px)')).toEqual('')
  expect(tokenize('(min-width:1200px)')).toEqual('')
  expect(tokenize('(min-width:1400px)')).toEqual('')
  expect(tokenize('(min-width:576px)')).toEqual('')
  expect(tokenize('(min-width:768px)')).toEqual('')
  expect(tokenize('(min-width:992px)')).toEqual('')
  expect(tokenize('(prefers-reduced-motion:no-preference)')).toEqual('')
  expect(tokenize('(any-hover:hover)')).toEqual('')
  expect(tokenize('(any-hover:none)')).toEqual('')
  expect(tokenize('(any-hover:anything)')).toEqual('')
  expect(tokenize('(grid:0)')).toEqual('')
  expect(tokenize('(aspect-ratio:16/9)')).toEqual('')
  expect(tokenize('(prefers-reduced-motion:reduce)')).toEqual('')
  expect(tokenize('print')).toEqual('')
  expect(tokenize('(height > 600px)')).toEqual('')
  expect(tokenize('(600px < height)')).toEqual('')
  expect(tokenize('(600px > width)')).toEqual('')
  expect(tokenize('(width < 600px)')).toEqual('')
  expect(tokenize('(not (color)) or (hover)')).toEqual('')
  expect(tokenize('screen and (not (color)) or (hover)')).toEqual('')
  expect(tokenize('screen and (100px <= width <= 200px)')).toEqual('')
  expect(tokenize('(100px <= width) and (width <= 200px)')).toEqual('')
  expect(tokenize('(1/2 < aspect-ratio < 1/1)')).toEqual('')
  expect(tokenize('(100px <= width <= 200px)')).toEqual('')
  expect(tokenize('only screen and (color)')).toEqual('')
})
