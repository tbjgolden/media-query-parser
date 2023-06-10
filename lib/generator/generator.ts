import {
  MediaCondition,
  MediaFeature,
  MediaFeatureBoolean,
  MediaFeatureRange,
  MediaFeatureValue,
  MediaQuery,
  MediaQueryList,
  RatioToken,
  ValidRangeToken,
  ValidValueToken,
} from "../ast/types.js";
import { DimensionToken, IdentToken, NumberToken } from "../lexer/types.js";

export const generateMediaQueryList = (mediaQueryList: MediaQueryList): string =>
  mediaQueryList.mediaQueries.map((mediaQuery) => generateMediaQuery(mediaQuery)).join(", ");
export const generateMediaQuery = (mediaQuery: MediaQuery): string => {
  let str = "";
  if (mediaQuery.mediaPrefix) {
    str += mediaQuery.mediaPrefix + " ";
  }
  const doesNeedAll = mediaQuery.mediaPrefix !== undefined || !mediaQuery.mediaCondition;
  if (doesNeedAll || mediaQuery.mediaType !== "all") {
    str += mediaQuery.mediaType;
    if (mediaQuery.mediaCondition) {
      str += " and";
    }
  }
  if (mediaQuery.mediaCondition) {
    if (str !== "") {
      str += " ";
    }
    const conditionStr = generateMediaCondition(mediaQuery.mediaCondition);
    if (
      mediaQuery.mediaCondition.operator === undefined ||
      mediaQuery.mediaCondition.operator === "and" ||
      (mediaQuery.mediaCondition.operator === "not" && str === "")
    ) {
      str += conditionStr.slice(1, -1);
    } else {
      str += conditionStr;
    }
  }
  return str;
};
export const generateMediaCondition = (mediaCondition: MediaCondition): string => {
  let str = "(";
  if (mediaCondition.operator === undefined || mediaCondition.operator === "not") {
    if (mediaCondition.operator === "not") {
      str += "not ";
    }
    const child = mediaCondition.children[0];
    str += child.type === "feature" ? generateMediaFeature(child) : generateMediaCondition(child);
  } else {
    for (const child of mediaCondition.children) {
      if (str.length > 1) {
        str += " " + mediaCondition.operator + " ";
      }
      str += child.type === "feature" ? generateMediaFeature(child) : generateMediaCondition(child);
    }
  }
  str += ")";
  return str;
};
export const generateMediaFeature = (mediaFeature: MediaFeature): string => {
  let str = "(";
  if (mediaFeature.context === "boolean") {
    str += generateMediaFeatureBoolean(mediaFeature);
  } else if (mediaFeature.context === "value") {
    str += generateMediaFeatureValue(mediaFeature);
  } else {
    str += generateMediaFeatureRange(mediaFeature);
  }
  str += ")";
  return str;
};
export const generateMediaFeatureBoolean = (mediaFeature: MediaFeatureBoolean): string => {
  return mediaFeature.feature;
};
export const generateMediaFeatureValue = (mediaFeature: MediaFeatureValue): string => {
  const prefix = mediaFeature.prefix ? `${mediaFeature.prefix}-` : "";
  return prefix + mediaFeature.feature + ": " + generateValidValueToken(mediaFeature.value);
};
export const generateMediaFeatureRange = (mediaFeature: MediaFeatureRange): string => {
  let str = "";
  if (mediaFeature.range.leftOp) {
    str += `${generateValidRangeToken(mediaFeature.range.leftToken)} ${mediaFeature.range.leftOp} `;
  }
  str += mediaFeature.feature;
  if (mediaFeature.range.rightOp) {
    str += ` ${mediaFeature.range.rightOp} ${generateValidRangeToken(
      mediaFeature.range.rightToken
    )}`;
  }
  return str;
};
export const generateValidValueToken = (validValueToken: ValidValueToken): string => {
  if (validValueToken.type === "dimension") {
    return generateDimensionToken(validValueToken);
  } else if (validValueToken.type === "ident") {
    return generateIdentToken(validValueToken);
  } else if (validValueToken.type === "ratio") {
    return generateRatioToken(validValueToken);
  } else {
    return generateNumberToken(validValueToken);
  }
};
export const generateValidRangeToken = (validRangeToken: ValidRangeToken): string =>
  generateValidValueToken(validRangeToken);
export const generateRatioToken = (ratioToken: RatioToken): string =>
  `${ratioToken.numerator}/${ratioToken.denominator}`;
export const generateNumberToken = (numberToken: Omit<NumberToken, "start" | "end">): string =>
  `${numberToken.value}`;
export const generateDimensionToken = (
  dimensionToken: Omit<DimensionToken, "start" | "end">
): string => `${dimensionToken.value}${dimensionToken.unit}`;
export const generateIdentToken = (identToken: Omit<IdentToken, "start" | "end">): string =>
  identToken.value;
