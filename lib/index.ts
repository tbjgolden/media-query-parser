import { matchCondition, matchFeature, matchQuery, matchQueryList } from "./ast/ast.js";
import {
  generateQueryList,
  generateQuery,
  generateCondition,
  generateFeature,
  generateValue,
} from "./generator/generator.js";
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
 *  - each invalid media query child is replaced with undefined
 * - can **return** a ParserError (e.g. when there is a CSS syntax error, like an invalid string)
 *
 * @example
 * ```ts
 * console.log(parseMediaQueryList(`print, #invalid, (min-width: 1000px)`));
 * // {
 * //   _t: "query-list",
 * //   nodes: [
 * //     { _t: "query", type: "print", start: 0, end: 4 },
 * //     undefined,
 * //     {
 * //       _t: "query",
 * //       condition: {
 * //         _t: "condition",
 * //         op: "and",
 * //         nodes: [
 * //           {
 * //             _t: "in-parens",
 * //             node: {
 * //               _t: "feature",
 * //               context: "value",
 * //               feature: "min-width",
 * //               value: { _t: "dimension", value: 1000, unit: "px", start: 29, end: 34 },
 * //               start: 18,
 * //               end: 34,
 * //             },
 * //           },
 * //         ],
 * //         start: 17,
 * //         end: 35,
 * //       },
 * //       start: 0,
 * //       end: 35,
 * //     },
 * //   ],
 * // }
 * ```
 */
export const parseMediaQueryList = (str: string): QueryListNode | ParserError => {
  const tokens = lexer(str);
  return isParserError(tokens) ? tokens : matchQueryList(tokens);
};

/**
 * creates an AST from a **media-query** string
 * @example
 * ```ts
 * console.log(parseMediaQuery(`screen and (monochrome)`));
 * // {
 * //   _t: "query",
 * //   condition: {
 * //     _t: "condition",
 * //     op: "and",
 * //     nodes: [
 * //       {
 * //         _t: "in-parens",
 * //         node: { _t: "feature", context: "boolean", feature: "monochrome", start: 12, end: 21 },
 * //       },
 * //     ],
 * //     start: 11,
 * //     end: 22,
 * //   },
 * //   type: "screen",
 * //   start: 0,
 * //   end: 22,
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
      ? query.t
      : {
          _errid: "INVALID_QUERY",
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
 * //   _t: "condition",
 * //   op: "and",
 * //   nodes: [
 * //     {
 * //       _t: "in-parens",
 * //       node: {
 * //         _t: "condition",
 * //         op: "or",
 * //         nodes: [
 * //           {
 * //             _t: "in-parens",
 * //             node: {
 * //               _t: "feature",
 * //               context: "range",
 * //               feature: "aspect-ratio",
 * //               ops: 1,
 * //               op: ">",
 * //               value: { _t: "ratio", left: 1, right: 2, start: 17, end: 19 },
 * //               start: 2,
 * //               end: 19,
 * //             },
 * //           },
 * //           {
 * //             _t: "in-parens",
 * //             node: { _t: "feature", context: "boolean", feature: "monochrome", start: 26, end: 35 },
 * //           },
 * //         ],
 * //         start: 1,
 * //         end: 36,
 * //       },
 * //     },
 * //   ],
 * //   start: 0,
 * //   end: 37,
 * // }
 * ```
 */
export const parseMediaCondition = (str: string): ConditionNode | ParserError => {
  const tokens = lexer(str);
  if (isParserError(tokens)) {
    return tokens;
  } else {
    const condition = matchCondition(tokens);
    return condition && condition.i === tokens.length
      ? condition.t
      : {
          _errid: "INVALID_CONDITION",
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
 * //   _t: "feature",
 * //   context: "value",
 * //   feature: "min-width",
 * //   value: { _t: "dimension", value: 768, unit: "px", start: 12, end: 16 },
 * //   start: 1,
 * //   end: 16,
 * // }
 * ```
 */
export const parseMediaFeature = (str: string): FeatureNode | ParserError => {
  const tokens = lexer(str);
  if (isParserError(tokens)) {
    return tokens;
  } else {
    const feature = matchFeature(tokens);
    return feature && feature.i === tokens.length
      ? feature.t
      : {
          _errid: "INVALID_FEATURE",
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
 * console.log(
 *   stringify({
 *     "_t": "query",
 *     "condition": {
 *       "_t": "condition",
 *       "op": "and",
 *       "nodes": [
 *         {
 *           "_t": "in-parens",
 *           "node": {
 *             "_t": "feature",
 *             "context": "boolean",
 *             "feature": "monochrome",
 *           }
 *         }
 *       ],
 *     },
 *     "type": "screen",
 *   })
 * );
 * // 'screen and (monochrome)'
 * ```
 */
export const stringify = (
  node: QueryListNode | QueryNode | ConditionNode | FeatureNode | ValueNode,
) => {
  switch (node._t) {
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
