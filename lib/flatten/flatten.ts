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
  const flatChildren: Array<MediaCondition | MediaFeature> = [];
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
      } else if (mediaCondition.operator === "not") {
        // can flatten if child has 'not' or undefined
        if (flatChild.operator === undefined) {
          return { type: "condition", operator: "not", children: flatChild.children };
        } else if (flatChild.operator === "not") {
          return { type: "condition", children: flatChild.children };
        }
      }
    }
  }
  return {
    type: "condition",
    operator: mediaCondition.operator,
    children: flatChildren,
  } as MediaCondition;
};
