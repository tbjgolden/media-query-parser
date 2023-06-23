import { lexer } from "../lexer/lexer.js";
import { ParserToken } from "../utils.js";
import { matchQueryList } from "./ast.js";

const expectValid = (mq: string) => {
  const tokens = lexer(mq) as ParserToken[];
  const query = matchQueryList(tokens).qs[0];
  const isValidQuery = !(query.prefix === "not" && query.type === "all" && !query.condition);
  expect(isValidQuery).toBe(true);
};
const expectInvalid = (mq: string) => {
  const tokens = lexer(mq) as ParserToken[];
  const query = matchQueryList(tokens).qs[0];
  const isValidQuery = !(query.prefix === "not" && query.type === "all" && !query.condition);
  expect(isValidQuery).toBe(false);
};
const expectAll = (mq: string, expected: boolean[]) => {
  const tokens = lexer(mq) as ParserToken[];
  expect(
    matchQueryList(tokens).qs.map(
      (query) => !(query.prefix === "not" && query.type === "all" && !query.condition)
    )
  ).toEqual(expected);
};

test("matchQueryList", async () => {
  expectInvalid(`only ((hover) or (color))`);
  expectValid(`((not (color))) or (hover)`);
  expectAll("", [true]);
  expectValid(``);
  expectValid(`screen and ((hover) or (color))`);
  expectInvalid(`screen and ((color) not (hover))`);
  expectValid(`only tty`);
  expectValid(`not tty`);
  expectValid(`not`);
  expectValid(`not mediatype`);
  expectInvalid(`not print or (hover)`);
  expectInvalid(`print or`);
  expectInvalid(`not print and`);
  expectInvalid(`(monochrome) | (hover)`);
  expectInvalid(`*`);
  expectInvalid(`(100px < width > 100px)`);
  expectInvalid(`(100px width)`);
  expectValid(`(200px >= width >= 100px)`);
  expectValid(`(200px = width)`);
  expectValid(`(width >= 200px)`);
  expectInvalid(`(1px @ width)`);
  expectInvalid(`(# < width < 3)`);
  expectInvalid(`(1px = width < 1)`);
  expectValid(`(width = 1px)`);
  expectValid(`(1px = width)`);
  expectInvalid(`(1px < width = infinite)`);
  expectInvalid(`(1px < width : infinite)`);
  expectInvalid(`(1px < width : )`);
  expectInvalid(`(1px < < 2px)`);
  expectInvalid(`(infinity < width < infinity)`);
  expectInvalid(`(infinite < width < infinity)`);
  expectInvalid(`(infinity < width < infinite)`);
  expectInvalid(`(infinite < width < infinite)`);
  expectInvalid(`(infinite < width < infinite any)`);
});

test("matchQuery", async () => {
  expectAll(`,`, [false, false]);
  expectAll(`all,`, [true, false]);
  expectAll(`all, all, all`, [true, true, true]);
  expectAll(`not print and (min-width: 10px)`, [true]);
  expectAll(`not print, screen, (max-width: 1000px)`, [true, true, true]);
  expectAll(`all,, all`, [true, false, true]);
  expectAll(`,all, all`, [false, true, true]);
  expectAll(`(all, all), all`, [false, true]);
  expectAll(`((min-width: -100px)`, [false]);
  expectAll(`(min-width: -100px)`, [true]);
  expectAll(`(max-width:1199.98px)`, [true]);
  expectAll(`(max-width:1399.98px)`, [true]);
  expectAll(`(max-width:575.98px)`, [true]);
  expectAll(`(max-width:767.98px)`, [true]);
  expectAll(`(max-width:991.98px)`, [true]);
  expectAll(`(min-width:1200px)`, [true]);
  expectAll(`(min-width:1400px)`, [true]);
  expectAll(`(min-width:576px)`, [true]);
  expectAll(`(min-width:768px)`, [true]);
  expectAll(`(min-width:992px)`, [true]);
  expectAll(`(prefers-reduced-motion:no-preference)`, [true]);
  expectAll(`(any-hover:hover)`, [true]);
  expectAll(`(any-hover:none)`, [true]);
  expectAll(`(any-hover:anything)`, [true]);
  expectAll(`(grid:0)`, [true]);
  expectAll(`(aspect-ratio:16/9)`, [true]);
  expectAll(`(prefers-reduced-motion:reduce)`, [true]);
  expectAll(`print`, [true]);
  expectAll(`(height > 600px)`, [true]);
  expectAll(`only screen and (color)`, [true]);
  expectAll(`(600px < height)`, [true]);
  expectAll(`(600px > width)`, [true]);
  expectAll(`(width < 600px)`, [true]);
  expectAll(`screen and (100px <= width <= 200px)`, [true]);
  expectAll(`(100px <= width) and (width <= 200px)`, [true]);
  expectAll(`(1/2 < aspect-ratio < 1/1)`, [true]);
  expectAll(`(100px <= width <= 200px)`, [true]);
  expectAll(`only screen and (color)`, [true]);
  expectAll(`not ((color) and (hover) and (min-width: 1px))`, [true]);
  expectAll(`not (hover)`, [true]);
  expectAll(`not ((hover) or (color))`, [true]);
});
