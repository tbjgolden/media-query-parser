import {
  QueryListNode,
  QueryNode,
  ConditionNode,
  FeatureNode,
  BooleanFeatureNode,
  PlainFeatureNode,
  RangeFeatureNode,
  ValueNode,
  RatioNode,
  IdentNode,
  NumberNode,
  ConditionWithoutOrNode,
  InParensNode,
  DimensionNode,
} from "../utils.js";

export const generateQueryList = (queryList: QueryListNode): string =>
  queryList.qs.map((q) => (q ? generateQuery(q) : "not all")).join(", ");
export const generateQuery = (mediaQuery: QueryNode): string => {
  let str = "";
  if (mediaQuery.prefix) {
    str += mediaQuery.prefix + " ";
  }
  const doesNeedAll = mediaQuery.prefix !== undefined || !mediaQuery.condition;
  if (doesNeedAll || mediaQuery.type !== undefined) {
    str += mediaQuery.type ?? "all";
    if (mediaQuery.condition) {
      str += " and";
    }
  }
  if (mediaQuery.condition) {
    if (str !== "") {
      str += " ";
    }

    str += generateCondition(mediaQuery.condition);
  }
  return str;
};

export const generateInParens = (inParens: InParensNode): string => {
  if (inParens.v.n === "condition") {
    return "(" + generateCondition(inParens.v) + ")";
  } else if (inParens.v.n === "feature") {
    return generateFeature(inParens.v);
  } else {
    return "(general enclosed)";
  }
};

export const generateCondition = (condition: ConditionNode | ConditionWithoutOrNode): string => {
  return condition.op === "not"
    ? "not " + generateInParens(condition.a)
    : generateInParens(condition.a) +
        (condition.bs ?? []).map((b) => ` ${condition.op} ${generateInParens(b)}`).join("");
};
export const generateFeature = (feature: FeatureNode): string => {
  let str = "(";
  if (feature.t === "boolean") {
    str += generateFeatureBoolean(feature);
  } else if (feature.t === "value") {
    str += generateFeatureValue(feature);
  } else {
    str += generateFeatureRange(feature);
  }
  str += ")";
  return str;
};
export const generateFeatureBoolean = (feature: BooleanFeatureNode): string => {
  return feature.f;
};
export const generateFeatureValue = (feature: PlainFeatureNode): string => {
  return feature.f + ": " + generateValue(feature.v);
};
export const generateFeatureRange = (feature: RangeFeatureNode): string => {
  let str = `${generateValue(feature.r.a)} ${feature.r.op} ${generateValue(feature.r.b)}`;
  if ("op2" in feature.r) str += ` ${feature.r.op2} ${generateValue(feature.r.c)}`;
  return str;
};
export const generateValue = (value: ValueNode): string => {
  if (value.n === "dimension") {
    return generateDimension(value);
  } else if (value.n === "ident") {
    return generateIdent(value);
  } else if (value.n === "ratio") {
    return generateRatio(value);
  } else {
    return generateNumber(value);
  }
};
export const generateRatio = (ratio: RatioNode): string => `${ratio.l}/${ratio.r}`;
export const generateNumber = (number: NumberNode): string => `${number.v}`;
export const generateDimension = (dimension: DimensionNode): string =>
  `${dimension.v}${dimension.u}`;
export const generateIdent = (ident: IdentNode): string => ident.v;
