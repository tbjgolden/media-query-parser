import { matchCondition, matchFeature, matchQuery, matchQueryList } from "./ast/ast.js";
import {
  generateQueryList,
  generateQuery,
  generateCondition,
  generateFeature,
  generateValue,
} from "./generator/generator.js";
import { deleteUndefinedValues, invertParserError } from "./internals.js";
import { lexer } from "./lexer/lexer.js";
import {
  ConditionNode,
  FeatureNode,
  ParserError,
  QueryListNode,
  QueryNode,
  ValueNode,
  isParserError,
} from "./utils.js";

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
 * //     {type: "query", prefix: "not"},
 * //     {type: "query", mediaCondition: ...}
 * //   ],
 * // }
 * ```
 */
export const parseMediaQueryList = (str: string): QueryListNode | ParserError => {
  const tokens = lexer(str);
  return isParserError(tokens)
    ? invertParserError(tokens)
    : deleteUndefinedValues(matchQueryList(tokens));
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
export const parseMediaQuery = (str: string): QueryNode | ParserError => {
  const tokens = lexer(str);
  if (isParserError(tokens)) {
    return tokens;
  } else {
    const query = matchQuery(tokens);
    return query && query.i === tokens.length
      ? deleteUndefinedValues(query.n)
      : {
          errid: "INVALID_QUERY",
          start: tokens.at(0)?.start ?? 0,
          end: tokens.at(-1)?.end ?? 0,
        };
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
export const parseMediaCondition = (str: string): ConditionNode | ParserError => {
  const tokens = lexer(str);
  if (isParserError(tokens)) {
    return tokens;
  } else {
    const condition = matchCondition(tokens);
    return condition && condition.i === tokens.length
      ? deleteUndefinedValues(condition.n)
      : {
          errid: "INVALID_CONDITION",
          start: tokens.at(0)?.start ?? 0,
          end: tokens.at(-1)?.end ?? 0,
        };
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
 * //   prefix: "min",
 * //   value: { type: "dimension", flag: "number", unit: "px", value: 768 },
 * // }
 *
 * ```
 */
export const parseMediaFeature = (str: string): FeatureNode | ParserError => {
  const tokens = lexer(str);
  if (isParserError(tokens)) {
    return tokens;
  } else {
    const feature = matchFeature(tokens);
    return feature && feature.i === tokens.length
      ? deleteUndefinedValues(feature.n)
      : {
          errid: "INVALID_FEATURE",
          start: tokens.at(0)?.start ?? 0,
          end: tokens.at(-1)?.end ?? 0,
        };
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
export const stringify = (
  node: QueryListNode | QueryNode | ConditionNode | FeatureNode | ValueNode
) => {
  switch (node.n) {
    case "query-list": {
      return generateQueryList(node);
    }
    case "query": {
      return generateQuery(node);
    }
    case "condition": {
      return generateCondition(node);
    }
    case "feature": {
      return generateFeature(node);
    }
    default: {
      return generateValue(node);
    }
  }
};

export * from "./utils.js";
