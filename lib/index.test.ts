import {
  ConditionNode,
  FeatureNode,
  ParserError,
  QueryListNode,
  QueryNode,
  ValueNode,
  isParserError,
  parseMediaCondition,
  parseMediaFeature,
  parseMediaQuery,
  parseMediaQueryList,
  stringify,
} from "./index.js";

const s = (
  ast: QueryListNode | QueryNode | ConditionNode | FeatureNode | ValueNode | ParserError,
): string | false => {
  return isParserError(ast) ? false : stringify(ast);
};

test("parseMediaQueryList", () => {
  expect(s(parseMediaQueryList("[a, b], {c, d}"))).toEqual(false);
  expect(s(parseMediaQuery("screen\0 and (max-width:599px)"))).toEqual(
    "screen� and (max-width: 599px)",
  );
  expect(s(parseMediaQuery("screen\\0 and (max-width:599px)"))).toEqual(false);
  expect(s(parseMediaQueryList("(((((hover)) and (((color ) ) )  )))"))).toEqual(
    "(((((hover)) and (((color))))))",
  );
  expect(
    s(
      parseMediaQueryList(
        "not screen /* :D */ and ((not ((min-width: 1000px) and (orientation: landscape))) or (color))",
      ),
    ),
  ).toEqual("not screen and ((not ((min-width: 1000px) and (orientation: landscape))) or (color))");
  expect(s(parseMediaQueryList("invalid (color-index <= 128)"))).toEqual("not all");
  expect(s(parseMediaQueryList("not print and (110px <= width <= 220px)"))).toEqual(
    "not print and (110px <= width <= 220px)",
  );
  expect(s(parseMediaQueryList("not ((min-width: 100px) and (max-width: 200px))"))).toEqual(
    "not ((min-width: 100px) and (max-width: 200px))",
  );
  expect(s(parseMediaQueryList("not (min-width: 100px) and (max-width: 200px)"))).toEqual(
    "not all",
  );
  expect(s(parseMediaQueryList("not tty"))).toEqual("not tty");
  expect(s(parseMediaQueryList("(min-height: -100px)"))).toEqual("(min-height: -100px)");
});

test("parseMediaQuery", () => {
  expect(s(parseMediaQuery("((monochrome) and (100px < width > 200px))"))).toEqual(false);
  expect(s(parseMediaQuery("( width < 10px )"))).toEqual("(width < 10px)");
  expect(s(parseMediaQuery("vr and (orientation: landscape)"))).toEqual(
    "vr and (orientation: landscape)",
  );
  expect(s(parseMediaQuery("vr and '\n"))).toEqual(false);
});

test("parseMediaCondition", () => {
  expect(s(parseMediaCondition("((hover) and (color))"))).toEqual("((hover) and (color))");
  expect(s(parseMediaCondition("(width: 100px) not (monochrome)"))).toEqual(false);
  expect(s(parseMediaCondition("vr and '\n"))).toEqual(false);
});

test("parseMediaFeature", () => {
  expect(s(parseMediaFeature("(hover)"))).toEqual("(hover)");
  expect(s(parseMediaFeature("(1px < 0)"))).toEqual(false);
  expect(s(parseMediaFeature("vr and '\n"))).toEqual(false);
  expect(s(parseMediaFeature("vr"))).toEqual(false);
  expect(s(parseMediaFeature("(vr"))).toEqual(false);
});

test("stringify", () => {
  expect(s(parseMediaQueryList("(hover)and (color)"))).toEqual("(hover) and (color)");
  expect(s(parseMediaQueryList("( width < 10px )"))).toEqual("(width < 10px)");
  expect(s(parseMediaQuery("( width < 10px )"))).toEqual("(width < 10px)");
  expect(s(parseMediaCondition("( width < 10px )"))).toEqual("(width < 10px)");
  expect(s(parseMediaFeature("( width < 10px )"))).toEqual("(width < 10px)");
  expect(s({ _t: "number", value: 1, flag: true })).toEqual("1");
  expect(s({ _t: "dimension", value: 2, unit: "px" })).toEqual("2px");
  expect(s({ _t: "ratio", left: 3, right: 4 })).toEqual("3/4");
  expect(s({ _t: "ident", value: "five" })).toEqual("five");
});

test("coverage", () => {
  expect(s(parseMediaQuery(`\\\n`))).toEqual(false);
  expect(s(parseMediaQueryList("(((((hover))and\n(((color))))))"))).toEqual(
    "(((((hover)) and (((color))))))",
  );
  expect(s(parseMediaQueryList("[,], {"))).toEqual(false);
  expect(s(parseMediaQuery("not ( width <  )"))).toEqual(false);
  expect(s(parseMediaQuery("only #"))).toEqual(false);
  expect(s(parseMediaQuery("((orientation) and (width < 100px) or (monochrome))"))).toEqual(false);
  expect(s(parseMediaQuery("(100px > width)"))).toEqual("(100px > width)");
  expect(s(parseMediaCondition("width: 100px"))).toEqual(false);
  expect(s(parseMediaQuery("(boaty: #mcboatface)"))).toEqual(false);
  expect(s(parseMediaFeature(""))).toEqual(false);
  expect(s(parseMediaQuery("\u0000"))).toEqual("�");
  expect(s(parseMediaQuery("(\r\n  max-width:\r\n    1000px\r\n)"))).toEqual("(max-width: 1000px)");
  expect(s(parseMediaQuery("(\r  max-width:\r    1000px\r)"))).toEqual("(max-width: 1000px)");
  expect(s(parseMediaQuery("\u000C"))).toEqual(false);
  expect(s(parseMediaQuery("(£: true)"))).toEqual("(£: true)");
  expect(s(parseMediaQuery("(€: false)"))).toEqual("(€: false)");
  expect(s(parseMediaQuery("(𐍈:𐍈)"))).toEqual("(𐍈: 𐍈)");
  expect(s(parseMediaQuery("(𐍈;𐍈)"))).toEqual(false);
  expect(s(parseMediaQuery("(𐍈: /**/ /**/ 𐍈)"))).toEqual("(𐍈: 𐍈)");
  expect(s(parseMediaQuery(`"string" + --x - @val 0% 'string' url("") _`))).toEqual(false);
  expect(s(parseMediaQuery(`screen and (hover) or (color)`))).toEqual(false);
  expect(s(parseMediaQuery(`(hover) or (color)`))).toEqual("(hover) or (color)");
  expect(s(parseMediaQuery(`screen and not (color)`))).toEqual("screen and not (color)");
  expect(s(parseMediaQuery(`SCREEN AND NOT (COLOR)`))).toEqual("screen and not (color)");
  expect(s(parseMediaQuery(`screen and (hover) and (color)`))).toEqual(
    "screen and (hover) and (color)",
  );
});
