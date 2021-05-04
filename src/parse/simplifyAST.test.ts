import { AST, toUnflattenedAST } from './syntacticAnalysis'
import { simplifyAST } from './simplifyAST'

const wrapper = (str: string): AST | null => {
  const ast = toUnflattenedAST(str)
  return ast === null ? ast : simplifyAST(ast)
}

test('wrapper flattens valueless layers', () => {
  expect(wrapper('(((((hover)) and (((color))))))')).toEqual(
    wrapper('((hover)) and ((color))')
  )
  expect(wrapper('((hover)) and ((color))')).toEqual(
    wrapper('(hover) and (color)')
  )
  expect(wrapper('((((hover)))) and ((color))')).toEqual(
    wrapper('((hover)) and ((color))')
  )
  expect(wrapper('((hover)) and (color)')).toEqual(
    wrapper('(hover) and (color)')
  )
  expect(wrapper('((hover) and (color))')).toEqual(
    wrapper('(hover) and (color)')
  )
  expect(wrapper('(not (hover))')).toEqual(wrapper('not (hover)'))
})

test('wrapper does not flatten useful layers', () => {
  expect(wrapper('(not (hover)) and (color)')).not.toEqual(
    wrapper('not (hover) and (color)')
  )
  expect(wrapper('((hover) and (color)) or (aspect-ratio > 2/1)')).not.toEqual(
    wrapper('(hover) and (color) or (aspect-ratio > 2/1)')
  )
  expect(wrapper('((hover) and (not (color)))')).toEqual(
    wrapper('(hover) and (not (color))')
  )
  expect(wrapper('((hover) and (not (color)))')).not.toEqual(
    wrapper('(hover) and not (color)')
  )
  expect(wrapper('screen and (not (not (color)))')).not.toEqual(
    wrapper('screen and (not (color))')
  )
})
