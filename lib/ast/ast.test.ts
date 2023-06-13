import { ConvenientToken, readRange, splitMediaQueryList } from "./ast.js";
import { expectMQ, expectMQL } from "./test-helpers.js";

test("parseMediaQueryList parses media query", async () => {
  expectMQ(`((not (color))) or (hover)`, true);
  expectMQL("", [{}]);
  expectMQ(``, "EMPTY_QUERY");
  expectMQL(`,`, [{ prefix: "not" }, { prefix: "not" }]);
  expectMQL(`all,`, [{}, { prefix: "not" }]);
  expectMQL(`all, all, all`, [{}, {}, {}]);
  expectMQL(`only screen and (color)`, [
    {
      mediaCondition: { children: [{ context: "boolean", feature: "color" }] },
      prefix: "only",
      mediaType: "screen",
    },
  ]);
  expectMQL(`not print and (min-width: 10px)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "min",
            value: { flag: "number", type: "dimension", unit: "px", value: 10 },
          },
        ],
      },
      prefix: "not",
      mediaType: "print",
    },
  ]);
  expectMQL(`not print, screen, (max-width: 1000px)`, [
    { prefix: "not", mediaType: "print" },
    { mediaType: "screen" },
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "max",
            value: { flag: "number", type: "dimension", unit: "px", value: 1000 },
          },
        ],
      },
    },
  ]);
  expectMQL(`all,, all`, [{}, { prefix: "not" }, {}]);
  expectMQL(`,all, all`, [{ prefix: "not" }, {}, {}]);
  expectMQL(`(all, all), all`, [{ prefix: "not" }, {}]);
  expectMQL(`((min-width: -100px)`, [{ prefix: "not" }]);
  expectMQL(`(min-width: -100px)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "min",
            value: { flag: "number", type: "dimension", unit: "px", value: -100 },
          },
        ],
      },
    },
  ]);
  expectMQL(`(max-width:1199.98px)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "max",
            value: { flag: "number", type: "dimension", unit: "px", value: 1199.98 },
          },
        ],
      },
    },
  ]);
  expectMQL(`(max-width:1399.98px)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "max",
            value: { flag: "number", type: "dimension", unit: "px", value: 1399.98 },
          },
        ],
      },
    },
  ]);
  expectMQL(`(max-width:575.98px)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "max",
            value: { flag: "number", type: "dimension", unit: "px", value: 575.98 },
          },
        ],
      },
    },
  ]);
  expectMQL(`(max-width:767.98px)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "max",
            value: { flag: "number", type: "dimension", unit: "px", value: 767.98 },
          },
        ],
      },
    },
  ]);
  expectMQL(`(max-width:991.98px)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "max",
            value: { flag: "number", type: "dimension", unit: "px", value: 991.98 },
          },
        ],
      },
    },
  ]);
  expectMQL(`(min-width:1200px)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "min",
            value: { flag: "number", type: "dimension", unit: "px", value: 1200 },
          },
        ],
      },
    },
  ]);
  expectMQL(`(min-width:1400px)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "min",
            value: { flag: "number", type: "dimension", unit: "px", value: 1400 },
          },
        ],
      },
    },
  ]);
  expectMQL(`(min-width:576px)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "min",
            value: { flag: "number", type: "dimension", unit: "px", value: 576 },
          },
        ],
      },
    },
  ]);
  expectMQL(`(min-width:768px)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "min",
            value: { flag: "number", type: "dimension", unit: "px", value: 768 },
          },
        ],
      },
    },
  ]);
  expectMQL(`(min-width:992px)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "min",
            value: { flag: "number", type: "dimension", unit: "px", value: 992 },
          },
        ],
      },
    },
  ]);
  expectMQL(`(prefers-reduced-motion:no-preference)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "prefers-reduced-motion",
            value: { type: "ident", value: "no-preference" },
          },
        ],
      },
    },
  ]);
  expectMQL(`(any-hover:hover)`, [
    {
      mediaCondition: {
        children: [
          { context: "value", feature: "any-hover", value: { type: "ident", value: "hover" } },
        ],
      },
    },
  ]);
  expectMQL(`(any-hover:none)`, [
    {
      mediaCondition: {
        children: [
          { context: "value", feature: "any-hover", value: { type: "ident", value: "none" } },
        ],
      },
    },
  ]);
  expectMQL(`(any-hover:anything)`, [
    {
      mediaCondition: {
        children: [
          { context: "value", feature: "any-hover", value: { type: "ident", value: "anything" } },
        ],
      },
    },
  ]);
  expectMQL(`(grid:0)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "grid",
            value: { flag: "integer", type: "number", value: 0 },
          },
        ],
      },
    },
  ]);
  expectMQL(`(aspect-ratio:16/9)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "aspect-ratio",
            value: { denominator: 9, numerator: 16, type: "ratio" },
          },
        ],
      },
    },
  ]);
  expectMQL(`(prefers-reduced-motion:reduce)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "prefers-reduced-motion",
            value: { type: "ident", value: "reduce" },
          },
        ],
      },
    },
  ]);
  expectMQL(`print`, [{ mediaType: "print" }]);
  expectMQL(`(height > 600px)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "height",
            range: {
              rightOp: ">",
              rightToken: { flag: "number", type: "dimension", unit: "px", value: 600 },
            },
          },
        ],
      },
    },
  ]);
  expectMQL(`(600px < height)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "height",
            range: {
              leftOp: "<",
              leftToken: { flag: "number", type: "dimension", unit: "px", value: 600 },
            },
          },
        ],
      },
    },
  ]);
  expectMQL(`(600px > width)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "width",
            range: {
              leftOp: ">",
              leftToken: { flag: "number", type: "dimension", unit: "px", value: 600 },
            },
          },
        ],
      },
    },
  ]);
  expectMQL(`(width < 600px)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "width",
            range: {
              rightOp: "<",
              rightToken: { flag: "number", type: "dimension", unit: "px", value: 600 },
            },
          },
        ],
      },
    },
  ]);
  expectMQL(`screen and (100px <= width <= 200px)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "width",
            range: {
              leftOp: "<=",
              leftToken: { flag: "number", type: "dimension", unit: "px", value: 100 },
              rightOp: "<=",
              rightToken: { flag: "number", type: "dimension", unit: "px", value: 200 },
            },
          },
        ],
      },
      mediaType: "screen",
    },
  ]);
  expectMQL(`(100px <= width) and (width <= 200px)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "width",
            range: {
              leftOp: "<=",
              leftToken: { flag: "number", type: "dimension", unit: "px", value: 100 },
            },
          },
          {
            context: "range",
            feature: "width",
            range: {
              rightOp: "<=",
              rightToken: { flag: "number", type: "dimension", unit: "px", value: 200 },
            },
          },
        ],
        operator: "and",
      },
    },
  ]);
  expectMQL(`(1/2 < aspect-ratio < 1/1)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "aspect-ratio",
            range: {
              leftOp: "<",
              leftToken: { denominator: 2, numerator: 1, type: "ratio" },
              rightOp: "<",
              rightToken: { denominator: 1, numerator: 1, type: "ratio" },
            },
          },
        ],
      },
    },
  ]);
  expectMQL(`(100px <= width <= 200px)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "width",
            range: {
              leftOp: "<=",
              leftToken: { flag: "number", type: "dimension", unit: "px", value: 100 },
              rightOp: "<=",
              rightToken: { flag: "number", type: "dimension", unit: "px", value: 200 },
            },
          },
        ],
      },
    },
  ]);
  expectMQL(`only screen and (color)`, [
    {
      mediaCondition: { children: [{ context: "boolean", feature: "color" }] },
      prefix: "only",
      mediaType: "screen",
    },
  ]);
  expectMQL(`not ((color) and (hover) and (min-width: 1px))`, [
    {
      mediaCondition: {
        children: [
          {
            children: [
              {
                children: [
                  { context: "boolean", feature: "color" },
                  { context: "boolean", feature: "hover" },
                  {
                    context: "value",
                    feature: "width",
                    prefix: "min",
                    value: { flag: "number", type: "dimension", unit: "px", value: 1 },
                  },
                ],
                operator: "and",
              },
            ],
          },
        ],
        operator: "not",
      },
    },
  ]);
  expectMQL(`not (hover)`, [
    {
      mediaCondition: {
        children: [{ children: [{ context: "boolean", feature: "hover" }] }],
        operator: "not",
      },
    },
  ]);
  expectMQL(`not ((hover) or (color))`, [
    {
      mediaCondition: {
        children: [
          {
            children: [
              {
                children: [
                  { context: "boolean", feature: "hover" },
                  { context: "boolean", feature: "color" },
                ],
                operator: "or",
              },
            ],
          },
        ],
        operator: "not",
      },
    },
  ]);

  // 'only' requires a media type
  expectMQ(`only (hover)`, "EXPECT_TYPE");
  // 'or' can not appear on the right hand side of a media type (e.g. all/screen/print)
  expectMQ(`screen and (not (color)) or (hover)`, "EXPECT_CONDITION");

  expectMQ(`only ((hover) or (color))`, "EXPECT_TYPE");
  expectMQ(`screen and ((hover) or (color))`, true);
  // 'not' should not be a valid binary operator
  expectMQ(`(color) not (hover)`, "EXPECT_FEATURE_OR_CONDITION");
  expectMQ(`screen and ((color) not (hover))`, "EXPECT_CONDITION");
});

test("coverage misses", () => {
  expectMQ(`not`, "EXPECT_LPAREN_OR_TYPE");
  expectMQ(`only tty`, { prefix: "not" });
  expectMQ(`not tty`, {});
  expectMQ(`not mediatype`, "EXPECT_TYPE");
  expectMQ(`not print or (hover)`, "EXPECT_AND");
  expectMQ(`print or`, "EXPECT_AND");
  expectMQ(`not print and`, "EXPECT_CONDITION");
  expectMQ(`(monochrome) | (hover)`, "EXPECT_FEATURE_OR_CONDITION");
  expectMQ(`*`, "EXPECT_LPAREN_OR_TYPE_OR_MODIFIER");
  expectMQ(`(100px < width > 100px)`, "EXPECT_FEATURE_OR_CONDITION");
  expectMQ(`(100px width)`, "EXPECT_FEATURE_OR_CONDITION");
  expectMQ(`(200px >= width >= 100px)`, {
    mediaCondition: {
      children: [
        {
          context: "range",
          feature: "width",
          range: {
            leftOp: ">=",
            leftToken: { flag: "number", type: "dimension", unit: "px", value: 200 },
            rightOp: ">=",
            rightToken: { flag: "number", type: "dimension", unit: "px", value: 100 },
          },
        },
      ],
    },
  });
  expectMQ(`(200px = width)`, {
    mediaCondition: {
      children: [
        {
          context: "range",
          feature: "width",
          range: {
            leftOp: "=",
            leftToken: { flag: "number", type: "dimension", unit: "px", value: 200 },
          },
        },
      ],
    },
  });
  expectMQ(`(width >= 200px)`, {
    mediaCondition: {
      children: [
        {
          context: "range",
          feature: "width",
          range: {
            rightOp: ">=",
            rightToken: { flag: "number", type: "dimension", unit: "px", value: 200 },
          },
        },
      ],
    },
  });
  expectMQ(`(1px @ width)`, "EXPECT_FEATURE_OR_CONDITION");
  expectMQ(`(# < width < 3)`, "EXPECT_FEATURE_OR_CONDITION");
  expectMQ(`(1px = width < 1)`, "EXPECT_FEATURE_OR_CONDITION");
  expectMQ(`(width = 1px)`, true);
  expectMQ(`(1px = width)`, true);
  expectMQ(`(1px < width = infinite)`, "EXPECT_FEATURE_OR_CONDITION");
  expectMQ(`(1px < width : infinite)`, "EXPECT_FEATURE_OR_CONDITION");
  expectMQ(`(1px < width : )`, "EXPECT_FEATURE_OR_CONDITION");
  expectMQ(`(1px < < 2px)`, "EXPECT_FEATURE_OR_CONDITION");
  expectMQ(`(infinity < width < infinity)`, "EXPECT_FEATURE_OR_CONDITION");
  expectMQ(`(infinite < width < infinity)`, "EXPECT_FEATURE_OR_CONDITION");
  expectMQ(`(infinity < width < infinite)`, "EXPECT_FEATURE_OR_CONDITION");
  expectMQ(`(infinite < width < infinite)`, true);
  expectMQ(`(infinite < width < infinite any)`, "EXPECT_FEATURE_OR_CONDITION");
});

test("splitMediaQueryList", () => {
  expect(
    splitMediaQueryList([
      { type: "[", start: 0, end: 0, hasSpaceBefore: false, hasSpaceAfter: false },
      { type: "comma", start: 1, end: 1, hasSpaceBefore: false, hasSpaceAfter: false },
      { type: "]", start: 2, end: 2, hasSpaceBefore: false, hasSpaceAfter: false },
      { type: "comma", start: 3, end: 3, hasSpaceBefore: false, hasSpaceAfter: true },
      { type: "{", start: 5, end: 5, hasSpaceBefore: true, hasSpaceAfter: false },
      { type: "comma", start: 6, end: 6, hasSpaceBefore: false, hasSpaceAfter: true },
      { type: "}", start: 8, end: 8, hasSpaceBefore: true, hasSpaceAfter: false },
    ])
  ).toEqual([
    [
      { type: "[", start: 0, end: 0, hasSpaceBefore: false, hasSpaceAfter: false },
      { type: "comma", start: 1, end: 1, hasSpaceBefore: false, hasSpaceAfter: false },
      { type: "]", start: 2, end: 2, hasSpaceBefore: false, hasSpaceAfter: false },
    ],
    [
      { type: "{", start: 5, end: 5, hasSpaceBefore: true, hasSpaceAfter: false },
      { type: "comma", start: 6, end: 6, hasSpaceBefore: false, hasSpaceAfter: true },
      { type: "}", start: 8, end: 8, hasSpaceBefore: true, hasSpaceAfter: false },
    ],
  ]);
});

test("coverage misses", () => {
  expect(readRange([])).toEqual({ errid: "INVALID_RANGE", start: 0, end: 0 });

  const tokens: ConvenientToken[] = [
    { type: "(", start: 0, end: 0, hasSpaceBefore: false, hasSpaceAfter: false },
    {
      type: "dimension",
      value: 100,
      unit: "px",
      flag: "number",
      start: 1,
      end: 5,
      hasSpaceBefore: false,
      hasSpaceAfter: true,
    },
    { type: "delim", value: 60, start: 7, end: 7, hasSpaceBefore: true, hasSpaceAfter: false },
    { type: "delim", value: 61, start: 8, end: 8, hasSpaceBefore: false, hasSpaceAfter: true },
    {
      type: "ident",
      value: "width",
      start: 10,
      end: 14,
      hasSpaceBefore: true,
      hasSpaceAfter: true,
    },
    { type: "delim", value: 60, start: 16, end: 16, hasSpaceBefore: true, hasSpaceAfter: false },
    { type: "delim", value: 61, start: 17, end: 17, hasSpaceBefore: false, hasSpaceAfter: true },
    {
      type: "dimension",
      value: 200,
      unit: "px",
      flag: "number",
      start: 19,
      end: 23,
      hasSpaceBefore: true,
      hasSpaceAfter: false,
    },
    { type: ")", start: 24, end: 24, hasSpaceBefore: false, hasSpaceAfter: false },
  ];

  expect(readRange(tokens.slice(1))).toEqual({ errid: "EXPECT_LPAREN", start: 1, end: 5 });
  expect(readRange(tokens.slice(0, -1))).toEqual({ errid: "EXPECT_RPAREN", start: 19, end: 23 });
});
