import { MediaCondition, MediaFeature, MediaQuery } from "../ast/types.js";

// Mutates, assumes AST represents a valid media query
export const simplifyMediaQueryList = (mediaQueryList: MediaQuery[]): MediaQuery[] => {
  for (let i = mediaQueryList.length - 1; i >= 0; i--) {
    // eslint-disable-next-line security/detect-object-injection
    mediaQueryList[i] = simplifyMediaQuery(mediaQueryList[i]);
  }

  return mediaQueryList;
};

const simplifyMediaQuery = (mediaQuery: MediaQuery): MediaQuery => {
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
    mediaPrefix: mediaQuery.mediaPrefix,
    mediaType: mediaQuery.mediaType,
    mediaCondition,
  };
};

const simplifyMediaCondition = (mediaCondition: MediaCondition): MediaCondition => {
  for (let i = mediaCondition.children.length - 1; i >= 0; i--) {
    // eslint-disable-next-line security/detect-object-injection
    const unsimplifiedChild = mediaCondition.children[i] as MediaCondition | MediaFeature;
    if (!("context" in unsimplifiedChild)) {
      const child = simplifyMediaCondition(unsimplifiedChild) as MediaCondition;
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
          ...args: Array<MediaCondition | MediaFeature>
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
