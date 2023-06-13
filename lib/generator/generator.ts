import {
  MediaQueryList,
  MediaQuery,
  MediaCondition,
  MediaFeature,
  MediaFeatureBoolean,
  MediaFeatureValue,
  MediaFeatureRange,
  ValidValueToken,
  ValidRangeToken,
  RatioToken,
  NumberToken,
  DimensionToken,
  IdentToken,
} from "../utils.js";

export const generateMediaQueryList = (mediaQueryList: MediaQueryList): string =>
  mediaQueryList.mediaQueries.map((mediaQuery) => generateMediaQuery(mediaQuery)).join(", ");
export const generateMediaQuery = (mediaQuery: MediaQuery): string => {
  let str = "";
  if (mediaQuery.mediaPrefix) {
    str += mediaQuery.mediaPrefix + " ";
  }
  const doesNeedAll = mediaQuery.mediaPrefix !== undefined || !mediaQuery.mediaCondition;
  if (doesNeedAll || mediaQuery.mediaType !== undefined) {
    str += mediaQuery.mediaType ?? "all";
    if (mediaQuery.mediaCondition) {
      str += " and";
    }
  }
  if (mediaQuery.mediaCondition) {
    if (str !== "") {
      str += " ";
    }

    const condition = mediaQuery.mediaCondition;

    const canTrimParentheses = condition.operator !== "or" || !str;

    str += canTrimParentheses
      ? generateMediaCondition(mediaQuery.mediaCondition).slice(1, -1)
      : generateMediaCondition(mediaQuery.mediaCondition);
  }
  return str;
};
export const generateMediaCondition = (mediaCondition: MediaCondition): string => {
  let str = "(";
  if (mediaCondition.operator === "not") {
    const child = mediaCondition.children[0];
    str +=
      "not " +
      (child.type === "feature" ? generateMediaFeature(child) : generateMediaCondition(child));
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
  const mediaPrefix = mediaFeature.mediaPrefix ? `${mediaFeature.mediaPrefix}-` : "";
  return mediaPrefix + mediaFeature.feature + ": " + generateValidValueToken(mediaFeature.value);
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
