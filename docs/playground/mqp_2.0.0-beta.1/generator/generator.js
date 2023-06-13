export const generateMediaQueryList = (mediaQueryList) =>
  mediaQueryList.mediaQueries.map((mediaQuery) => generateMediaQuery(mediaQuery)).join(", ");
export const generateMediaQuery = (mediaQuery) => {
  var _a;
  let str = "";
  if (mediaQuery.mediaPrefix) {
    str += mediaQuery.mediaPrefix + " ";
  }
  const doesNeedAll = mediaQuery.mediaPrefix !== undefined || !mediaQuery.mediaCondition;
  if (doesNeedAll || mediaQuery.mediaType !== undefined) {
    str += (_a = mediaQuery.mediaType) !== null && _a !== void 0 ? _a : "all";
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
export const generateMediaCondition = (mediaCondition) => {
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
export const generateMediaFeature = (mediaFeature) => {
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
export const generateMediaFeatureBoolean = (mediaFeature) => {
  return mediaFeature.feature;
};
export const generateMediaFeatureValue = (mediaFeature) => {
  const mediaPrefix = mediaFeature.mediaPrefix ? `${mediaFeature.mediaPrefix}-` : "";
  return mediaPrefix + mediaFeature.feature + ": " + generateValidValueToken(mediaFeature.value);
};
export const generateMediaFeatureRange = (mediaFeature) => {
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
export const generateValidValueToken = (validValueToken) => {
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
export const generateValidRangeToken = (validRangeToken) =>
  generateValidValueToken(validRangeToken);
export const generateRatioToken = (ratioToken) =>
  `${ratioToken.numerator}/${ratioToken.denominator}`;
export const generateNumberToken = (numberToken) => `${numberToken.value}`;
export const generateDimensionToken = (dimensionToken) =>
  `${dimensionToken.value}${dimensionToken.unit}`;
export const generateIdentToken = (identToken) => identToken.value;
