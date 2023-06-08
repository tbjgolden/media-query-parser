import { lexicalAnalysis } from "./lexicalAnalysis.js";
import {
  toUnflattenedAST,
  removeWhitespace,
  tokenizeMediaFeature,
  tokenizeRange,
} from "./syntacticAnalysis.js";

// 77.55 | 154,180,235-241,312,374,455-459,524,558,562-565,573,600-613,621,624-627,646-648,662-664,682-688,705,710

test("should skip over @media, or error if something else", async () => {
  expect(toUnflattenedAST("@media all")).toEqual([
    { mediaCondition: null, mediaPrefix: null, mediaType: "all" },
  ]);
  expect(() => toUnflattenedAST("@media,all;")).toThrow();
  expect(() => toUnflattenedAST("@media all;")).toThrow();
  expect(toUnflattenedAST("@media all { /* ... */ }")).toEqual([
    { mediaCondition: null, mediaPrefix: null, mediaType: "all" },
  ]);
});

const removeHints = <T extends { wsBefore: boolean; wsAfter: boolean }>(
  tokens: T[]
): Omit<T, "wsBefore" | "wsAfter">[] => tokens.map((t) => removeHint(t));
const removeHint = <T extends { wsBefore: boolean; wsAfter: boolean }>({
  wsBefore: _0,
  wsAfter: _1,
  ...rest
}: T): Omit<T, "wsBefore" | "wsAfter"> => rest;

test("removeWhitespace", async () => {
  expect(removeHints(removeWhitespace([]))).toEqual([]);
  expect(removeHints(removeWhitespace([{ type: "colon" }]))).toEqual([{ type: "colon" }]);
  expect(removeHints(removeWhitespace([{ type: "whitespace" }]))).toEqual([]);
  expect(removeHints(removeWhitespace([{ type: "whitespace" }, { type: "whitespace" }]))).toEqual(
    []
  );
  expect(removeHints(removeWhitespace([{ type: "colon" }, { type: "whitespace" }]))).toEqual([
    { type: "colon" },
  ]);
  expect(removeHints(removeWhitespace([{ type: "whitespace" }, { type: "colon" }]))).toEqual([
    { type: "colon" },
  ]);
  expect(
    removeHints(
      removeWhitespace([
        { type: "whitespace" },
        { type: "colon" },
        { type: "whitespace" },
        { type: "colon" },
        { type: "whitespace" },
      ])
    )
  ).toEqual([{ type: "colon" }, { type: "colon" }]);

  // validate ws hints
  expect(
    removeWhitespace([
      { type: "whitespace" },
      { type: "colon" },
      { type: "whitespace" },
      { type: "colon" },
      { type: "whitespace" },
    ])
  ).toEqual([
    { type: "colon", wsBefore: true, wsAfter: true },
    { type: "colon", wsBefore: true, wsAfter: true },
  ]);
  expect(
    removeWhitespace([
      { type: "whitespace" },
      { type: "colon" },
      { type: "colon" },
      { type: "whitespace" },
    ])
  ).toEqual([
    { type: "colon", wsBefore: true, wsAfter: false },
    { type: "colon", wsBefore: false, wsAfter: true },
  ]);
  expect(removeWhitespace([{ type: "colon" }, { type: "whitespace" }, { type: "colon" }])).toEqual([
    { type: "colon", wsBefore: false, wsAfter: true },
    { type: "colon", wsBefore: true, wsAfter: false },
  ]);
});

test("toUnflattenedAST parses media query", async () => {
  expect(toUnflattenedAST("")).toEqual([
    { mediaCondition: null, mediaPrefix: null, mediaType: "all" },
  ]);
  expect(() => toUnflattenedAST(",")).toThrow();
  expect(toUnflattenedAST("all,")).toEqual([
    { mediaCondition: null, mediaPrefix: null, mediaType: "all" },
  ]);
  expect(toUnflattenedAST("all, all, all")).toEqual([
    { mediaCondition: null, mediaPrefix: null, mediaType: "all" },
    { mediaCondition: null, mediaPrefix: null, mediaType: "all" },
    { mediaCondition: null, mediaPrefix: null, mediaType: "all" },
  ]);
  expect(toUnflattenedAST("only screen and (color)")).toEqual([
    {
      mediaCondition: {
        children: [{ context: "boolean", feature: "color" }],
        operator: null,
      },
      mediaPrefix: "only",
      mediaType: "screen",
    },
  ]);
  expect(toUnflattenedAST("not print and (min-width: 10px)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "min",
            value: {
              flag: "number",
              type: "dimension",
              unit: "px",
              value: 10,
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: "not",
      mediaType: "print",
    },
  ]);
  expect(toUnflattenedAST("not print, screen, (max-width: 1000px)")).toEqual([
    { mediaCondition: null, mediaPrefix: "not", mediaType: "print" },
    { mediaCondition: null, mediaPrefix: null, mediaType: "screen" },
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "max",
            value: {
              flag: "number",
              type: "dimension",
              unit: "px",
              value: 1000,
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  // as url( ) cannot contain a ), so it's a lexer error even before the list is separated by commas
  expect(() => toUnflattenedAST("url(fun()) screen and (color), projection and (color)")).toThrow();
  expect(toUnflattenedAST("all,, all")).toEqual([
    { mediaCondition: null, mediaPrefix: null, mediaType: "all" },
    { mediaCondition: null, mediaPrefix: null, mediaType: "all" },
  ]);
  expect(toUnflattenedAST(",all, all")).toEqual([
    { mediaCondition: null, mediaPrefix: null, mediaType: "all" },
    { mediaCondition: null, mediaPrefix: null, mediaType: "all" },
  ]);
  expect(() => toUnflattenedAST("(all, all), all")).toThrow();
  expect(() => toUnflattenedAST("((min-width: -100px)")).toThrow();

  expect(toUnflattenedAST("(min-width: -100px)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "min",
            value: {
              flag: "number",
              type: "dimension",
              unit: "px",
              value: -100,
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(max-width:1199.98px)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "max",
            value: {
              flag: "number",
              type: "dimension",
              unit: "px",
              value: 1199.98,
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(max-width:1399.98px)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "max",
            value: {
              flag: "number",
              type: "dimension",
              unit: "px",
              value: 1399.98,
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(max-width:575.98px)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "max",
            value: {
              flag: "number",
              type: "dimension",
              unit: "px",
              value: 575.98,
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(max-width:767.98px)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "max",
            value: {
              flag: "number",
              type: "dimension",
              unit: "px",
              value: 767.98,
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(max-width:991.98px)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "max",
            value: {
              flag: "number",
              type: "dimension",
              unit: "px",
              value: 991.98,
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(min-width:1200px)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "min",
            value: {
              flag: "number",
              type: "dimension",
              unit: "px",
              value: 1200,
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(min-width:1400px)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "min",
            value: {
              flag: "number",
              type: "dimension",
              unit: "px",
              value: 1400,
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(min-width:576px)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "min",
            value: {
              flag: "number",
              type: "dimension",
              unit: "px",
              value: 576,
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(min-width:768px)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "min",
            value: {
              flag: "number",
              type: "dimension",
              unit: "px",
              value: 768,
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(min-width:992px)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "width",
            prefix: "min",
            value: {
              flag: "number",
              type: "dimension",
              unit: "px",
              value: 992,
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(prefers-reduced-motion:no-preference)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "prefers-reduced-motion",
            prefix: null,
            value: {
              type: "ident",
              value: "no-preference",
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(any-hover:hover)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "any-hover",
            prefix: null,
            value: {
              type: "ident",
              value: "hover",
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(any-hover:none)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "any-hover",
            prefix: null,
            value: {
              type: "ident",
              value: "none",
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(any-hover:anything)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "any-hover",
            prefix: null,
            value: {
              type: "ident",
              value: "anything",
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(grid:0)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "grid",
            prefix: null,
            value: {
              flag: "integer",
              type: "number",
              value: 0,
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(aspect-ratio:16/9)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "aspect-ratio",
            prefix: null,
            value: { denominator: 9, numerator: 16, type: "ratio" },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(prefers-reduced-motion:reduce)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "prefers-reduced-motion",
            prefix: null,
            value: {
              type: "ident",
              value: "reduce",
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("print")).toEqual([
    {
      mediaCondition: null,
      mediaPrefix: null,
      mediaType: "print",
    },
  ]);
  expect(toUnflattenedAST("(height > 600px)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "height",
            range: {
              featureName: "height",
              leftOp: null,
              leftToken: null,
              rightOp: ">",
              rightToken: {
                flag: "number",
                type: "dimension",
                unit: "px",
                value: 600,
              },
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(600px < height)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "height",
            range: {
              featureName: "height",
              leftOp: "<",
              leftToken: {
                flag: "number",
                type: "dimension",
                unit: "px",
                value: 600,
              },
              rightOp: null,
              rightToken: null,
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(600px > width)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "width",
            range: {
              featureName: "width",
              leftOp: ">",
              leftToken: {
                flag: "number",
                type: "dimension",
                unit: "px",
                value: 600,
              },
              rightOp: null,
              rightToken: null,
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(width < 600px)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "width",
            range: {
              featureName: "width",
              leftOp: null,
              leftToken: null,
              rightOp: "<",
              rightToken: {
                flag: "number",
                type: "dimension",
                unit: "px",
                value: 600,
              },
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("((not (color))) or (hover)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            children: [
              {
                children: [{ context: "boolean", feature: "color" }],
                operator: "not",
              },
            ],
            operator: null,
          },
          { context: "boolean", feature: "hover" },
        ],
        operator: "or",
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("screen and (100px <= width <= 200px)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "width",
            range: {
              featureName: "width",
              leftOp: "<=",
              leftToken: {
                flag: "number",
                type: "dimension",
                unit: "px",
                value: 100,
              },
              rightOp: "<=",
              rightToken: {
                flag: "number",
                type: "dimension",
                unit: "px",
                value: 200,
              },
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "screen",
    },
  ]);
  expect(toUnflattenedAST("(100px <= width) and (width <= 200px)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "width",
            range: {
              featureName: "width",
              leftOp: "<=",
              leftToken: {
                flag: "number",
                type: "dimension",
                unit: "px",
                value: 100,
              },
              rightOp: null,
              rightToken: null,
            },
          },
          {
            context: "range",
            feature: "width",
            range: {
              featureName: "width",
              leftOp: null,
              leftToken: null,
              rightOp: "<=",
              rightToken: {
                flag: "number",
                type: "dimension",
                unit: "px",
                value: 200,
              },
            },
          },
        ],
        operator: "and",
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(1/2 < aspect-ratio < 1/1)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "aspect-ratio",
            range: {
              featureName: "aspect-ratio",
              leftOp: "<",
              leftToken: {
                denominator: 2,
                numerator: 1,
                type: "ratio",
              },
              rightOp: "<",
              rightToken: {
                denominator: 1,
                numerator: 1,
                type: "ratio",
              },
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(100px <= width <= 200px)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "width",
            range: {
              featureName: "width",
              leftOp: "<=",
              leftToken: {
                flag: "number",
                type: "dimension",
                unit: "px",
                value: 100,
              },
              rightOp: "<=",
              rightToken: {
                flag: "number",
                type: "dimension",
                unit: "px",
                value: 200,
              },
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("only screen and (color)")).toEqual([
    {
      mediaCondition: {
        children: [{ context: "boolean", feature: "color" }],
        operator: null,
      },
      mediaPrefix: "only",
      mediaType: "screen",
    },
  ]);
  expect(toUnflattenedAST("not ((color) and (hover) and (min-width: 1px))")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            children: [
              {
                children: [
                  {
                    context: "boolean",
                    feature: "color",
                  },
                  {
                    context: "boolean",
                    feature: "hover",
                  },
                  {
                    context: "value",
                    feature: "width",
                    prefix: "min",
                    value: {
                      flag: "number",
                      type: "dimension",
                      unit: "px",
                      value: 1,
                    },
                  },
                ],
                operator: "and",
              },
            ],
            operator: "not",
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("not (hover)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            children: [
              {
                context: "boolean",
                feature: "hover",
              },
            ],
            operator: "not",
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("not ((hover) or (color))")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            children: [
              {
                children: [
                  {
                    context: "boolean",
                    feature: "hover",
                  },
                  {
                    context: "boolean",
                    feature: "color",
                  },
                ],
                operator: "or",
              },
            ],
            operator: "not",
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  // 'only' requires a media type
  expect(() => toUnflattenedAST("only (hover)")).toThrow();
  // 'or' can not appear on the right hand side of a media type (e.g. all/screen/print)
  expect(() => toUnflattenedAST("screen and (not (color)) or (hover)")).toThrow();
  expect(() => toUnflattenedAST("only ((hover) or (color))")).toThrow();
  expect(() => toUnflattenedAST("screen and ((hover) or (color))")).not.toThrow();
  // 'not' should not be a valid binary operator
  expect(() => toUnflattenedAST("(color) not (hover)")).toThrow();
  expect(() => toUnflattenedAST("screen and ((color) not (hover))")).toThrow();
});

test("coverage misses", () => {
  expect(() => toUnflattenedAST("not")).toThrow();
  expect(toUnflattenedAST("only tty")).toEqual([
    { mediaCondition: null, mediaPrefix: "not", mediaType: "all" },
  ]);
  expect(toUnflattenedAST("not tty")).toEqual([
    { mediaCondition: null, mediaPrefix: null, mediaType: "all" },
  ]);
  expect(() => toUnflattenedAST("not mediatype")).toThrow();
  expect(() => toUnflattenedAST("not print or (hover)")).toThrow();
  expect(() => toUnflattenedAST("print or")).toThrow();
  expect(() => toUnflattenedAST("not print and")).toThrow();
  expect(() => toUnflattenedAST("not print and")).toThrow();
  expect(() => toUnflattenedAST("(monochrome) | (hover)")).toThrow();
  expect(() => toUnflattenedAST("*")).toThrow();
  expect(() =>
    tokenizeMediaFeature(
      ([{ type: "(" }] as const).map((token) => ({
        ...token,
        wsBefore: true,
        wsAfter: true,
      }))
    )
  ).toThrow();
  expect(() =>
    tokenizeMediaFeature(
      (
        [
          { type: "(" },
          { type: "ident", value: "not" },
          { type: "whitespace" },
          { type: "(" },
          { type: ")" },
          { type: ")" },
        ] as const
      ).map((token) => ({ ...token, wsBefore: true, wsAfter: true }))
    )
  ).toThrow();
  expect(() => toUnflattenedAST("(100px < width > 100px)")).toThrow();
  expect(() => toUnflattenedAST("(100px width)")).toThrow();
  expect(() =>
    tokenizeRange(
      (
        [
          { type: "(" },
          { type: "ident", value: "width" },
          { type: "delim", value: 0x003c },
          { type: "number", value: 100, flag: "number" },
        ] as const
      ).map((token) => ({ ...token, wsBefore: true, wsAfter: true }))
    )
  ).toThrow();
  expect(toUnflattenedAST("(200px >= width >= 100px)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "width",
            range: {
              featureName: "width",
              leftOp: ">=",
              leftToken: {
                flag: "number",
                type: "dimension",
                unit: "px",
                value: 200,
              },
              rightOp: ">=",
              rightToken: {
                flag: "number",
                type: "dimension",
                unit: "px",
                value: 100,
              },
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(200px = width)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "width",
            range: {
              featureName: "width",
              leftOp: "=",
              leftToken: {
                flag: "number",
                type: "dimension",
                unit: "px",
                value: 200,
              },
              rightOp: null,
              rightToken: null,
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(toUnflattenedAST("(width >= 200px)")).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "width",
            range: {
              featureName: "width",
              leftOp: null,
              leftToken: null,
              rightOp: ">=",
              rightToken: {
                flag: "number",
                type: "dimension",
                unit: "px",
                value: 200,
              },
            },
          },
        ],
        operator: null,
      },
      mediaPrefix: null,
      mediaType: "all",
    },
  ]);
  expect(() => toUnflattenedAST("(1px @ width)")).toThrow();
  expect(() => toUnflattenedAST("(# < width < 3)")).toThrow();
  expect(() => toUnflattenedAST("(1px = width < 1)")).toThrow();
  expect(() => toUnflattenedAST("(width = 1px)")).not.toThrow();
  expect(() => toUnflattenedAST("(1px = width)")).not.toThrow();
  expect(() => toUnflattenedAST("(1px < width = infinite)")).toThrow();
  expect(() => toUnflattenedAST("(1px < width : infinite)")).toThrow();
  expect(() => toUnflattenedAST("(1px < width : )")).toThrow();
  expect(() => toUnflattenedAST("(1px < < 2px)")).toThrow();
  expect(() =>
    tokenizeRange(removeWhitespace((lexicalAnalysis("(width)") ?? []).slice(0, -1)))
  ).toThrow();
  expect(() => toUnflattenedAST("(infinite < width < infinite)")).not.toThrow();
  expect(() => toUnflattenedAST("(infinite < width < infinite)")).not.toThrow();
});
