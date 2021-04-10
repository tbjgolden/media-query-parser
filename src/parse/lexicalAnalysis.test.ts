import {
  consumeEscape,
  consumeIdent,
  consumeNumber,
  consumeString
} from './lexicalAnalysis'

test('consumeEscape', () => {
  expect(consumeEscape('', 0)).toBe(null)
  expect(consumeEscape('"', 0)).toBe(null)
  // escape any
  expect(consumeEscape("\\'", 0)?.[0]).toBe(1)
  expect(String.fromCharCode(consumeEscape("\\'", 0)?.[1] ?? -1)).toBe("'")
  // escape hex
  expect(consumeEscape('\\0a', 0)?.[0]).toBe(2)
  expect(String.fromCharCode(consumeEscape('\\0a', 0)?.[1] ?? -1)).toBe('\n')
  // escape hex with trailing whitespace
  expect(consumeEscape('\\0a ', 0)?.[0]).toBe(3)
  expect(String.fromCharCode(consumeEscape('\\0a ', 0)?.[1] ?? -1)).toBe('\n')
  // escape hex with trailing whitespace + more
  expect(consumeEscape('\\0a hehe', 0)?.[0]).toBe(3)
  expect(String.fromCharCode(consumeEscape('\\0a hehe', 0)?.[1] ?? -1)).toBe(
    '\n'
  )
  // escape hex with no trailing whitespace
  expect(consumeEscape('\\0ahehe', 0)?.[0]).toBe(2)
  expect(String.fromCharCode(consumeEscape('\\0ahehe', 0)?.[1] ?? -1)).toBe(
    '\n'
  )

  expect(consumeEscape('\\0ahehe', 1)).toBe(null)
  expect(consumeEscape(' \\0ahehe', 0)).toBe(null)
})

test('consumeString', () => {
  expect(consumeString(`""`, 0)).toEqual([1, ''])
  expect(consumeString(`"\""`, 0)).toEqual([1, ''])
  expect(consumeString(`'\"'`, 0)).toEqual([2, '"'])
  expect(consumeString(`"\\""`, 0)).toEqual([3, '"'])
  expect(consumeString(`'"'`, 0)).toEqual([2, '"'])
  // escape any
  expect(consumeString(`"\\'"`, 0)).toEqual([3, "'"])
  // escape hex
  expect(consumeString(`"\\0a"`, 0)).toEqual([4, '\n'])
  // escape hex with trailing whitespace
  expect(consumeString(`"\\0a "`, 0)).toEqual([5, '\n'])
  // escape hex with trailing whitespace + more
  expect(consumeString(`"\\0a hehe"`, 0)).toEqual([9, '\nhehe'])
  // escape hex with no trailing whitespace
  expect(consumeString(`"\\0ahehe"`, 0)).toEqual([8, '\nhehe'])

  expect(consumeString(`"typical string really"`, 0)).toEqual([
    22,
    'typical string really'
  ])
  expect(consumeString(`"allow stuff like \\"escapes\\""`, 0)).toEqual([
    29,
    'allow stuff like "escapes"'
  ])
  expect(consumeString(`'Single quotes work too'`, 0)).toEqual([
    23,
    'Single quotes work too'
  ])
  expect(consumeString(`'Mixing quotes does not"`, 0)).toBe(null)
  expect(consumeString(`"\\a9"`, 0)).toEqual([4, '©'])
  expect(consumeString(`"\\"`, 0)).toBe(null)
  expect(consumeString(`"\\\\"`, 0)).toEqual([3, '\\'])
  expect(consumeString(`"\\\\\\"`, 0)).toBe(null)
  expect(consumeString(`"\\\\\\\\"`, 0)).toEqual([5, '\\\\'])
})

test('consumeNumber', () => {
  expect(consumeNumber('', 0)).toEqual(null)
  expect(consumeNumber('-', 0)).toEqual(null)
  expect(consumeNumber('+', 0)).toEqual(null)
  expect(consumeNumber('.', 0)).toEqual(null)
  expect(consumeNumber('.5', 0)).toEqual([1, 0.5, 'number'])
  expect(consumeNumber('1', 0)).toEqual([0, 1, 'integer'])
  expect(consumeNumber('+3', 0)).toEqual([1, 3, 'integer'])
  expect(consumeNumber('-1', 0)).toEqual([1, -1, 'integer'])
  expect(consumeNumber('-.5', 0)).toEqual([2, -0.5, 'number'])
  expect(consumeNumber('1e-1', 0)).toEqual([3, 1e-1, 'number'])
  expect(consumeNumber('3e+1', 0)).toEqual([3, 3e1, 'number'])
  expect(consumeNumber('.5e3', 0)).toEqual([3, 0.5e3, 'number'])
  expect(consumeNumber('2e10', 0)).toEqual([3, 2e10, 'number'])
  expect(consumeNumber('-10e+20', 0)).toEqual([6, -10e20, 'number'])
  expect(consumeNumber('8181818', 0)).toEqual([6, 8181818, 'integer'])
  expect(consumeNumber('-302.1010', 0)).toEqual([8, -302.101, 'number'])
  expect(consumeNumber(' -302.1010', 1)).toEqual([9, -302.101, 'number'])
  expect(consumeNumber(' -302.1010', 0)).toEqual(null)
})

test.only('consumeIdent', () => {
  expect(consumeIdent('', 0)).toEqual([1, ''])
  expect(consumeIdent('alpha', 0)).toEqual([22, 'typical string really'])
  expect(consumeIdent('alpha', 0)).toEqual([29, 'allow stuff like "escapes"'])
  expect(consumeIdent('alpha', 0)).toEqual([23, 'Single quotes work too'])
  expect(consumeIdent('alpha', 0)).toBe(null)
  expect(consumeIdent('alpha', 0)).toEqual([4, '©'])
  expect(consumeIdent('alpha', 0)).toBe(null)
  expect(consumeIdent('alpha', 0)).toEqual([3, '\\'])
  expect(consumeIdent('alpha', 0)).toBe(null)
  expect(consumeIdent('alpha', 0)).toEqual([5, '\\\\'])
})
