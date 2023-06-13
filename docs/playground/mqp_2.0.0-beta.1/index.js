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
import { deleteUndefinedValues, invertParserError } from "./internals.js";
import { lexer } from "./lexer/lexer.js";
import { isParserError } from "./utils.js";
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
 * //     {type: "query", mediaPrefix: "not"},
 * //     {type: "query", mediaCondition: ...}
 * //   ],
 * // }
 * ```
 */
export const parseMediaQueryList = (str) => {
  const tokens = lexer(str);
  return isParserError(tokens)
    ? invertParserError(tokens)
    : deleteUndefinedValues(flattenMediaQueryList(readMediaQueryList(tokens)));
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
 * // }
 * ```
 */
export const parseMediaQuery = (str) => {
  const tokens = lexer(str);
  if (isParserError(tokens)) {
    return invertParserError(tokens);
  } else {
    const mediaQuery = readMediaQuery(tokens);
    return isParserError(mediaQuery)
      ? invertParserError(mediaQuery)
      : deleteUndefinedValues(flattenMediaQuery(mediaQuery));
  }
};
/**
 * creates an AST from a **media-condition** string
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
export const parseMediaCondition = (str) => {
  const tokens = lexer(str);
  if (isParserError(tokens)) {
    return invertParserError(tokens);
  } else {
    const mediaCondition = readMediaCondition(tokens, true);
    return isParserError(mediaCondition)
      ? invertParserError(mediaCondition)
      : deleteUndefinedValues(flattenMediaCondition(mediaCondition));
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
export const parseMediaFeature = (str) => {
  const tokens = lexer(str);
  if (isParserError(tokens)) {
    return invertParserError(tokens);
  } else {
    const mediaFeature = readMediaFeature(tokens);
    return isParserError(mediaFeature) ? mediaFeature : deleteUndefinedValues(mediaFeature);
  }
};
/**
 * turns an AST into an equivalent string
 *
 * @example
 * ```ts
 * console.log(stringify({
 *   type: "query",
 *   mediaCondition: {
 *     type: "condition",
 *     children: [{ type: "feature", context: "boolean", feature: "monochrome" }],
 *   },
 * }));
 * // "(monochrome)"
 * ```
 *
 * note: stringifying a MediaCondition directly will always wrap the condition with parentheses.
 * sometimes they are redundant, but calling this with a MediaQuery will remove them for you.
 * e.g. `stringify({ type: 'query', mediaType: 'all', mediaCondition: <your condition> })`
 *
 * @example
 * ```ts
 * console.log(stringify(parseMediaFeature(`(min-width: 768px)`)));
 * // "(min-width: 768px)"
 * ```
 */
export const stringify = (node) => {
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
export * from "./utils.js";
