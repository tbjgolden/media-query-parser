import {
  consumeEscape,
  consumeIdent,
  consumeIdentLike,
  consumeNumber,
  consumeNumeric,
  consumeString,
  consumeUrl,
  lexicalAnalysis
} from './lexicalAnalysis'
import fs from 'fs'
import path from 'path'

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

test('consumeNumeric', () => {
  expect(consumeNumeric('', 0)).toEqual(null)
  expect(consumeNumeric('-', 0)).toEqual(null)
  expect(consumeNumeric('+', 0)).toEqual(null)
  expect(consumeNumeric('.', 0)).toEqual(null)
  expect(consumeNumeric('.5', 0)).toEqual([
    1,
    ['<number-token>', 0.5, 'number']
  ])
  expect(consumeNumeric('1', 0)).toEqual([0, ['<number-token>', 1, 'integer']])
  expect(consumeNumeric('+3rem', 0)).toEqual([
    4,
    ['<dimension-token>', 3, 'rem']
  ])
  expect(consumeNumeric('-1ch', 0)).toEqual([
    3,
    ['<dimension-token>', -1, 'ch']
  ])
  expect(consumeNumeric(' -.5', 1)).toEqual([
    3,
    ['<number-token>', -0.5, 'number']
  ])
  expect(consumeNumeric('  1e-1wow', 2)).toEqual([
    8,
    ['<dimension-token>', 1e-1, 'wow']
  ])
  expect(consumeNumeric('  1e-1wow', 0)).toEqual(null)
  expect(consumeNumeric('3e+1', 0)).toEqual([
    3,
    ['<number-token>', 3e1, 'number']
  ])
  expect(consumeNumeric('.5e3% ', 0)).toEqual([
    4,
    ['<percentage-token>', 0.5e3]
  ])
  expect(consumeNumeric('2e10', 0)).toEqual([
    3,
    ['<number-token>', 2e10, 'number']
  ])
  expect(consumeNumeric('1/2', 0)).toEqual([
    0,
    ['<number-token>', 1, 'integer']
  ])
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
  expect(consumeNumber('1/2', 0)).toEqual([0, 1, 'integer'])
  expect(consumeNumber(' -302.1010', 0)).toEqual(null)
})

test('consumeIdent', () => {
  expect(consumeIdent('', 0)).toEqual(null)
  expect(consumeIdent('-', 0)).toEqual(null)
  expect(consumeIdent('-0', 0)).toEqual(null)
  expect(consumeIdent('-a', 0)).toEqual([1, '-a'])
  expect(consumeIdent('--', 0)).toEqual([1, '--'])
  expect(consumeIdent('-\\41', 0)).toEqual([3, '-A'])
  expect(consumeIdent('_', 0)).toEqual([0, '_'])

  expect(consumeIdent('\\31 a2b3c', 0)).toEqual([8, '1a2b3c'])
  expect(consumeIdent('\\#fake-id', 0)).toEqual([8, '#fake-id'])
  expect(consumeIdent('-a-b-c-', 0)).toEqual([6, '-a-b-c-'])

  expect(consumeIdent('0', 0)).toEqual(null)
  expect(consumeIdent('_a', 0)).toEqual([1, '_a'])
  expect(consumeIdent(' abc', 0)).toEqual(null)
  expect(consumeIdent(' abc', 1)).toEqual([3, 'abc'])
  expect(consumeIdent('url', 0)).toEqual([2, 'url'])
  expect(consumeIdent('url(http://something.com)', 0)).toEqual([2, 'url'])
})

test('consumeUrl', () => {
  expect(consumeUrl('url()', 4)).toEqual([4, ''])
  expect(consumeUrl('url(-)', 4)).toEqual([5, '-'])
  expect(consumeUrl('url(-0)', 4)).toEqual([6, '-0'])
  expect(consumeUrl('url(-a)', 4)).toEqual([6, '-a'])
  expect(consumeUrl('url( --)', 4)).toEqual([7, '--'])
  expect(consumeUrl('url(-\\41 )', 4)).toEqual([9, '-A'])
  expect(consumeUrl('url(_  )', 4)).toEqual([7, '_'])
  expect(consumeUrl('url(\\31 a2b3c)', 4)).toEqual([13, '1a2b3c'])
  expect(consumeUrl('url(\\#fake-id)', 4)).toEqual([13, '#fake-id'])
  expect(consumeUrl('url(-a-b -c-)', 4)).toEqual(null)
  expect(consumeUrl('url(0)', 4)).toEqual([5, '0'])
  expect(consumeUrl('url(_a)', 4)).toEqual([6, '_a'])
  expect(consumeUrl('url( abc)', 4)).toEqual([8, 'abc'])
  expect(consumeUrl('url(abc)', 3)).toEqual(null)
  expect(consumeUrl('url( url )', 4)).toEqual([9, 'url'])
})

test('consumeIdentLike', () => {
  expect(consumeIdentLike('', 0)).toEqual(null)
  expect(consumeIdentLike('-', 0)).toEqual(null)
  expect(consumeIdentLike('-0', 0)).toEqual(null)
  expect(consumeIdentLike('-a', 0)).toEqual([1, '-a', '<ident-token>'])
  expect(consumeIdentLike('--', 0)).toEqual([1, '--', '<ident-token>'])
  expect(consumeIdentLike('-\\41', 0)).toEqual([3, '-a', '<ident-token>'])
  expect(consumeIdentLike('_', 0)).toEqual([0, '_', '<ident-token>'])

  expect(consumeIdentLike('\\31 a2b3c', 0)).toEqual([
    8,
    '1a2b3c',
    '<ident-token>'
  ])
  expect(consumeIdentLike('\\#fake-id', 0)).toEqual([
    8,
    '#fake-id',
    '<ident-token>'
  ])
  expect(consumeIdentLike('-a-b-c-', 0)).toEqual([
    6,
    '-a-b-c-',
    '<ident-token>'
  ])

  expect(consumeIdentLike('0', 0)).toEqual(null)
  expect(consumeIdentLike('_a', 0)).toEqual([1, '_a', '<ident-token>'])
  expect(consumeIdentLike(' abc', 0)).toEqual(null)
  expect(consumeIdentLike(' abc', 1)).toEqual([3, 'abc', '<ident-token>'])

  expect(consumeIdentLike('0', 0)).toEqual(null)
  expect(consumeIdentLike('_a', 0)).toEqual([1, '_a', '<ident-token>'])
  expect(consumeIdentLike(' abc', 0)).toEqual(null)
  expect(consumeIdentLike(' abc', 1)).toEqual([3, 'abc', '<ident-token>'])
  expect(consumeIdentLike('url(http://something.com)', 0)).toEqual([
    24,
    'http://something.com',
    '<url-token>'
  ])
  expect(consumeIdentLike('Url(http://google.com/logo.png)', 0)).toEqual([
    30,
    'http://google.com/logo.png',
    '<url-token>'
  ])
})

test('old bugs', () => {
  expect(
    lexicalAnalysis(
      '.dropdown-item:hover{color:#1e2125;background-color:#e9ecef}'
    )
  ).toEqual([
    {
      type: '<delim-token>',
      value: 46
    },
    {
      type: '<ident-token>',
      value: 'dropdown-item'
    },
    {
      type: '<colon-token>'
    },
    {
      type: '<ident-token>',
      value: 'hover'
    },
    {
      type: '<{-token>'
    },
    {
      type: '<ident-token>',
      value: 'color'
    },
    {
      type: '<colon-token>'
    },
    {
      flag: 'unrestricted',
      type: '<hash-token>',
      value: '1e2125'
    },
    {
      type: '<semicolon-token>'
    },
    {
      type: '<ident-token>',
      value: 'background-color'
    },
    {
      type: '<colon-token>'
    },
    {
      flag: 'id',
      type: '<hash-token>',
      value: 'e9ecef'
    },
    {
      type: '<}-token>'
    },
    {
      type: '<EOF-token>'
    }
  ])
  expect(lexicalAnalysis('@media (1/2 < aspect-ratio < 1/1) { }')).toEqual([
    {
      type: '<at-keyword-token>',
      value: 'media'
    },
    {
      type: '<whitespace-token>'
    },
    {
      type: '<(-token>'
    },
    {
      flag: 'integer',
      type: '<number-token>',
      value: 1
    },
    {
      type: '<delim-token>',
      value: 47
    },
    {
      flag: 'integer',
      type: '<number-token>',
      value: 2
    },
    {
      type: '<whitespace-token>'
    },
    {
      type: '<delim-token>',
      value: 60
    },
    {
      type: '<whitespace-token>'
    },
    {
      type: '<ident-token>',
      value: 'aspect-ratio'
    },
    {
      type: '<whitespace-token>'
    },
    {
      type: '<delim-token>',
      value: 60
    },
    {
      type: '<whitespace-token>'
    },
    {
      flag: 'integer',
      type: '<number-token>',
      value: 1
    },
    {
      type: '<delim-token>',
      value: 47
    },
    {
      flag: 'integer',
      type: '<number-token>',
      value: 1
    },
    {
      type: '<)-token>'
    },
    {
      type: '<whitespace-token>'
    },
    {
      type: '<{-token>'
    },
    {
      type: '<whitespace-token>'
    },
    {
      type: '<}-token>'
    },
    {
      type: '<EOF-token>'
    }
  ])
})

test('lexicalAnalysis', () => {
  const input = fs.readFileSync(
    path.join(__dirname, '__fixtures__', 'bootstrap.css'),
    'utf8'
  )
  const output = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '__fixtures__', 'bootstrap.json'),
      'utf8'
    )
  )
  expect(lexicalAnalysis(input)).toEqual(output)
})
