import {
  MediaCondition,
  MediaFeature,
  MediaQuery,
  MediaQueryList,
  ParserError,
  ValidValueToken,
  isParserError,
  parseMediaCondition,
  parseMediaFeature,
  parseMediaQuery,
  parseMediaQueryList,
  stringify,
} from "./index.js";

test("parseMediaQueryList", () => {
  expect(parseMediaQueryList("[a, b], {c, d}")).toEqual({ errid: "NO_LCURLY", start: 8, end: 8 });
  expect(parseMediaQueryList("(((((hover)) and (((color))))))")).toEqual({
    type: "query-list",
    mediaQueries: [
      {
        type: "query",
        mediaCondition: {
          type: "condition",
          children: [
            { type: "feature", context: "boolean", feature: "hover" },
            { type: "feature", context: "boolean", feature: "color" },
          ],
          operator: "and",
        },
      },
    ],
  });
  expect(
    parseMediaQueryList(
      "not screen and ((not ((min-width: 1000px) and (orientation: landscape))) or (color))"
    )
  ).toEqual({
    mediaQueries: [
      {
        mediaCondition: {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      context: "value",
                      feature: "width",
                      mediaPrefix: "min",
                      type: "feature",
                      value: {
                        flag: "number",
                        type: "dimension",
                        unit: "px",
                        value: 1000,
                      },
                    },
                    {
                      context: "value",
                      feature: "orientation",
                      type: "feature",
                      value: {
                        type: "ident",
                        value: "landscape",
                      },
                    },
                  ],
                  operator: "and",
                  type: "condition",
                },
              ],
              operator: "not",
              type: "condition",
            },
            { context: "boolean", feature: "color", type: "feature" },
          ],
          operator: "or",
          type: "condition",
        },
        mediaPrefix: "not",
        mediaType: "screen",
        type: "query",
      },
    ],
    type: "query-list",
  });
  expect(parseMediaQueryList("invalid (color-index <= 128)")).toEqual({
    type: "query-list",
    mediaQueries: [{ type: "query", mediaPrefix: "not" }],
  });
  expect(parseMediaQueryList("not print and (110px <= width <= 220px)")).toEqual({
    type: "query-list",
    mediaQueries: [
      {
        type: "query",
        mediaCondition: {
          type: "condition",
          children: [
            {
              type: "feature",
              context: "range",
              feature: "width",
              range: {
                featureName: "width",
                leftOp: "<=",
                leftToken: {
                  flag: "number",
                  type: "dimension",
                  unit: "px",
                  value: 110,
                },
                rightOp: "<=",
                rightToken: {
                  flag: "number",
                  type: "dimension",
                  unit: "px",
                  value: 220,
                },
              },
            },
          ],
        },
        mediaPrefix: "not",
        mediaType: "print",
      },
    ],
  });
  expect(parseMediaQueryList("not ((min-width: 100px) and (max-width: 200px))")).toEqual({
    type: "query-list",
    mediaQueries: [
      {
        type: "query",
        mediaCondition: {
          type: "condition",
          children: [
            {
              type: "condition",
              children: [
                {
                  type: "feature",
                  context: "value",
                  feature: "width",
                  mediaPrefix: "min",
                  value: {
                    flag: "number",
                    type: "dimension",
                    unit: "px",
                    value: 100,
                  },
                },
                {
                  type: "feature",
                  context: "value",
                  feature: "width",
                  mediaPrefix: "max",
                  value: {
                    flag: "number",
                    type: "dimension",
                    unit: "px",
                    value: 200,
                  },
                },
              ],
              operator: "and",
            },
          ],
          operator: "not",
        },
      },
    ],
  });
  expect(parseMediaQueryList("not (min-width: 100px) and (max-width: 200px)")).toEqual({
    mediaQueries: [
      {
        mediaCondition: {
          children: [
            {
              children: [
                {
                  context: "value",
                  feature: "width",
                  mediaPrefix: "min",
                  type: "feature",
                  value: { flag: "number", type: "dimension", unit: "px", value: 100 },
                },
                {
                  context: "value",
                  feature: "width",
                  mediaPrefix: "max",
                  type: "feature",
                  value: { flag: "number", type: "dimension", unit: "px", value: 200 },
                },
              ],
              operator: "and",
              type: "condition",
            },
          ],
          operator: "not",
          type: "condition",
        },
        type: "query",
      },
    ],
    type: "query-list",
  });
  expect(parseMediaQueryList("not tty")).toEqual({
    type: "query-list",
    mediaQueries: [{ type: "query" }],
  });
  expect(parseMediaQueryList("(min-height: -100px)")).toEqual({
    type: "query-list",
    mediaQueries: [
      {
        type: "query",
        mediaCondition: {
          type: "condition",
          children: [
            {
              type: "feature",
              context: "value",
              feature: "height",
              mediaPrefix: "min",
              value: {
                flag: "number",
                type: "dimension",
                unit: "px",
                value: -100,
              },
            },
          ],
        },
      },
    ],
  });
});

test("parseMediaQuery", () => {
  expect(parseMediaQuery("((monochrome) and (100px < width > 200px))")).toEqual({
    errid: "INVALID_RANGE",
    start: 18,
    end: 40,
    child: {
      errid: "EXPECT_RANGE",
      start: 18,
      end: 40,
      child: {
        errid: "EXPECT_FEATURE_OR_CONDITION",
        start: 18,
        end: 40,
        child: {
          errid: "EXPECT_FEATURE_OR_CONDITION",
          start: 0,
          end: 41,
          child: { errid: "EXPECT_FEATURE_OR_CONDITION", start: 1, end: 1 },
        },
      },
    },
  });
  expect(parseMediaQuery("( width < 10px )")).toEqual({
    type: "query",
    mediaCondition: {
      type: "condition",
      children: [
        {
          type: "feature",
          context: "range",
          feature: "width",
          range: {
            featureName: "width",
            rightOp: "<",
            rightToken: { type: "dimension", value: 10, unit: "px", flag: "number" },
          },
        },
      ],
    },
  });
  expect(parseMediaQuery("vr and (orientation: landscape)")).toEqual({
    errid: "EXPECT_TYPE",
    start: 0,
    end: 1,
  });
  expect(parseMediaQuery("vr and '\n")).toEqual({
    errid: "INVALID_STRING",
    start: 7,
    end: 7,
  });
});

test("parseMediaCondition", () => {
  expect(parseMediaCondition("((hover) and (color))")).toEqual({
    type: "condition",
    operator: "and",
    children: [
      { type: "feature", context: "boolean", feature: "hover" },
      { type: "feature", context: "boolean", feature: "color" },
    ],
  });
  expect(parseMediaCondition("(width: 100px) not (monochrome)")).toEqual({
    errid: "EXPECT_AND_OR_OR",
    start: 15,
    end: 17,
  });
  expect(parseMediaCondition("vr and '\n")).toEqual({
    errid: "INVALID_STRING",
    start: 7,
    end: 7,
  });
});

test("parseMediaFeature", () => {
  expect(parseMediaFeature("(hover)")).toEqual({
    type: "feature",
    context: "boolean",
    feature: "hover",
  });
  expect(parseMediaFeature("(1px < 0)")).toEqual({
    errid: "EXPECT_RANGE",
    start: 0,
    end: 8,
    child: { errid: "INVALID_RANGE", start: 0, end: 8 },
  });
  expect(parseMediaFeature("vr and '\n")).toEqual({
    errid: "INVALID_STRING",
    start: 7,
    end: 7,
  });
  expect(parseMediaFeature("vr")).toEqual({ errid: "EXPECT_LPAREN", start: 0, end: 1 });
  expect(parseMediaFeature("(vr")).toEqual({ errid: "EXPECT_RPAREN", start: 3, end: 3 });
});

const s = (
  ast: MediaQueryList | MediaQuery | MediaCondition | MediaFeature | ValidValueToken | ParserError
): string | ParserError => {
  return isParserError(ast) ? ast.errid : stringify(ast);
};

test("stringify", () => {
  expect(s(parseMediaQueryList("(((((hover)) and (((color))))))"))).toEqual("(hover) and (color)");
  expect(s(parseMediaQueryList("( width < 10px )"))).toEqual("(width < 10px)");
  expect(s(parseMediaQuery("( width < 10px )"))).toEqual("(width < 10px)");
  expect(s(parseMediaCondition("( width < 10px )"))).toEqual("((width < 10px))");
  expect(s(parseMediaFeature("( width < 10px )"))).toEqual("(width < 10px)");
  expect(s({ type: "number", value: 1, flag: "integer" })).toEqual("1");
  expect(s({ type: "dimension", value: 2, unit: "px", flag: "number" })).toEqual("2px");
  expect(s({ type: "ratio", numerator: 3, denominator: 4 })).toEqual("3/4");
  expect(s({ type: "ident", value: "five" })).toEqual("five");
});

test("coverage", () => {
  expect(s(parseMediaQuery(`\\\n`))).toEqual("EXPECT_LPAREN_OR_TYPE_OR_MODIFIER");
  expect(s(parseMediaQueryList("(((((hover)) and (((color))))))"))).toEqual("(hover) and (color)");
  expect(s(parseMediaQueryList("[,], {"))).toEqual("NO_LCURLY");
  expect(s(parseMediaQuery("not ( width <  )"))).toEqual("INVALID_FEATURE");
  expect(s(parseMediaQuery("only #"))).toEqual("EXPECT_TYPE");
  expect(s(parseMediaQuery("((orientation) and (width < 100px) or (monochrome))"))).toEqual(
    "MIX_AND_WITH_OR"
  );
  expect(s(parseMediaCondition("width: 100px"))).toEqual("EXPECT_LPAREN");
  expect(s(parseMediaQuery("(boaty: #mcboatface)"))).toEqual("EXPECT_VALUE");
  expect(s(parseMediaFeature(""))).toEqual("EMPTY_FEATURE");
  expect(s(parseMediaQuery("\u0000"))).toEqual("EXPECT_TYPE");
  expect(s(parseMediaQuery("(\r\n  max-width:\r\n    1000px\r\n)"))).toEqual("(max-width: 1000px)");
  expect(s(parseMediaQuery("(\r  max-width:\r    1000px\r)"))).toEqual("(max-width: 1000px)");
  expect(s(parseMediaQuery("\u0000"))).toEqual("EXPECT_TYPE");
  expect(s(parseMediaQuery("\u000C"))).toEqual("EMPTY_QUERY");
  expect(s(parseMediaQuery("(£: true)"))).toEqual("(£: true)");
  expect(s(parseMediaQuery("(€: false)"))).toEqual("(€: false)");
  expect(s(parseMediaQuery("(𐍈:𐍈)"))).toEqual("(𐍈: 𐍈)");
  expect(s(parseMediaQuery("(𐍈;𐍈)"))).toEqual("NO_SEMICOLON");
  expect(s(parseMediaQuery("(𐍈: /**/ /**/ 𐍈)"))).toEqual("(𐍈: 𐍈)");
  expect(s(parseMediaQuery(`"string" + --x - @val 0% 'string' url("") _`))).toEqual(
    "EXPECT_LPAREN_OR_TYPE_OR_MODIFIER"
  );
  expect(s(parseMediaQuery(`screen and (hover) or (color)`))).toEqual("MIX_AND_WITH_OR");
  expect(s(parseMediaQuery(`(hover) or (color)`))).toEqual("(hover) or (color)");
  expect(s(parseMediaQuery(`screen and not (color)`))).toEqual("screen and not (color)");
  expect(s(parseMediaQuery(`SCREEN AND NOT (COLOR)`))).toEqual("screen and not (color)");
});
