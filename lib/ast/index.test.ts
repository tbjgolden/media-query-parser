import {
  convertToParsingTokens,
  isParsingError,
  parseMediaFeature,
  parseMediaQuery,
  parseMediaQueryList,
  parseRange,
} from "./ast.js";
import type { DelimToken, EOFToken, IdentToken, NumberToken, Token } from "../lexer/types.js";
import type { ParsingToken } from "./types.js";
import { lexer } from "../lexer/index.js";

const l = (strings: TemplateStringsArray): ParsingToken[] =>
  convertToParsingTokens(lexer(strings[0]) as Token[]);
const t = (...tokens: Omit<Exclude<Token, EOFToken>, "start" | "end">[]) =>
  tokens.map((token) => ({ ...token, start: -1, end: -1 } as Exclude<Token, EOFToken>));
const simplify = (parsingTokens: ParsingToken[]): Token[] =>
  parsingTokens.map((parsingToken) => {
    const { hasSpaceBefore: _0, hasSpaceAfter: _1, ...token } = parsingToken;
    return token;
  });

test("convertToParsingTokens", async () => {
  expect(simplify(convertToParsingTokens(t()))).toEqual(t());
  expect(simplify(convertToParsingTokens(t({ type: "colon" })))).toEqual(t({ type: "colon" }));
  expect(simplify(convertToParsingTokens(t({ type: "whitespace" })))).toEqual([]);
  expect(
    simplify(convertToParsingTokens(t({ type: "whitespace" }, { type: "whitespace" })))
  ).toEqual([]);
  expect(simplify(convertToParsingTokens(t({ type: "colon" }, { type: "whitespace" })))).toEqual(
    t({ type: "colon" })
  );
  expect(simplify(convertToParsingTokens(t({ type: "whitespace" }, { type: "colon" })))).toEqual(
    t({ type: "colon" })
  );
  expect(
    simplify(
      convertToParsingTokens(
        t(
          { type: "whitespace" },
          { type: "colon" },
          { type: "whitespace" },
          { type: "colon" },
          { type: "whitespace" }
        )
      )
    )
  ).toEqual(t({ type: "colon" }, { type: "colon" }));

  // validate ws hints
  expect(
    simplify(
      convertToParsingTokens(
        t(
          { type: "whitespace" },
          { type: "colon" },
          { type: "whitespace" },
          { type: "colon" },
          { type: "whitespace" }
        )
      )
    )
  ).toEqual(t({ type: "colon" }, { type: "colon" }));
  expect(
    simplify(
      convertToParsingTokens(
        t({ type: "whitespace" }, { type: "colon" }, { type: "colon" }, { type: "whitespace" })
      )
    )
  ).toEqual(t({ type: "colon" }, { type: "colon" }));
  expect(
    simplify(
      convertToParsingTokens(t({ type: "colon" }, { type: "whitespace" }, { type: "colon" }))
    )
  ).toEqual(t({ type: "colon" }, { type: "colon" }));
});

test("parseMediaQueryList parses media query", async () => {
  expect(parseMediaQueryList(l``)).toEqual([{ mediaType: "all" }]);
  expect(isParsingError(parseMediaQuery(l``))).toBe(true);
  expect(parseMediaQueryList(l`,`)).toEqual([]);
  expect(parseMediaQueryList(l`all,`)).toEqual([{ mediaType: "all" }]);
  expect(parseMediaQueryList(l`all, all, all`)).toEqual([
    { mediaType: "all" },
    { mediaType: "all" },
    { mediaType: "all" },
  ]);
  expect(parseMediaQueryList(l`only screen and (color)`)).toEqual([
    {
      mediaCondition: {
        children: [{ context: "boolean", feature: "color" }],
      },
      mediaPrefix: "only",
      mediaType: "screen",
    },
  ]);
  expect(parseMediaQueryList(l`not print and (min-width: 10px)`)).toEqual([
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
      },
      mediaPrefix: "not",
      mediaType: "print",
    },
  ]);
  expect(parseMediaQueryList(l`not print, screen, (max-width: 1000px)`)).toEqual([
    { mediaPrefix: "not", mediaType: "print" },
    { mediaType: "screen" },
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
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`all,, all`)).toEqual([{ mediaType: "all" }, { mediaType: "all" }]);
  expect(parseMediaQueryList(l`,all, all`)).toEqual([{ mediaType: "all" }, { mediaType: "all" }]);
  expect(parseMediaQueryList(l`(all, all), all`)).toEqual([{ mediaType: "all" }]);
  expect(parseMediaQueryList(l`((min-width: -100px)`)).toEqual([]);

  expect(parseMediaQueryList(l`(min-width: -100px)`)).toEqual([
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
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(max-width:1199.98px)`)).toEqual([
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
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(max-width:1399.98px)`)).toEqual([
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
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(max-width:575.98px)`)).toEqual([
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
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(max-width:767.98px)`)).toEqual([
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
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(max-width:991.98px)`)).toEqual([
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
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(min-width:1200px)`)).toEqual([
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
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(min-width:1400px)`)).toEqual([
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
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(min-width:576px)`)).toEqual([
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
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(min-width:768px)`)).toEqual([
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
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(min-width:992px)`)).toEqual([
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
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(prefers-reduced-motion:no-preference)`)).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "prefers-reduced-motion",

            value: {
              type: "ident",
              value: "no-preference",
            },
          },
        ],
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(any-hover:hover)`)).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "any-hover",

            value: {
              type: "ident",
              value: "hover",
            },
          },
        ],
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(any-hover:none)`)).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "any-hover",

            value: {
              type: "ident",
              value: "none",
            },
          },
        ],
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(any-hover:anything)`)).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "any-hover",

            value: {
              type: "ident",
              value: "anything",
            },
          },
        ],
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(grid:0)`)).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "grid",

            value: {
              flag: "integer",
              type: "number",
              value: 0,
            },
          },
        ],
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(aspect-ratio:16/9)`)).toEqual([
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
  expect(parseMediaQueryList(l`(prefers-reduced-motion:reduce)`)).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "value",
            feature: "prefers-reduced-motion",

            value: {
              type: "ident",
              value: "reduce",
            },
          },
        ],
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`print`)).toEqual([
    {
      mediaType: "print",
    },
  ]);
  expect(parseMediaQueryList(l`(height > 600px)`)).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "height",
            range: {
              featureName: "height",

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
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(600px < height)`)).toEqual([
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
            },
          },
        ],
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(600px > width)`)).toEqual([
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
            },
          },
        ],
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(width < 600px)`)).toEqual([
    {
      mediaCondition: {
        children: [
          {
            context: "range",
            feature: "width",
            range: {
              featureName: "width",

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
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`((not (color))) or (hover)`)).toEqual([
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
          },
          { context: "boolean", feature: "hover" },
        ],
        operator: "or",
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`screen and (100px <= width <= 200px)`)).toEqual([
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
      },

      mediaType: "screen",
    },
  ]);
  expect(parseMediaQueryList(l`(100px <= width) and (width <= 200px)`)).toEqual([
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
            },
          },
          {
            context: "range",
            feature: "width",
            range: {
              featureName: "width",

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

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(1/2 < aspect-ratio < 1/1)`)).toEqual([
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
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`(100px <= width <= 200px)`)).toEqual([
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
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`only screen and (color)`)).toEqual([
    {
      mediaCondition: {
        children: [{ context: "boolean", feature: "color" }],
      },
      mediaPrefix: "only",
      mediaType: "screen",
    },
  ]);
  expect(parseMediaQueryList(l`not ((color) and (hover) and (min-width: 1px))`)).toEqual([
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
          },
        ],
        operator: "not",
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`not (hover)`)).toEqual([
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
          },
        ],
        operator: "not",
      },

      mediaType: "all",
    },
  ]);
  expect(parseMediaQueryList(l`not ((hover) or (color))`)).toEqual([
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
          },
        ],
        operator: "not",
      },

      mediaType: "all",
    },
  ]);
  // 'only' requires a media type
  expect(isParsingError(parseMediaQuery(l`only (hover)`))).toBe(true);
  // 'or' can not appear on the right hand side of a media type (e.g. all/screen/print)
  expect(isParsingError(parseMediaQuery(l`screen and (not (color)) or (hover)`))).toBe(true);
  expect(isParsingError(parseMediaQuery(l`only ((hover) or (color))`))).toBe(true);
  expect(isParsingError(parseMediaQuery(l`screen and ((hover) or (color))`))).toBe(false);
  // 'not' should not be a valid binary operator
  expect(isParsingError(parseMediaQuery(l`(color) not (hover)`))).toBe(true);
  expect(isParsingError(parseMediaQuery(l`screen and ((color) not (hover))`))).toBe(true);
});

test("coverage misses", () => {
  expect(isParsingError(parseMediaQuery(l`not`))).toBe(true);
  expect(parseMediaQuery(l`only tty`)).toEqual({ mediaPrefix: "not", mediaType: "all" });
  expect(parseMediaQuery(l`not tty`)).toEqual({ mediaType: "all" });
  expect(isParsingError(parseMediaQuery(l`not mediatype`))).toBe(true);
  expect(isParsingError(parseMediaQuery(l`not print or (hover)`))).toBe(true);
  expect(isParsingError(parseMediaQuery(l`print or`))).toBe(true);
  expect(isParsingError(parseMediaQuery(l`not print and`))).toBe(true);
  expect(isParsingError(parseMediaQuery(l`not print and`))).toBe(true);
  expect(isParsingError(parseMediaQuery(l`(monochrome) | (hover)`))).toBe(true);
  expect(isParsingError(parseMediaQuery(l`*`))).toBe(true);
  expect(
    isParsingError(
      parseMediaFeature([
        { type: "(", start: 0, end: 0, hasSpaceAfter: false, hasSpaceBefore: false },
      ])
    )
  ).toBe(true);
  expect(
    isParsingError(
      parseMediaFeature(
        t(
          { type: "(" },
          { type: "ident", value: "not" } as IdentToken,
          { type: "whitespace" },
          { type: "(" },
          { type: ")" },
          { type: ")" }
        ).map((token) => ({ ...token, hasSpaceBefore: true, hasSpaceAfter: true }))
      )
    )
  ).toBe(true);
  expect(isParsingError(parseMediaQuery(l`(100px < width > 100px)`))).toBe(true);
  expect(isParsingError(parseMediaQuery(l`(100px width)`))).toBe(true);
  expect(
    isParsingError(
      parseRange(
        t(
          { type: "(" },
          { type: "ident", value: "width" } as IdentToken,
          { type: "delim", value: 0x003c } as DelimToken,
          { type: "number", value: 100, flag: "number" } as NumberToken
        ).map((token) => ({ ...token, hasSpaceBefore: true, hasSpaceAfter: true }))
      )
    )
  ).toBe(true);
  expect(parseMediaQuery(l`(200px >= width >= 100px)`)).toEqual({
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
    },
    mediaType: "all",
  });
  expect(parseMediaQuery(l`(200px = width)`)).toEqual({
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
          },
        },
      ],
    },
    mediaType: "all",
  });
  expect(parseMediaQuery(l`(width >= 200px)`)).toEqual({
    mediaCondition: {
      children: [
        {
          context: "range",
          feature: "width",
          range: {
            featureName: "width",
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
    },
    mediaType: "all",
  });
  expect(isParsingError(parseMediaQuery(l`(1px @ width)`))).toBe(true);
  expect(isParsingError(parseMediaQuery(l`(# < width < 3)`))).toBe(true);
  expect(isParsingError(parseMediaQuery(l`(1px = width < 1)`))).toBe(true);
  expect(isParsingError(parseMediaQuery(l`(width = 1px)`))).toBe(false);
  expect(isParsingError(parseMediaQuery(l`(1px = width)`))).toBe(false);
  expect(isParsingError(parseMediaQuery(l`(1px < width = infinite)`))).toBe(true);
  expect(isParsingError(parseMediaQuery(l`(1px < width : infinite)`))).toBe(true);
  expect(isParsingError(parseMediaQuery(l`(1px < width : )`))).toBe(true);
  expect(isParsingError(parseMediaQuery(l`(1px < < 2px)`))).toBe(true);
  expect(isParsingError(parseRange(convertToParsingTokens(l`(width)`.slice(0, -1))))).toBe(true);
  expect(isParsingError(parseMediaQuery(l`(infinity < width < infinity)`))).toBe(true);
  expect(isParsingError(parseMediaQuery(l`(infinite < width < infinity)`))).toBe(true);
  expect(isParsingError(parseMediaQuery(l`(infinity < width < infinite)`))).toBe(true);
  expect(isParsingError(parseMediaQuery(l`(infinite < width < infinite)`))).toBe(false);
  expect(isParsingError(parseMediaQuery(l`(infinite < width < infinite any)`))).toBe(true);
});
