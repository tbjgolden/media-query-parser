import { tokenize, removeWhitespace } from './syntacticAnalysis'

test.skip('should skip over @media, or error if something else', async () => {
  expect(tokenize('@media all')).toBe('')
  expect(tokenize('@media,all;')).toBe('')
  expect(tokenize('@media all;')).toBe('')
  expect(tokenize('@media all { /* ... */ }')).toBe('')
})

test('removeWhitespace', async () => {
  expect(removeWhitespace([])).toEqual([])
  expect(removeWhitespace([{ type: '<colon-token>' }])).toEqual([
    { type: '<colon-token>' }
  ])
  expect(removeWhitespace([{ type: '<whitespace-token>' }])).toEqual([])
  expect(
    removeWhitespace([
      { type: '<whitespace-token>' },
      { type: '<whitespace-token>' }
    ])
  ).toEqual([])
  expect(
    removeWhitespace([
      { type: '<colon-token>' },
      { type: '<whitespace-token>' }
    ])
  ).toEqual([{ type: '<colon-token>' }])
  expect(
    removeWhitespace([
      { type: '<whitespace-token>' },
      { type: '<colon-token>' }
    ])
  ).toEqual([{ type: '<colon-token>' }])
  expect(
    removeWhitespace([
      { type: '<whitespace-token>' },
      { type: '<colon-token>' },
      { type: '<whitespace-token>' },
      { type: '<colon-token>' },
      { type: '<whitespace-token>' }
    ])
  ).toEqual([{ type: '<colon-token>' }, { type: '<colon-token>' }])
})

test('should tokenize media query', async () => {
  expect(tokenize('(100px <= width <= 200px)')).toBe('')
  expect(tokenize('only screen and (color)')).toBe('')
  expect(tokenize('')).toBe('')
  expect(tokenize('all,')).toBe('')
  expect(tokenize('all, all, all')).toBe('')
  expect(tokenize('only screen and (color)')).toBe('')
  expect(tokenize('not print and (min-width: 10px)')).toBe('')
  expect(tokenize('not print, screen, (max-width: 1000px)')).toBe('')
  expect(
    tokenize('url(fun()) screen and (color), projection and (color)')
  ).toBe(null)
  expect(tokenize('all, all, all')).toBe('')
  expect(tokenize('all,, all')).toBe(null)
  expect(tokenize(',all, all')).toBe(null)
  expect(tokenize('(all, all), all')).toBe(null)
  expect(tokenize('((min-width: -100px)')).toBe(null)

  expect(tokenize('(max-width:1199.98px)')).toBe('')
  expect(tokenize('(max-width:1399.98px)')).toBe('')
  expect(tokenize('(max-width:575.98px)')).toBe('')
  expect(tokenize('(max-width:767.98px)')).toBe('')
  expect(tokenize('(max-width:991.98px)')).toBe('')
  expect(tokenize('(min-width:1200px)')).toBe('')
  expect(tokenize('(min-width:1400px)')).toBe('')
  expect(tokenize('(min-width:576px)')).toBe('')
  expect(tokenize('(min-width:768px)')).toBe('')
  expect(tokenize('(min-width:992px)')).toBe('')
  expect(tokenize('(prefers-reduced-motion:no-preference)')).toBe('')
  expect(tokenize('(any-hover:hover)')).toBe('')
  expect(tokenize('(any-hover:none)')).toBe('')
  expect(tokenize('(any-hover:anything)')).toBe('')
  expect(tokenize('(grid:0)')).toBe('')
  expect(tokenize('(aspect-ratio:16/9)')).toBe('')
  expect(tokenize('(prefers-reduced-motion:reduce)')).toBe('')
  expect(tokenize('print')).toBe('')
  expect(tokenize('(height > 600px)')).toBe('')
  expect(tokenize('(600px < height)')).toBe('')
  expect(tokenize('(600px > width)')).toBe('')
  expect(tokenize('(width < 600px)')).toBe('')
  expect(tokenize('(not (color)) or (hover)')).toBe('')
  expect(tokenize('screen and (not (color)) or (hover)')).toBe('')
  expect(tokenize('screen and (100px <= width <= 200px)')).toBe('')
  expect(tokenize('(100px <= width) and (width <= 200px)')).toBe('')
})
