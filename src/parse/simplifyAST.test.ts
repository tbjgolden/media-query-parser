import { AST, toUnflattenedAST as _toUnflattenedAST } from './syntacticAnalysis'
import { simplifyAST } from './simplifyAST'

const asSimpleAST = (str: string): AST | string => {
  try {
    return simplifyAST(_toUnflattenedAST(str))
  } catch (err) {
    return err instanceof Error ? err.message : 'Error'
  }
}

test('wrapper flattens valueless layers', () => {
  expect(asSimpleAST('(((((hover)) and (((color))))))')).toEqual(
    asSimpleAST('((hover)) and ((color))')
  )
  expect(asSimpleAST('((hover)) and ((color))')).toEqual(
    asSimpleAST('(hover) and (color)')
  )
  expect(asSimpleAST('((((hover)))) and ((color))')).toEqual(
    asSimpleAST('((hover)) and ((color))')
  )
  expect(asSimpleAST('((hover)) and (color)')).toEqual(
    asSimpleAST('(hover) and (color)')
  )
  expect(asSimpleAST('((hover) and (color))')).toEqual(
    asSimpleAST('(hover) and (color)')
  )
  expect(asSimpleAST('(not (hover))')).toEqual(asSimpleAST('not (hover)'))
})

test('wrapper does not flatten useful layers', () => {
  expect(asSimpleAST('(not (hover)) and (color)')).not.toEqual(
    asSimpleAST('not (hover) and (color)')
  )
  expect(
    asSimpleAST('((hover) and (color)) or (aspect-ratio > 2/1)')
  ).not.toEqual(asSimpleAST('(hover) and (color) or (aspect-ratio > 2/1)'))
  expect(asSimpleAST('((hover) and (not (color)))')).toEqual(
    asSimpleAST('(hover) and (not (color))')
  )
  expect(asSimpleAST('((hover) and (not (color)))')).not.toEqual(
    asSimpleAST('(hover) and not (color)')
  )
  expect(asSimpleAST('screen and (not (not (color)))')).not.toEqual(
    asSimpleAST('screen and (not (color))')
  )
})
