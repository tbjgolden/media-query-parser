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
  queryList.nodes.map((q) => (q ? generateQuery(q) : "not all")).join(", ");
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
  if (inParens.node._t === "condition") {
    return "(" + generateCondition(inParens.node) + ")";
  } else if (inParens.node._t === "feature") {
    return generateFeature(inParens.node);
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
  if (feature.context === "boolean") {
    str += generateFeatureBoolean(feature);
  } else if (feature.context === "value") {
    str += generateFeatureValue(feature);
  } else {
    str += generateFeatureRange(feature);
  }
  str += ")";
  return str;
};
export const generateFeatureBoolean = (feature: BooleanFeatureNode): string => {
  return feature.feature;
};
export const generateFeatureValue = (feature: PlainFeatureNode): string => {
  return feature.feature + ": " + generateValue(feature.value);
};
export const generateFeatureRange = (feature: RangeFeatureNode): string => {
  let str = `${generateValue(feature.value.a)} ${feature.value.op} ${generateValue(
    feature.value.b
  )}`;
  if ("op2" in feature.value) str += ` ${feature.value.op2} ${generateValue(feature.value.c)}`;
  return str;
};
export const generateValue = (value: ValueNode): string => {
  if (value._t === "dimension") {
    return generateDimension(value);
  } else if (value._t === "ident") {
    return generateIdent(value);
  } else if (value._t === "ratio") {
    return generateRatio(value);
  } else {
    return generateNumber(value);
  }
};
export const generateRatio = (ratio: RatioNode): string => `${ratio.left}/${ratio.right}`;
export const generateNumber = (number: NumberNode): string => `${number.value}`;
export const generateDimension = (dimension: DimensionNode): string =>
  `${dimension.value}${dimension.unit}`;
export const generateIdent = (ident: IdentNode): string => ident.value;
