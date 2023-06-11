import { parseMediaQueryList } from "./index.js";

test("parseMediaQueryList", () => {
  // sanity check
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
        mediaType: "all",
      },
    ],
  });
});

test("previously discovered bugs", () => {
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
                      mediaPrefix: undefined,
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

  // invalid (color-index <= 128)
  expect(parseMediaQueryList("invalid (color-index <= 128)")).toEqual({
    type: "query-list",
    mediaQueries: [{ type: "query", mediaPrefix: "not", mediaType: "all" }],
  });

  // not print and (110px <= width <= 220px) should have mediaPrefix
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
        mediaType: "all",
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
        mediaType: "all",
        type: "query",
      },
    ],
    type: "query-list",
  });

  // other media types like tty should never match, but not break query
  expect(parseMediaQueryList("not tty")).toEqual({
    type: "query-list",
    mediaQueries: [{ type: "query", mediaType: "all" }],
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
        mediaType: "all",
      },
    ],
  });
});
