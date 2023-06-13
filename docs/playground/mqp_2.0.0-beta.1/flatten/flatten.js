export const flattenMediaQueryList = (mediaQueryList) => ({
  type: "query-list",
  mediaQueries: mediaQueryList.mediaQueries.map((mediaQuery) => flattenMediaQuery(mediaQuery)),
});
export const flattenMediaQuery = (mediaQuery) => {
  return mediaQuery.mediaCondition
    ? {
        type: "query",
        mediaPrefix: mediaQuery.mediaPrefix,
        mediaType: mediaQuery.mediaType,
        mediaCondition: flattenMediaCondition(mediaQuery.mediaCondition),
      }
    : mediaQuery;
};
export const flattenMediaCondition = (mediaCondition) => {
  const flatChildren = [];
  for (const child of mediaCondition.children) {
    if (child.type === "condition") {
      const flatChild = flattenMediaCondition(child);
      if (flatChild.operator === undefined && flatChild.children.length === 1) {
        flatChildren.push(flatChild.children[0]);
      } else if (
        flatChild.operator === mediaCondition.operator &&
        (flatChild.operator === "and" || flatChild.operator === "or")
      ) {
        flatChildren.push(...flatChild.children);
      } else {
        flatChildren.push(flatChild);
      }
    } else {
      flatChildren.push(child);
    }
  }
  if (flatChildren.length === 1) {
    const flatChild = flatChildren[0];
    if (flatChild.type === "condition") {
      if (mediaCondition.operator === undefined) {
        return flatChild;
      } else if (mediaCondition.operator === "not" && flatChild.operator === "not") {
        return { type: "condition", children: flatChild.children };
      }
    }
  }
  return {
    type: "condition",
    operator: mediaCondition.operator,
    children: flatChildren,
  };
};
