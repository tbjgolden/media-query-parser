import { readMediaCondition, readMediaFeature, readMediaQueryList } from "../ast/ast.js";
import { flattenMediaQueryList } from "../flatten/flatten.js";
import {
  generateMediaCondition,
  generateMediaFeature,
  generateMediaQueryList,
} from "../generator/generator.js";
import { lexer } from "../lexer/lexer.js";
import { ParserToken, isParserError } from "../utils.js";

const expectIdentity = (str: string) => {
  expect(
    generateMediaQueryList(flattenMediaQueryList(readMediaQueryList(lexer(str) as ParserToken[])))
  ).toBe(str);
};

test(`debug`, () => {
  const x = readMediaFeature(lexer("(width:100px)") as ParserToken[]);
  if (!isParserError(x)) {
    expect(generateMediaFeature(x)).toEqual("(width: 100px)");
  }
  const y = readMediaCondition(lexer("(width:100px)") as ParserToken[], true);
  if (!isParserError(y)) {
    expect(generateMediaCondition(y)).toEqual("((width: 100px))");
  }
  const z = readMediaCondition(lexer("(width:100px) and (orientation)") as ParserToken[], true);
  if (!isParserError(z)) {
    expect(generateMediaCondition(z)).toEqual("((width: 100px) and (orientation))");
  }
});

test("wrapper does not flatten useful layers", () => {
  expectIdentity(`all`);
  expectIdentity(`all, all, all`);
  expectIdentity(`only screen and (color)`);
  expectIdentity(`not print and (min-width: 10px)`);
  expectIdentity(`not print, screen, (max-width: 1000px)`);
  expectIdentity(`(min-width: -100px)`);
  expectIdentity(`(max-width: 1199.98px)`);
  expectIdentity(`(max-width: 1399.98px)`);
  expectIdentity(`(max-width: 575.98px)`);
  expectIdentity(`(max-width: 767.98px)`);
  expectIdentity(`(max-width: 991.98px)`);
  expectIdentity(`(min-width: 1200px)`);
  expectIdentity(`(min-width: 1400px)`);
  expectIdentity(`(min-width: 576px)`);
  expectIdentity(`(min-width: 768px)`);
  expectIdentity(`(min-width: 992px)`);
  expectIdentity(`(prefers-reduced-motion: no-preference)`);
  expectIdentity(`(any-hover: hover)`);
  expectIdentity(`(any-hover: none)`);
  expectIdentity(`(any-hover: anything)`);
  expectIdentity(`(grid: 0)`);
  expectIdentity(`(aspect-ratio: 16/9)`);
  expectIdentity(`(prefers-reduced-motion: reduce)`);
  expectIdentity(`print`);
  expectIdentity(`(height > 600px)`);
  expectIdentity(`(600px < height)`);
  expectIdentity(`(600px > width)`);
  expectIdentity(`(width < 600px)`);
  expectIdentity(`screen and (100px <= width <= 200px)`);
  expectIdentity(`(100px <= width) and (width <= 200px)`);
  expectIdentity(`(1/2 < aspect-ratio < 1/1)`);
  expectIdentity(`(100px <= width <= 200px)`);
  expectIdentity(`only screen and (color)`);
  expectIdentity(`not ((color) and (hover) and (min-width: 1px))`);
  expectIdentity(`not (hover)`);
  expectIdentity(`not ((hover) or (color))`);
});
