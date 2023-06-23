import {
  BooleanFeatureNode,
  ConditionNode,
  ConditionWithoutOrNode,
  FeatureNode,
  GeneralEnclosedNode,
  InParensNode,
  Match,
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

const LT = "<".codePointAt(0);
const GT = ">".codePointAt(0);
const EQ = "=".codePointAt(0);
const SLASH = "/".codePointAt(0);

type Eq = { t: "eq" };
const matchEq = (ts: ParserToken[], i = 0): Match<Eq> => {
  const a = ts.at(i);
  if (a?.type === "delim" && a.value === EQ) {
    return { n: { t: "eq" }, i: i + 1 };
  }
};

type Lt = { t: "lt"; isIncl: boolean };
const matchLt = (ts: ParserToken[], i = 0): Match<Lt> => {
  const a = ts.at(i);
  if (a?.type === "delim" && a.value === LT) {
    const b = ts.at(i + 1);
    const isIncl = b?.type === "delim" && b.value === EQ && !b.isAfterSpace;
    return { n: { t: "lt", isIncl }, i: i + (isIncl ? 2 : 1) };
  }
};

type Gt = { t: "gt"; isIncl: boolean };
const matchGt = (ts: ParserToken[], i = 0): Match<Gt> => {
  const a = ts.at(i);
  if (a?.type === "delim" && a.value === GT) {
    const b = ts.at(i + 1);
    const isIncl = b?.type === "delim" && b.value === EQ && !b.isAfterSpace;
    return { n: { t: "gt", isIncl }, i: i + (isIncl ? 2 : 1) };
  }
};

const matchComparison = (ts: ParserToken[], i = 0): Match<Lt | Gt | Eq> =>
  matchLt(ts, i) ?? matchGt(ts, i) ?? matchEq(ts, i);

const matchRatio = (ts: ParserToken[], i = 0): Match<RatioNode> => {
  const a = ts.at(i);
  if (a?.type === "number" && a.value >= 0) {
    const b = ts.at(i + 1);
    if (b?.type === "delim" && b.value === SLASH) {
      const c = ts.at(i + 2);
      if (c?.type === "number" && c.value >= 0) {
        return {
          n: { n: "ratio", l: a.value, r: c.value },
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
  if (b && (b.type === "number" || b.type === "dimension")) {
    const n: NumericValueNode =
      b.type === "number"
        ? { n: "number", v: b.value, isInt: b.flag === "integer" }
        : { n: "dimension", v: b.value, u: b.unit };

    return { n, i: i + 1 };
  }
};

const matchValue = (ts: ParserToken[], i = 0): Match<ValueNode> => {
  const a = matchNumericValue(ts, i);
  if (a) return a;

  const b = ts.at(i);
  if (b?.type === "ident") {
    return { n: { n: "ident", v: b.value }, i: i + 1 };
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
          if (e && c.n.n === "ident" && a.n.n !== "ident" && e.n.n !== "ident") {
            if (b.n.t === "lt" && d.n.t === "lt") {
              return {
                n: {
                  n: "feature",
                  t: "range",
                  f: c.n.v,
                  r: {
                    a: a.n,
                    op: b.n.isIncl ? "<=" : "<",
                    b: c.n,
                    op2: d.n.isIncl ? "<=" : "<",
                    c: e.n,
                  },
                },
                i: e.i,
              };
            }
            if (b.n.t === "gt" && d.n.t === "gt") {
              return {
                n: {
                  n: "feature",
                  t: "range",
                  f: c.n.v,
                  r: {
                    a: a.n,
                    op: b.n.isIncl ? ">=" : ">",
                    b: c.n,
                    op2: d.n.isIncl ? ">=" : ">",
                    c: e.n,
                  },
                },
                i: e.i,
              };
            }
          }
        }

        let op: Range1Node["op"] = "=";
        if (b.n.t === "lt") {
          op = b.n.isIncl ? "<=" : "<";
        } else if (b.n.t === "gt") {
          op = b.n.isIncl ? ">=" : ">";
        }

        if (a.n.n === "ident" && c.n.n !== "ident") {
          return {
            n: { n: "feature", t: "range", f: a.n.v, r: { a: a.n, op, b: c.n } },
            i: c.i,
          };
        }
        if (c.n.n === "ident" && a.n.n !== "ident") {
          return {
            n: { n: "feature", t: "range", f: c.n.v, r: { a: a.n, op, b: c.n } },
            i: c.i,
          };
        }
      }
    }
  }
};

export const matchPlain = (ts: ParserToken[], i = 0): Match<PlainFeatureNode> => {
  const a = ts.at(i);
  if (a?.type === "ident") {
    const b = ts.at(i + 1);
    if (b?.type === "colon") {
      const c = matchValue(ts, i + 2);
      if (c) {
        return { n: { n: "feature", t: "value", f: a.value, v: c.n }, i: c.i };
      }
    }
  }
};

export const matchBoolean = (ts: ParserToken[], i = 0): Match<BooleanFeatureNode> => {
  const a = ts.at(i);
  if (a?.type === "ident") {
    return { n: { n: "feature", t: "boolean", f: a.value }, i: i + 1 };
  }
};

export const matchFeature = (ts: ParserToken[], i = 0): Match<FeatureNode> => {
  const a = ts.at(i);
  if (a?.type === "(") {
    const b = matchPlain(ts, i + 1) ?? matchRange(ts, i + 1) ?? matchBoolean(ts, i + 1);
    if (b) {
      const c = ts.at(b.i);
      if (c?.type === ")") {
        return { n: b.n, i: b.i + 1 };
      }
    }
  }
};
export const matchGeneralEnclosed = (ts: ParserToken[], i = 0): Match<GeneralEnclosedNode> => {
  const a = ts.at(i);
  if (a && (a.type === "function" || a.type === "(")) {
    const stack: Array<"(" | "[" | "{"> = ["("];
    let j = i + 1;
    let b = ts.at(j);
    cycle: while (b) {
      switch (b.type) {
        case "function":
        case "(": {
          stack.push("(");
          break;
        }
        case "{":
        case "[": {
          stack.push(b.type);
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
      return { n: { n: "general-enclosed" }, i: j };
    }
  }
};

export const matchInParens = (ts: ParserToken[], i = 0): Match<InParensNode> => {
  const a = matchFeature(ts, i);
  if (a) {
    return { n: { n: "in-parens", v: a.n }, i: a.i };
  }

  const b = ts.at(i);
  if (b?.type === "(") {
    const c = matchCondition(ts, i + 1);
    if (c) {
      const d = ts.at(c.i);
      if (d?.type === ")") {
        return { n: { n: "in-parens", v: c.n }, i: c.i + 1 };
      }
    }
  }

  const e = matchGeneralEnclosed(ts, i);
  if (e) {
    return { n: { n: "in-parens", v: e.n }, i: e.i };
  }
};

export const matchOr = (ts: ParserToken[], i = 0): Match<InParensNode> => {
  const a = ts.at(i);
  if (a?.type === "ident" && a.value === "or") {
    const b = matchInParens(ts, i + 1);
    if (b) {
      return { n: b.n, i: b.i };
    }
  }
};
export const matchAnd = (ts: ParserToken[], i = 0): Match<InParensNode> => {
  const a = ts.at(i);
  if (a?.type === "ident" && a.value === "and") {
    const b = matchInParens(ts, i + 1);
    if (b) {
      return { n: b.n, i: b.i };
    }
  }
};
export const matchNot = (ts: ParserToken[], i = 0): Match<InParensNode> => {
  const a = ts.at(i);
  if (a?.type === "ident" && a.value === "not") {
    const b = matchInParens(ts, i + 1);
    if (b) {
      return { n: b.n, i: b.i };
    }
  }
};

export const matchCondition = (ts: ParserToken[], i = 0): Match<ConditionNode> => {
  const a = matchNot(ts, i);
  if (a) {
    return { n: { n: "condition", op: "not", a: a.n }, i: a.i };
  } else {
    const b = matchInParens(ts, i);
    if (b) {
      const c = matchAnd(ts, b.i);
      if (c) {
        const expressions: InParensNode[] = [c.n];
        let lastI = c.i;
        let next = matchAnd(ts, c.i);
        while (next) {
          expressions.push(next.n);
          lastI = next.i;
          next = matchAnd(ts, next.i);
        }
        return { n: { n: "condition", op: "and", a: b.n, bs: expressions }, i: lastI };
      }
      const d = matchOr(ts, b.i);
      if (d) {
        const expressions: InParensNode[] = [d.n];
        let lastI = d.i;
        let next = matchOr(ts, d.i);
        while (next) {
          expressions.push(next.n);
          lastI = next.i;
          next = matchOr(ts, next.i);
        }
        return { n: { n: "condition", op: "or", a: b.n, bs: expressions }, i: lastI };
      }
      return { n: { n: "condition", op: "and", a: b.n }, i: b.i };
    }
  }
};

export const matchConditionWithoutOr = (
  ts: ParserToken[],
  i = 0
): Match<ConditionWithoutOrNode> => {
  const a = matchNot(ts, i);
  if (a) {
    return { n: { n: "condition", op: "not", a: a.n }, i: a.i };
  } else {
    const b = matchInParens(ts, i);
    if (b) {
      const c = matchAnd(ts, b.i);
      if (c) {
        const expressions: InParensNode[] = [c.n];
        let lastI = c.i;
        let next = matchAnd(ts, c.i);
        while (next) {
          expressions.push(next.n);
          lastI = next.i;
          next = matchAnd(ts, next.i);
        }
        return { n: { n: "condition", op: "and", a: b.n, bs: expressions }, i: lastI };
      }
      return { n: { n: "condition", op: "and", a: b.n }, i: b.i };
    }
  }
};

export const matchQuery = (ts: ParserToken[]): Match<QueryNode> => {
  const a = matchCondition(ts, 0);
  if (a) {
    return { n: { n: "query", condition: a.n }, i: a.i };
  } else {
    const b = ts.at(0);
    if (b?.type === "ident") {
      if (b.value === "not" || b.value === "only") {
        const c = ts.at(1);
        if (c?.type === "ident") {
          const d = ts.at(2);
          if (d?.type === "ident" && d.value === "and") {
            const e = matchConditionWithoutOr(ts, 3);
            if (e) {
              return {
                n: { n: "query", condition: e.n, type: c.value, prefix: b.value },
                i: e.i,
              };
            }
          }
          return { n: { n: "query", type: c.value, prefix: b.value }, i: 2 };
        }
      }

      const f = ts.at(1);
      if (f?.type === "ident" && f.value === "and") {
        const g = matchConditionWithoutOr(ts, 2);
        if (g) {
          return { n: { n: "query", condition: g.n, type: b.value }, i: g.i };
        }
      }
      return { n: { n: "query", type: b.value }, i: 1 };
    }
  }
};

export const matchQueryList = (parsingTokens: ParserToken[]): QueryListNode => {
  const mediaQueriesParserTokens = splitMediaQueryList(parsingTokens);

  if (mediaQueriesParserTokens.length === 1 && mediaQueriesParserTokens[0].length === 0) {
    // '@media {' is fine, treat as all
    return { n: "query-list", qs: [{ n: "query", type: "all" }] };
  } else {
    const qs: QueryNode[] = [];
    for (const mediaQueryParserTokens of mediaQueriesParserTokens) {
      const a = matchQuery(mediaQueryParserTokens);
      if (a && a.i === mediaQueryParserTokens.length) {
        qs.push(a.n);
      } else {
        qs.push({ n: "query", prefix: "not", type: "all" });
      }
    }

    return { n: "query-list", qs };
  }
};

export const splitMediaQueryList = (tokens: ParserToken[]): Array<ParserToken[]> => {
  const mediaQueriesParserTokens: ParserToken[][] = [[]];
  const stack: Array<")" | "]" | "}"> = [];
  for (const token of tokens) {
    if (token.type === "comma" && stack.length === 0) {
      mediaQueriesParserTokens.push([]);
    } else {
      switch (token.type) {
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
          if (topOfStack === token.type) {
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
