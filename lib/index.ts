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
 * //   n: 'query-list',
 * //   qs: [
 * //     { n: 'query', type: 'print' },
 * //     undefined,
 * //     {
 * //       n: 'query',
 * //       condition: {
 * //         n: 'condition',
 * //         op: 'and',
 * //         a: {
 * //           n: 'in-parens',
 * //           v: {
 * //             n: 'feature',
 * //             t: 'value',
 * //             f: 'min-width',
 * //             v: { n: 'dimension', v: 1000, u: 'px' }
 * //           }
 * //         }
 * //       }
 * //     }
 * //   ]
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
 * //   n: 'query',
 * //   type: 'screen',
 * //   condition: {
 * //     n: 'condition',
 * //     op: 'and',
 * //     a: {
 * //       n: 'in-parens',
 * //       v: { n: 'feature', t: 'boolean', f: 'monochrome' }
 * //     }
 * //   }
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
 * //   n: 'condition',
 * //   op: 'and',
 * //   a: {
 * //     n: 'in-parens',
 * //     v: {
 * //       n: 'condition',
 * //       op: 'or',
 * //       a: {
 * //         n: 'in-parens',
 * //         v: {
 * //           n: 'feature',
 * //           t: 'range',
 * //           f: 'aspect-ratio',
 * //           r: {
 * //             a: { n: 'ident', v: 'aspect-ratio' },
 * //             op: '>',
 * //             b: { n: 'ratio', l: 1, r: 2 }
 * //           }
 * //         }
 * //       },
 * //       bs: [
 * //         {
 * //           n: 'in-parens',
 * //           v: { n: 'feature', t: 'boolean', f: 'monochrome' }
 * //         }
 * //       ]
 * //     }
 * //   }
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
 * //   n: 'feature',
 * //   t: 'value',
 * //   f: 'min-width',
 * //   v: { n: 'dimension', v: 768, u: 'px' }
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
 *   n: 'query',
 *   type: 'screen',
 *   condition: {
 *     n: 'condition',
 *     op: 'and',
 *     a: {
 *       n: 'in-parens',
 *       v: { n: 'feature', t: 'boolean', f: 'monochrome' }
 *     }
 *   }
 * }));
 * // 'screen and (monochrome)'
 * ```
 */
export const stringify = (
  node: QueryListNode | QueryNode | ConditionNode | FeatureNode | ValueNode
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
