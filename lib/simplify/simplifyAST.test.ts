import { convertToParsingTokens, parseMediaQueryList } from "../ast/ast.js";
import { isEqualish, toLiteMediaQueryList } from "../ast/test-helpers.js";
import { Token, lexer } from "../lexer/index.js";
import { simplifyMediaQueryList } from "./simplifyAST.js";

const expectSimplifyEq = (unsimplified: string, simplified: string, shouldBeEqual = true) => {
  const actual = toLiteMediaQueryList(
    simplifyMediaQueryList(
      parseMediaQueryList(convertToParsingTokens(lexer(unsimplified) as Token[]))
    )
  );
  const expected = toLiteMediaQueryList(
    simplifyMediaQueryList(
      parseMediaQueryList(convertToParsingTokens(lexer(simplified) as Token[]))
    )
  );
  expect(isEqualish(actual, expected)).toBe(shouldBeEqual);
};

test("wrapper flattens valueless layers", () => {
  expectSimplifyEq("(((((hover)) and (((color))))))", "((hover)) and ((color))");
  expectSimplifyEq("((hover)) and ((color))", "(hover) and (color)");
  expectSimplifyEq("((((hover)))) and ((color))", "((hover)) and ((color))");
  expectSimplifyEq("((hover)) and (color)", "(hover) and (color)");
  expectSimplifyEq("((hover) and (color))", "(hover) and (color)");
  expectSimplifyEq("(not (hover))", "not (hover)");
});

test("wrapper does not flatten useful layers", () => {
  expectSimplifyEq("(not (hover)) and (color)", "not (hover) and (color)", false);
  expectSimplifyEq(
    "((hover) and (color)) or (aspect-ratio > 2/1)",
    "(hover) and (color) or (aspect-ratio > 2/1)",
    false
  );
  expectSimplifyEq("((hover) and (not (color)))", "(hover) and (not (color))");
  expectSimplifyEq("((hover) and (not (color)))", "(hover) and not (color)", false);
  expectSimplifyEq("screen and (not (not (color)))", "screen and (not (color))", false);
});

test("code coverage misses", () => {
  expectSimplifyEq(
    "((hover) and (color) and ((monochrome) and (pointer)))",
    "(hover) and (color) and (monochrome) and (pointer)"
  );
});
