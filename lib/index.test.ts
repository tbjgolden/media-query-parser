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

  // not ((min-width: 100px) and (max-width: 200px)) should not have mediaPrefix
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
  // not (min-width: 100px) and (max-width: 200px) should fail
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
  // other media types like tty should never match, but not break query
  expect(parseMediaQueryList("not tty")).toEqual({
    type: "query-list",
    mediaQueries: [{ type: "query" }],
  });
  // negative numbers should parse correctly
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
});

const s = (
  ast: MediaQueryList | MediaQuery | MediaCondition | MediaFeature | ValidValueToken | ParserError
): string | ParserError => {
  return isParserError(ast) ? ast : stringify(ast);
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
