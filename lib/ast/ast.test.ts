import { expectMQ, expectMQL } from "./test-helpers.js";

test("parseMediaQueryList parses media query", async () => {
  expectMQ(`((not (color))) or (hover)`, "OR_AT_TOP_LEVEL");
  expectMQL("", [{}]);
  expectMQ(``, "EMPTY_QUERY");
  expectMQL(`,`, [{ mediaPrefix: "not" }, { mediaPrefix: "not" }]);
  expectMQL(`all,`, [{}, { mediaPrefix: "not" }]);
  expectMQL(`all, all, all`, [{}, {}, {}]);
  expectMQL(`only screen and (color)`, [
    {
      mediaCondition: { children: [{ context: "boolean", feature: "color" }] },
      mediaPrefix: "only",
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
            mediaPrefix: "min",
            value: { flag: "number", type: "dimension", unit: "px", value: 10 },
          },
        ],
      },
      mediaPrefix: "not",
      mediaType: "print",
    },
  ]);
  expectMQL(`not print, screen, (max-width: 1000px)`, [
    { mediaPrefix: "not", mediaType: "print" },
    { mediaType: "screen" },
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            mediaPrefix: "max",
            value: { flag: "number", type: "dimension", unit: "px", value: 1000 },
          },
        ],
      },
    },
  ]);
  expectMQL(`all,, all`, [{}, { mediaPrefix: "not" }, {}]);
  expectMQL(`,all, all`, [{ mediaPrefix: "not" }, {}, {}]);
  expectMQL(`(all, all), all`, [{ mediaPrefix: "not" }, {}]);
  expectMQL(`((min-width: -100px)`, [{ mediaPrefix: "not" }]);
  expectMQL(`(min-width: -100px)`, [
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            mediaPrefix: "min",
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
            mediaPrefix: "max",
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
            mediaPrefix: "max",
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
            mediaPrefix: "max",
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
            mediaPrefix: "max",
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
            mediaPrefix: "max",
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
            mediaPrefix: "min",
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
            mediaPrefix: "min",
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
            mediaPrefix: "min",
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
            mediaPrefix: "min",
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
            mediaPrefix: "min",
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
              featureName: "height",
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
              featureName: "height",
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
              featureName: "width",
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
              featureName: "width",
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
              featureName: "width",
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
              featureName: "width",
              leftOp: "<=",
              leftToken: { flag: "number", type: "dimension", unit: "px", value: 100 },
            },
          },
          {
            context: "range",
            feature: "width",
            range: {
              featureName: "width",
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
              featureName: "aspect-ratio",
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
              featureName: "width",
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
      mediaPrefix: "only",
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
                    mediaPrefix: "min",
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
  expectMQ(`screen and (not (color)) or (hover)`, "OR_AT_TOP_LEVEL");

  expectMQ(`only ((hover) or (color))`, "EXPECT_TYPE");
  expectMQ(`screen and ((hover) or (color))`, true);
  // 'not' should not be a valid binary operator
  expectMQ(`(color) not (hover)`, "EXPECT_AND_OR_OR");
  expectMQ(`screen and ((color) not (hover))`, "EXPECT_AND_OR_OR");
});

test("coverage misses", () => {
  expectMQ(`not`, "EXPECT_LPAREN_OR_TYPE");
  expectMQ(`only tty`, { mediaPrefix: "not" });
  expectMQ(`not tty`, {});
  expectMQ(`not mediatype`, "EXPECT_TYPE");
  expectMQ(`not print or (hover)`, "EXPECT_AND");
  expectMQ(`print or`, "EXPECT_AND");
  expectMQ(`not print and`, "EMPTY_CONDITION");
  expectMQ(`(monochrome) | (hover)`, "EXPECT_AND_OR_OR");
  expectMQ(`*`, "EXPECT_LPAREN_OR_TYPE_OR_MODIFIER");
  expectMQ(`(100px < width > 100px)`, "INVALID_RANGE");
  expectMQ(`(100px width)`, "INVALID_FEATURE");
  expectMQ(`(200px >= width >= 100px)`, {
    mediaCondition: {
      children: [
        {
          context: "range",
          feature: "width",
          range: {
            featureName: "width",
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
            featureName: "width",
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
            featureName: "width",
            rightOp: ">=",
            rightToken: { flag: "number", type: "dimension", unit: "px", value: 200 },
          },
        },
      ],
    },
  });
  expectMQ(`(1px @ width)`, "INVALID_RANGE");
  expectMQ(`(# < width < 3)`, "INVALID_RANGE");
  expectMQ(`(1px = width < 1)`, "INVALID_RANGE");
  expectMQ(`(width = 1px)`, true);
  expectMQ(`(1px = width)`, true);
  expectMQ(`(1px < width = infinite)`, "INVALID_RANGE");
  expectMQ(`(1px < width : infinite)`, "INVALID_RANGE");
  expectMQ(`(1px < width : )`, "INVALID_RANGE");
  expectMQ(`(1px < < 2px)`, "INVALID_RANGE");
  expectMQ(`(infinity < width < infinity)`, "INVALID_RANGE");
  expectMQ(`(infinite < width < infinity)`, "INVALID_RANGE");
  expectMQ(`(infinity < width < infinite)`, "INVALID_RANGE");
  expectMQ(`(infinite < width < infinite)`, true);
  expectMQ(`(infinite < width < infinite any)`, "INVALID_RANGE");
});
