import { matchCondition, matchFeature, matchQueryList } from "../ast/ast.js";
import { generateCondition, generateFeature, generateQueryList } from "../generator/generator.js";
import { lexer } from "../lexer/lexer.js";
import { ParserToken } from "../utils.js";

const expectIdentity = (str: string) => {
  const ast = matchQueryList(lexer(str) as ParserToken[]);
  expect(generateQueryList(ast)).toBe(str);
};
const expectToBecome = (input: string, output: string) => {
  const ast = matchQueryList(lexer(input) as ParserToken[]);
  expect(generateQueryList(ast)).toBe(output);
};

test("ensure generator regenerates same query", () => {
  const a = matchFeature(lexer("(width:100px)") as ParserToken[])?.t;
  if (a) {
    expect(generateFeature(a)).toEqual("(width: 100px)");
  }
  const b = matchCondition(lexer("(width:100px)") as ParserToken[])?.t;
  if (b) {
    expect(generateCondition(b)).toEqual("(width: 100px)");
  }
  const c = matchCondition(lexer("(width:100px) and (orientation)") as ParserToken[])?.t;
  if (c) {
    expect(generateCondition(c)).toEqual("(width: 100px) and (orientation)");
  }
  const d = matchCondition(lexer("((width:100px) and (orientation))") as ParserToken[])?.t;
  if (d) {
    expect(generateCondition(d)).toEqual("((width: 100px) and (orientation))");
  }

  expectIdentity(`screen and (100px <= width <= 200px)`);
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
  expectToBecome(`(600px < height)`, "(height > 600px)");
  expectToBecome(`(600px > width)`, "(width < 600px)");
  expectIdentity(`(width < 600px)`);
  expectToBecome(`(100px <= width) and (width <= 200px)`, "(width >= 100px) and (width <= 200px)");
  expectIdentity(`(1/2 < aspect-ratio < 1/1)`);
  expectIdentity(`(100px <= width <= 200px)`);
  expectIdentity(`only screen and (color)`);
  expectIdentity(`not (hover)`);
  expectIdentity(`not ((hover) or (color))`);
  expectIdentity(`not ((color) and (hover) and (min-width: 1px))`);
});
