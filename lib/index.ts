import {
  readMediaQueryList,
  readMediaQuery,
  readMediaCondition,
  readMediaFeature,
} from "./ast/ast.js";
import {
  flattenMediaQueryList,
  flattenMediaQuery,
  flattenMediaCondition,
} from "./flatten/flatten.js";
import {
  generateMediaQueryList,
  generateMediaQuery,
  generateMediaCondition,
  generateMediaFeature,
  generateValidValueToken,
} from "./generator/generator.js";
import { lexer } from "./lexer/lexer.js";
import {
  MediaQueryList,
  ParserError,
  isParserError,
  MediaQuery,
  MediaCondition,
  MediaFeature,
  ValidValueToken,
} from "./shared.js";

/**
 * creates an AST from a **media-query-list** string; parses comma-separated media queries correctly
 *
 * Important:
 *
 * - _an invalid media-query child **does not** make the media-query-list invalid_
 * - can **return** a ParserError (e.g. when there is a CSS syntax error, like an invalid string)
 *
 * @example
 * ```ts
 * console.log(parseMediaQueryList(`print, invalid, (min-width: 1000px)`));
 * // {
 * //   type: "query-list",
 * //   mediaQueries: [
 * //     {type: "query", mediaType: "print"},
 * //     {type: "query", mediaPrefix: "not", mediaType: "all"},
 * //     {type: "query", mediaType: "all", mediaCondition: ...}
 * //   ],
 * // }
 * ```
 */
export const parseMediaQueryList = (str: string): MediaQueryList | ParserError => {
  const tokens = lexer(str);
  return isParserError(tokens) ? tokens : flattenMediaQueryList(readMediaQueryList(tokens));
};

/**
 * creates an AST from a **media-query** string
 * @example
 * ```ts
 * console.log(parseMediaQuery(`(monochrome)`));
 * // {
 * //   type: "query",
 * //   mediaCondition: {
 * //     type: "condition",
 * //     children: [{ type: "feature", context: "boolean", feature: "monochrome" }],
 * //   },
 * //   mediaType: "all",
 * // }
 * ```
 */
export const parseMediaQuery = (str: string): MediaQuery | ParserError => {
  const tokens = lexer(str);
  if (isParserError(tokens)) {
    return tokens;
  } else {
    const mediaQuery = readMediaQuery(tokens);
    return isParserError(mediaQuery) ? mediaQuery : flattenMediaQuery(mediaQuery);
  }
};

/**
 * creates an AST from a **media-condition** string - including parentheses
 *
 * @example
 * ```ts
 * console.log(parseMediaCondition(`((aspect-ratio > 1/2) or (monochrome))`));
 * // {
 * //   type: "condition",
 * //   children: [{
 * //     type: "condition",
 * //     children: [
 * //       {
 * //         type: "feature",
 * //         context: "range",
 * //         feature: "aspect-ratio",
 * //         range: {
 * //           featureName: "aspect-ratio",
 * //           rightOp: ">",
 * //           rightToken: { denominator: 2, numerator: 1, type: "ratio" },
 * //         },
 * //       },
 * //       { context: "boolean", feature: "monochrome", type: "feature" },
 * //     ],
 * //     operator: "or",
 * //   }],
 * // }
 *
 * ```
 */
export const parseMediaCondition = (str: string): MediaCondition | ParserError => {
  const tokens = lexer(str);
  if (isParserError(tokens)) {
    return tokens;
  } else {
    const mediaCondition = readMediaCondition(tokens, true);
    return isParserError(mediaCondition) ? mediaCondition : flattenMediaCondition(mediaCondition);
  }
};

/**
 * creates an AST from a **media-feature** string - including parentheses
 *
 * @example
 * ```ts
 * console.log(parseMediaFeature(`(min-width: 768px)`));
 * // {
 * //   type: "feature",
 * //   context: "value",
 * //   feature: "width",
 * //   mediaPrefix: "min",
 * //   value: { type: "dimension", flag: "number", unit: "px", value: 768 },
 * // }
 *
 * ```
 */
export const parseMediaFeature = (str: string): MediaFeature | ParserError => {
  const tokens = lexer(str);
  return isParserError(tokens) ? tokens : readMediaFeature(tokens);
};

/**
 * turns an AST into an equivalent string
 *
 * @example
 * ```ts
 * console.log(stringify(parseMediaFeature(`(min-width: 768px)`)));
 * // "(min-width: 768px)"
 * ```
 *
 * @example
 * ```ts
 * console.log(stringify({
 *   type: "query",
 *   mediaType: "all",
 *   mediaCondition: {
 *     type: "condition",
 *     children: [{ type: "feature", context: "boolean", feature: "monochrome" }],
 *   },
 * }));
 * // "(monochrome)"
 * ```
 */
export const stringify = (
  node: MediaQueryList | MediaQuery | MediaCondition | MediaFeature | ValidValueToken
) => {
  switch (node.type) {
    case "query-list": {
      return generateMediaQueryList(node);
    }
    case "query": {
      return generateMediaQuery(node);
    }
    case "condition": {
      return generateMediaCondition(node);
    }
    case "feature": {
      return generateMediaFeature(node);
    }
    default: {
      return generateValidValueToken(node);
    }
  }
};

export * from "./shared.js";
