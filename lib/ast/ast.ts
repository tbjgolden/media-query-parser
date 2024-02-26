import {
  BooleanFeatureNode,
  ConditionNode,
  ConditionWithoutOrNode,
  FeatureNode,
  GeneralEnclosedNode,
  InParensNode,
  NumericValueNode,
  ParserToken,
  PlainFeatureNode,
  QueryListNode,
  QueryNode,
  Range1Node,
  RangeFeatureNode,
  RatioNode,
  ValueNode,
} from "../utils.js";

export type Match<T> = { t: T; i: number } | undefined;

const LT = "<".codePointAt(0);
const GT = ">".codePointAt(0);
const EQ = "=".codePointAt(0);
const SLASH = "/".codePointAt(0);

type Eq = { t: "eq" };
const matchEq = (ts: ParserToken[], i = 0): Match<Eq> => {
  const a = ts.at(i);
  if (a?._t === "delim" && a.value === EQ) {
    return { t: { t: "eq" }, i: i + 1 };
  }
};

type Lt = { t: "lt"; isIncl: boolean };
const matchLt = (ts: ParserToken[], i = 0): Match<Lt> => {
  const a = ts.at(i);
  if (a?._t === "delim" && a.value === LT) {
    const b = ts.at(i + 1);
    const isIncl = b?._t === "delim" && b.value === EQ && !b.isAfterSpace;
    return { t: { t: "lt", isIncl }, i: i + (isIncl ? 2 : 1) };
  }
};

type Gt = { t: "gt"; isIncl: boolean };
const matchGt = (ts: ParserToken[], i = 0): Match<Gt> => {
  const a = ts.at(i);
  if (a?._t === "delim" && a.value === GT) {
    const b = ts.at(i + 1);
    const isIncl = b?._t === "delim" && b.value === EQ && !b.isAfterSpace;
    return { t: { t: "gt", isIncl }, i: i + (isIncl ? 2 : 1) };
  }
};

const matchComparison = (ts: ParserToken[], i = 0): Match<Lt | Gt | Eq> =>
  matchLt(ts, i) ?? matchGt(ts, i) ?? matchEq(ts, i);

const matchRatio = (ts: ParserToken[], i = 0): Match<RatioNode> => {
  const a = ts.at(i);
  if (a?._t === "number" && a.value >= 0) {
    const b = ts.at(i + 1);
    if (b?._t === "delim" && b.value === SLASH) {
      const c = ts.at(i + 2);
      if (c?._t === "number" && c.value >= 0) {
        return {
          t: { _t: "ratio", left: a.value, right: c.value },
          i: i + 3,
        };
      }
    }
  }
};

const matchNumericValue = (ts: ParserToken[], i = 0): Match<NumericValueNode> => {
  const a = matchRatio(ts, i);
  if (a) return a;

  const b = ts.at(i);
  if (b && (b._t === "number" || b._t === "dimension")) {
    const n: NumericValueNode =
      b._t === "number"
        ? { _t: "number", value: b.value, flag: b.flag }
        : { _t: "dimension", value: b.value, unit: b.unit };

    return { t: n, i: i + 1 };
  }
};

const matchValue = (ts: ParserToken[], i = 0): Match<ValueNode> => {
  const a = matchNumericValue(ts, i);
  if (a) return a;

  const b = ts.at(i);
  if (b?._t === "ident") {
    return { t: { _t: "ident", value: b.value }, i: i + 1 };
  }
};

const matchRange = (ts: ParserToken[], i = 0): Match<RangeFeatureNode> => {
  const a = matchValue(ts, i);
  if (a) {
    const b = matchComparison(ts, a.i);
    if (b) {
      const c = matchValue(ts, b.i);
      if (c) {
        const d = matchLt(ts, c.i) ?? matchGt(ts, c.i);
        if (d) {
          const e = matchValue(ts, d.i);
          if (e && c.t._t === "ident" && a.t._t !== "ident" && e.t._t !== "ident") {
            if (b.t.t === "lt" && d.t.t === "lt") {
              return {
                t: {
                  _t: "feature",
                  context: "range",
                  feature: c.t.value,
                  value: {
                    a: a.t,
                    op: b.t.isIncl ? "<=" : "<",
                    b: c.t,
                    op2: d.t.isIncl ? "<=" : "<",
                    c: e.t,
                  },
                },
                i: e.i,
              };
            }
            if (b.t.t === "gt" && d.t.t === "gt") {
              return {
                t: {
                  _t: "feature",
                  context: "range",
                  feature: c.t.value,
                  value: {
                    a: a.t,
                    op: b.t.isIncl ? ">=" : ">",
                    b: c.t,
                    op2: d.t.isIncl ? ">=" : ">",
                    c: e.t,
                  },
                },
                i: e.i,
              };
            }
          }
        }

        let op: Range1Node["op"] = "=";
        if (b.t.t === "lt") {
          op = b.t.isIncl ? "<=" : "<";
        } else if (b.t.t === "gt") {
          op = b.t.isIncl ? ">=" : ">";
        }

        if (a.t._t === "ident" && c.t._t !== "ident") {
          return {
            t: {
              _t: "feature",
              context: "range",
              feature: a.t.value,
              value: { a: a.t, op, b: c.t },
            },
            i: c.i,
          };
        }
        if (c.t._t === "ident" && a.t._t !== "ident") {
          return {
            t: {
              _t: "feature",
              context: "range",
              feature: c.t.value,
              value: { a: a.t, op, b: c.t },
            },
            i: c.i,
          };
        }
      }
    }
  }
};

export const matchPlain = (ts: ParserToken[], i = 0): Match<PlainFeatureNode> => {
  const a = ts.at(i);
  if (a?._t === "ident") {
    const b = ts.at(i + 1);
    if (b?._t === "colon") {
      const c = matchValue(ts, i + 2);
      if (c) {
        return { t: { _t: "feature", context: "value", feature: a.value, value: c.t }, i: c.i };
      }
    }
  }
};

export const matchBoolean = (ts: ParserToken[], i = 0): Match<BooleanFeatureNode> => {
  const a = ts.at(i);
  if (a?._t === "ident") {
    return { t: { _t: "feature", context: "boolean", feature: a.value }, i: i + 1 };
  }
};

export const matchFeature = (ts: ParserToken[], i = 0): Match<FeatureNode> => {
  const a = ts.at(i);
  if (a?._t === "(") {
    const b = matchPlain(ts, i + 1) ?? matchRange(ts, i + 1) ?? matchBoolean(ts, i + 1);
    if (b) {
      const c = ts.at(b.i);
      if (c?._t === ")") {
        return { t: b.t, i: b.i + 1 };
      }
    }
  }
};
export const matchGeneralEnclosed = (ts: ParserToken[], i = 0): Match<GeneralEnclosedNode> => {
  const a = ts.at(i);
  if (a && (a._t === "function" || a._t === "(")) {
    const stack: Array<"(" | "[" | "{"> = ["("];
    let j = i + 1;
    let b = ts.at(j);
    cycle: while (b) {
      switch (b._t) {
        case "function":
        case "(": {
          stack.push("(");
          break;
        }
        case "{":
        case "[": {
          stack.push(b._t);
          break;
        }
        case ")": {
          if (stack.at(-1) === "(") {
            stack.pop();
          }
          if (stack.length === 0) {
            break cycle;
          }
          break;
        }
        case "]": {
          if (stack.at(-1) === "[") {
            stack.pop();
          }
          break;
        }
        case "}": {
          if (stack.at(-1) === "{") {
            stack.pop();
          }
          break;
        }
      }
      b = ts.at(++j);
    }
    if (stack.length === 0) {
      return { t: { _t: "general-enclosed" }, i: j };
    }
  }
};

export const matchInParens = (ts: ParserToken[], i = 0): Match<InParensNode> => {
  const a = matchFeature(ts, i);
  if (a) {
    return { t: { _t: "in-parens", node: a.t }, i: a.i };
  }

  const b = ts.at(i);
  if (b?._t === "(") {
    const c = matchCondition(ts, i + 1);
    if (c) {
      const d = ts.at(c.i);
      if (d?._t === ")") {
        return { t: { _t: "in-parens", node: c.t }, i: c.i + 1 };
      }
    }
  }

  const e = matchGeneralEnclosed(ts, i);
  if (e) {
    return { t: { _t: "in-parens", node: e.t }, i: e.i };
  }
};

export const matchOr = (ts: ParserToken[], i = 0): Match<InParensNode> => {
  const a = ts.at(i);
  if (a?._t === "ident" && a.value === "or") {
    const b = matchInParens(ts, i + 1);
    if (b) {
      return { t: b.t, i: b.i };
    }
  }
};
export const matchAnd = (ts: ParserToken[], i = 0): Match<InParensNode> => {
  const a = ts.at(i);
  if (a?._t === "ident" && a.value === "and") {
    const b = matchInParens(ts, i + 1);
    if (b) {
      return { t: b.t, i: b.i };
    }
  }
};
export const matchNot = (ts: ParserToken[], i = 0): Match<InParensNode> => {
  const a = ts.at(i);
  if (a?._t === "ident" && a.value === "not") {
    const b = matchInParens(ts, i + 1);
    if (b) {
      return { t: b.t, i: b.i };
    }
  }
};

export const matchCondition = (ts: ParserToken[], i = 0): Match<ConditionNode> => {
  const a = matchNot(ts, i);
  if (a) {
    return { t: { _t: "condition", op: "not", a: a.t }, i: a.i };
  } else {
    const b = matchInParens(ts, i);
    if (b) {
      const c = matchAnd(ts, b.i);
      if (c) {
        const expressions: InParensNode[] = [c.t];
        let lastI = c.i;
        let next = matchAnd(ts, c.i);
        while (next) {
          expressions.push(next.t);
          lastI = next.i;
          next = matchAnd(ts, next.i);
        }
        return { t: { _t: "condition", op: "and", a: b.t, bs: expressions }, i: lastI };
      }
      const d = matchOr(ts, b.i);
      if (d) {
        const expressions: InParensNode[] = [d.t];
        let lastI = d.i;
        let next = matchOr(ts, d.i);
        while (next) {
          expressions.push(next.t);
          lastI = next.i;
          next = matchOr(ts, next.i);
        }
        return { t: { _t: "condition", op: "or", a: b.t, bs: expressions }, i: lastI };
      }
      return { t: { _t: "condition", op: "and", a: b.t }, i: b.i };
    }
  }
};

export const matchConditionWithoutOr = (
  ts: ParserToken[],
  i = 0
): Match<ConditionWithoutOrNode> => {
  const a = matchNot(ts, i);
  if (a) {
    return { t: { _t: "condition", op: "not", a: a.t }, i: a.i };
  } else {
    const b = matchInParens(ts, i);
    if (b) {
      const c = matchAnd(ts, b.i);
      if (c) {
        const expressions: InParensNode[] = [c.t];
        let lastI = c.i;
        let next = matchAnd(ts, c.i);
        while (next) {
          expressions.push(next.t);
          lastI = next.i;
          next = matchAnd(ts, next.i);
        }
        return { t: { _t: "condition", op: "and", a: b.t, bs: expressions }, i: lastI };
      }
      return { t: { _t: "condition", op: "and", a: b.t }, i: b.i };
    }
  }
};

export const matchQuery = (ts: ParserToken[]): Match<QueryNode> => {
  const a = matchCondition(ts, 0);
  if (a) {
    return { t: { _t: "query", condition: a.t }, i: a.i };
  } else {
    const b = ts.at(0);
    if (b?._t === "ident") {
      if (b.value === "not" || b.value === "only") {
        const c = ts.at(1);
        if (c?._t === "ident") {
          const d = ts.at(2);
          if (d?._t === "ident" && d.value === "and") {
            const e = matchConditionWithoutOr(ts, 3);
            if (e) {
              return {
                t: { _t: "query", condition: e.t, type: c.value, prefix: b.value },
                i: e.i,
              };
            }
          }
          return { t: { _t: "query", type: c.value, prefix: b.value }, i: 2 };
        }
      }

      const f = ts.at(1);
      if (f?._t === "ident" && f.value === "and") {
        const g = matchConditionWithoutOr(ts, 2);
        if (g) {
          return { t: { _t: "query", condition: g.t, type: b.value }, i: g.i };
        }
      }
      return { t: { _t: "query", type: b.value }, i: 1 };
    }
  }
};

export const matchQueryList = (parsingTokens: ParserToken[]): QueryListNode => {
  const mediaQueriesParserTokens = splitMediaQueryList(parsingTokens);

  if (mediaQueriesParserTokens.length === 1 && mediaQueriesParserTokens[0].length === 0) {
    // '@media {' is fine, treat as all
    return { _t: "query-list", nodes: [{ _t: "query", type: "all" }] };
  } else {
    const qs: Array<QueryNode | undefined> = [];
    for (const mediaQueryParserTokens of mediaQueriesParserTokens) {
      const a = matchQuery(mediaQueryParserTokens);
      if (a && a.i === mediaQueryParserTokens.length) {
        qs.push(a.t);
      } else {
        qs.push(undefined);
      }
    }

    return { _t: "query-list", nodes: qs };
  }
};

export const splitMediaQueryList = (tokens: ParserToken[]): Array<ParserToken[]> => {
  const mediaQueriesParserTokens: ParserToken[][] = [[]];
  const stack: Array<")" | "]" | "}"> = [];
  for (const token of tokens) {
    if (token._t === "comma" && stack.length === 0) {
      mediaQueriesParserTokens.push([]);
    } else {
      switch (token._t) {
        case "function":
        case "(": {
          stack.push(")");
          break;
        }
        case "[": {
          stack.push("]");
          break;
        }
        case "{": {
          stack.push("}");
          break;
        }
        case ")":
        case "]":
        case "}": {
          const topOfStack = stack.at(-1);
          if (topOfStack === token._t) {
            stack.pop();
          }
          break;
        }
      }
      mediaQueriesParserTokens[mediaQueriesParserTokens.length - 1].push(token);
    }
  }
  return mediaQueriesParserTokens;
};
