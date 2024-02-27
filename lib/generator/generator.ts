import {
  QueryListNode,
  QueryNode,
  ConditionNode,
  FeatureNode,
  BooleanFeatureNode,
  PlainFeatureNode,
  ValueNode,
  RatioNode,
  IdentNode,
  NumberNode,
  ConditionWithoutOrNode,
  InParensNode,
  DimensionNode,
  RangeFeatureNode,
  DoubleRangeFeatureNode,
  SingleRangeFeatureNode,
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
    ? "not " + generateInParens(condition.nodes[0])
    : (condition.nodes ?? []).map((b) => `${generateInParens(b)}`).join(` ${condition.op} `);
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
  return feature.ops === 1
    ? generateFeatureSingleRange(feature)
    : generateFeatureDoubleRange(feature);
};
export const generateFeatureSingleRange = (feature: SingleRangeFeatureNode): string => {
  return `${feature.feature} ${feature.op} ${generateValue(feature.value)}`;
};
export const generateFeatureDoubleRange = (feature: DoubleRangeFeatureNode): string => {
  return `${generateValue(feature.minValue)} ${feature.minOp} ${feature.feature} ${
    feature.maxOp
  } ${generateValue(feature.maxValue)}`;
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
