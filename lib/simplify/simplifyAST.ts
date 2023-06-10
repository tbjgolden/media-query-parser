import {
  SimpleMediaCondition,
  SimpleMediaFeature,
  SimpleMediaQuery,
  MediaQueryList,
} from "../ast/types.js";

export const simplifyMediaQueryList = (mediaQueryList: MediaQueryList): MediaQueryList => ({
  type: "query-list",
  mediaQueries: mediaQueryList.mediaQueries.map((mediaQuery) => simplifyMediaQuery(mediaQuery)),
});

export const simplifyMediaQuery = (mediaQuery: SimpleMediaQuery): SimpleMediaQuery => {
  if (mediaQuery.mediaCondition === undefined) return mediaQuery;

  let mediaCondition = simplifyMediaCondition(mediaQuery.mediaCondition);
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

// TODO: remove mutation
export const simplifyMediaCondition = (
  mediaCondition: SimpleMediaCondition
): SimpleMediaCondition => {
  for (let i = mediaCondition.children.length - 1; i >= 0; i--) {
    // eslint-disable-next-line security/detect-object-injection
    const unsimplifiedChild = mediaCondition.children[i] as
      | SimpleMediaCondition
      | SimpleMediaFeature;
    if (!("context" in unsimplifiedChild)) {
      const child = simplifyMediaCondition(unsimplifiedChild) as SimpleMediaCondition;
      if (child.operator === undefined && child.children.length === 1) {
        // eslint-disable-next-line security/detect-object-injection
        mediaCondition.children[i] = child.children[0];
      } else if (
        child.operator === mediaCondition.operator &&
        (child.operator === "and" || child.operator === "or")
      ) {
        const spliceArgs: [
          start: number,
          deleteCount: number,
          ...args: Array<SimpleMediaCondition | SimpleMediaFeature>
        ] = [i, 1];
        for (let i = 0; i < child.children.length; i++) {
          // eslint-disable-next-line security/detect-object-injection
          spliceArgs.push(child.children[i]);
        }
        mediaCondition.children.splice(...spliceArgs);
      }
    }
  }

  return mediaCondition;
};
