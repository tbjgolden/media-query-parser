import { convertToParsingTokens, parseMediaQueryList } from "../ast/ast.js";
import { LiteMediaQueryList, isEqualish, toLiteMediaQueryList } from "../ast/test-helpers.js";
import { Token, lexer } from "../lexer/index.js";
import { flattenMediaQueryList } from "./flatten.js";

const flattenMQL = (str: string): LiteMediaQueryList => {
  return toLiteMediaQueryList(
    flattenMediaQueryList(parseMediaQueryList(convertToParsingTokens(lexer(str) as Token[])))
  );
};

const expectFlattenEq = (unsimplified: string, simplified: string, shouldBeEqual = true) => {
  expect(isEqualish(flattenMQL(unsimplified), flattenMQL(simplified))).toBe(shouldBeEqual);
};

test("wrapper flattens valueless layers", () => {
  expectFlattenEq("(((((hover)) and (((color))))))", "((hover)) and ((color))");
  expectFlattenEq("((hover)) and ((color))", "(hover) and (color)");
  expectFlattenEq("((((hover)))) and ((color))", "((hover)) and ((color))");
  expectFlattenEq("((hover)) and (color)", "(hover) and (color)");
  expectFlattenEq("((hover) and (color))", "(hover) and (color)");
  expectFlattenEq("(not (hover))", "not (hover)");
});

test("wrapper does not flatten useful layers", () => {
  expectFlattenEq("(not (hover)) and (color)", "not (hover) and (color)", false);
  expectFlattenEq(
    "((hover) and (color)) or (aspect-ratio > 2/1)",
    "(hover) and (color) or (aspect-ratio > 2/1)",
    false
  );
  expectFlattenEq("((hover) and (not (color)))", "(hover) and (not (color))");
  expectFlattenEq("((hover) and (not (color)))", "(hover) and not (color)", false);
  expectFlattenEq("screen and (not (not (color)))", "screen and (not (color))", false);
});

test("code coverage misses", () => {
  expectFlattenEq(
    "((hover) and (color) and ((monochrome) and (pointer)))",
    "(hover) and (color) and (monochrome) and (pointer)"
  );
});
