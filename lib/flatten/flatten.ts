import { MediaQueryList, MediaQuery, MediaCondition, MediaFeature } from "../shared.js";

export const flattenMediaQueryList = (mediaQueryList: MediaQueryList): MediaQueryList => ({
  type: "query-list",
  mediaQueries: mediaQueryList.mediaQueries.map((mediaQuery) => flattenMediaQuery(mediaQuery)),
});

export const flattenMediaQuery = (mediaQuery: MediaQuery): MediaQuery => {
  if (mediaQuery.mediaCondition === undefined) return mediaQuery;

  let mediaCondition = flattenMediaCondition(mediaQuery.mediaCondition);
  if (
    mediaCondition.operator === undefined &&
    mediaCondition.children.length === 1 &&
    "children" in mediaCondition.children[0]
  ) {
    mediaCondition = mediaCondition.children[0];
  }

  return {
    type: "query",
    mediaPrefix: mediaQuery.mediaPrefix,
    mediaType: mediaQuery.mediaType,
    mediaCondition,
  };
};

export const flattenMediaCondition = (mediaCondition: MediaCondition): MediaCondition => {
  const children: Array<MediaCondition | MediaFeature> = [];
  for (const child of mediaCondition.children) {
    if (child.type === "condition") {
      const grandchild = flattenMediaCondition(child);
      if (grandchild.operator === undefined && grandchild.children.length === 1) {
        children.push(grandchild.children[0]);
      } else if (
        grandchild.operator === mediaCondition.operator &&
        (grandchild.operator === "and" || grandchild.operator === "or")
      ) {
        children.push(...grandchild.children);
      } else {
        children.push(grandchild);
      }
    } else {
      children.push(child);
    }
  }
  return { type: "condition", operator: mediaCondition.operator, children } as MediaCondition;
};
