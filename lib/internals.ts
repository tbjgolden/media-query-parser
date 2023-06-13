import {
  MediaCondition,
  MediaFeature,
  MediaQuery,
  MediaQueryList,
  ParserError,
  ValidValueToken,
} from "./utils.js";

export const invertParserError = (parserError: ParserError): ParserError => {
  const errors: [first: ParserError, ...rest: ParserError[]] = [parserError];
  for (let error = parserError.child; error !== undefined; error = error.child) {
    errors.push(error);
  }
  for (let i = errors.length - 2; i >= 0; i--) {
    errors[i + 1].child = errors.at(i);
  }
  delete errors[0].child;
  return errors.at(-1) as ParserError;
};

export const deleteUndefinedValues = <
  T extends MediaQueryList | MediaQuery | MediaCondition | MediaFeature | ValidValueToken
>(
  n: T
): T => {
  switch (n.type) {
    case "query-list": {
      for (const query of n.mediaQueries) {
        deleteUndefinedValues(query);
      }
      return n;
    }
    case "query": {
      if (n.mediaPrefix === undefined) delete n.mediaPrefix;
      if (n.mediaType === undefined) delete n.mediaType;
      if (n.mediaCondition === undefined) {
        delete n.mediaCondition;
      } else {
        deleteUndefinedValues(n.mediaCondition);
      }
      return n;
    }
    case "condition": {
      if (n.operator === undefined) delete n.operator;
      for (const c of n.children) {
        deleteUndefinedValues(c);
      }
      return n;
    }
    case "feature": {
      if (n.context === "value") {
        if (n.mediaPrefix === undefined) delete n.mediaPrefix;
        deleteUndefinedValues(n.value);
      } else if (n.context === "range") {
        if (n.range.leftOp === undefined) delete n.range.leftOp;
        if (n.range.rightOp === undefined) delete n.range.rightOp;
        if (n.range.leftToken === undefined) {
          delete n.range.leftToken;
        } else {
          deleteUndefinedValues(n.range.leftToken);
        }
        if (n.range.rightToken === undefined) {
          delete n.range.rightToken;
        } else {
          deleteUndefinedValues(n.range.rightToken);
        }
      }
      return n;
    }
    default: {
      return n;
    }
  }
};
