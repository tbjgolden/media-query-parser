import { expectMQ, expectMQL } from "./test-helpers.js";

test("parseMediaQueryList parses media query", async () => {
  expectMQL("", [{ mediaType: "all" }]);
  expectMQL(``, [{ mediaType: "all" }]);
  expectMQ(``, false);
  expectMQL(`,`, []);
  expectMQL(`all,`, [{ mediaType: "all" }]);
  expectMQL(`all, all, all`, [{ mediaType: "all" }, { mediaType: "all" }, { mediaType: "all" }]);
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
            prefix: "min",
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
            prefix: "max",
            value: { flag: "number", type: "dimension", unit: "px", value: 1000 },
          },
        ],
      },
      mediaType: "all",
    },
  ]);
  expectMQL(`all,, all`, [{ mediaType: "all" }, { mediaType: "all" }]);
  expectMQL(`,all, all`, [{ mediaType: "all" }, { mediaType: "all" }]);
  expectMQL(`(all, all), all`, [{ mediaType: "all" }]);
  expectMQL(`((min-width: -100px)`, []);
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
      mediaType: "all",
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
      mediaType: "all",
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
      mediaType: "all",
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
      mediaType: "all",
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
      mediaType: "all",
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
      mediaType: "all",
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
      mediaType: "all",
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
      mediaType: "all",
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
      mediaType: "all",
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
      mediaType: "all",
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
      mediaType: "all",
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
      mediaType: "all",
    },
  ]);
  expectMQL(`(any-hover:hover)`, [
    {
      mediaCondition: {
        children: [
          { context: "value", feature: "any-hover", value: { type: "ident", value: "hover" } },
        ],
      },
      mediaType: "all",
    },
  ]);
  expectMQL(`(any-hover:none)`, [
    {
      mediaCondition: {
        children: [
          { context: "value", feature: "any-hover", value: { type: "ident", value: "none" } },
        ],
      },
      mediaType: "all",
    },
  ]);
  expectMQL(`(any-hover:anything)`, [
    {
      mediaCondition: {
        children: [
          { context: "value", feature: "any-hover", value: { type: "ident", value: "anything" } },
        ],
      },
      mediaType: "all",
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
      mediaType: "all",
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
      mediaType: "all",
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
      mediaType: "all",
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
      mediaType: "all",
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
      mediaType: "all",
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
      mediaType: "all",
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
      mediaType: "all",
    },
  ]);
  expectMQL(`((not (color))) or (hover)`, [
    {
      mediaCondition: {
        children: [
          { children: [{ children: [{ context: "boolean", feature: "color" }], operator: "not" }] },
          { context: "boolean", feature: "hover" },
        ],
        operator: "or",
      },
      mediaType: "all",
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
      mediaType: "all",
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
      mediaType: "all",
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
      mediaType: "all",
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
      mediaType: "all",
    },
  ]);
  expectMQL(`not (hover)`, [
    {
      mediaCondition: {
        children: [{ children: [{ context: "boolean", feature: "hover" }] }],
        operator: "not",
      },
      mediaType: "all",
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
      mediaType: "all",
    },
  ]);

  // 'only' requires a media type
  expectMQ(`only (hover)`, false);
  // 'or' can not appear on the right hand side of a media type (e.g. all/screen/print)
  expectMQ(`screen and (not (color)) or (hover)`, false);
  expectMQ(`only ((hover) or (color))`, false);
  expectMQ(`screen and ((hover) or (color))`, true);
  // 'not' should not be a valid binary operator
  expectMQ(`(color) not (hover)`, false);
  expectMQ(`screen and ((color) not (hover))`, false);
});

test("coverage misses", () => {
  expectMQ(`not`, false);
  expectMQ(`only tty`, { mediaPrefix: "not", mediaType: "all" });
  expectMQ(`not tty`, { mediaType: "all" });
  expectMQ(`not mediatype`, false);
  expectMQ(`not print or (hover)`, false);
  expectMQ(`print or`, false);
  expectMQ(`not print and`, false);
  expectMQ(`not print and`, false);
  expectMQ(`(monochrome) | (hover)`, false);
  expectMQ(`*`, false);
  expectMQ(`(100px < width > 100px)`, false);
  expectMQ(`(100px width)`, false);
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
    mediaType: "all",
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
    mediaType: "all",
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
    mediaType: "all",
  });
  expectMQ(`(1px @ width)`, false);
  expectMQ(`(# < width < 3)`, false);
  expectMQ(`(1px = width < 1)`, false);
  expectMQ(`(width = 1px)`, true);
  expectMQ(`(1px = width)`, true);
  expectMQ(`(1px < width = infinite)`, false);
  expectMQ(`(1px < width : infinite)`, false);
  expectMQ(`(1px < width : )`, false);
  expectMQ(`(1px < < 2px)`, false);
  expectMQ(`(infinity < width < infinity)`, false);
  expectMQ(`(infinite < width < infinity)`, false);
  expectMQ(`(infinity < width < infinite)`, false);
  expectMQ(`(infinite < width < infinite)`, true);
  expectMQ(`(infinite < width < infinite any)`, false);
});
