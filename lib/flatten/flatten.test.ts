import { readMediaQueryList } from "../ast/ast.js";
import { LiteMediaQueryList, isEqualish, toLiteMediaQueryList } from "../ast/test-helpers.js";
import { ParserToken } from "../ast/types.js";
import { lexer } from "../lexer/lexer.js";
import { flattenMediaQueryList } from "./flatten.js";

const flattenMQL = (str: string): LiteMediaQueryList => {
  return toLiteMediaQueryList(
    flattenMediaQueryList(readMediaQueryList(lexer(str) as ParserToken[]))
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
    "((hover) or (color)) and (aspect-ratio > 2/1)",
    "(hover) or (color) and (aspect-ratio > 2/1)",
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
