import {
  readMediaQueryList,
  readMediaQuery,
  readMediaCondition,
  readMediaFeature,
} from "./ast/ast.js";
import {
  flattenMediaQueryList,
  flattenMediaQuery,
  flattenMediaCondition,
} from "./flatten/flatten.js";
import {
  generateMediaQueryList,
  generateMediaQuery,
  generateMediaCondition,
  generateMediaFeature,
  generateValidValueToken,
} from "./generator/generator.js";
import { lexer } from "./lexer/lexer.js";
import {
  MediaQueryList,
  ParserError,
  isParserError,
  MediaQuery,
  MediaCondition,
  MediaFeature,
  ValidValueToken,
} from "./shared.js";

export const parseMediaQueryList = (str: string): MediaQueryList | ParserError => {
  const tokens = lexer(str);
  return isParserError(tokens) ? tokens : flattenMediaQueryList(readMediaQueryList(tokens));
};
export const parseMediaQuery = (str: string): MediaQuery | ParserError => {
  const tokens = lexer(str);
  if (isParserError(tokens)) {
    return tokens;
  } else {
    const mediaQuery = readMediaQuery(tokens);
    return isParserError(mediaQuery) ? mediaQuery : flattenMediaQuery(mediaQuery);
  }
};
export const parseMediaCondition = (str: string): MediaCondition | ParserError => {
  const tokens = lexer(str);
  if (isParserError(tokens)) {
    return tokens;
  } else {
    const mediaCondition = readMediaCondition(tokens, true);
    return isParserError(mediaCondition) ? mediaCondition : flattenMediaCondition(mediaCondition);
  }
};
export const parseMediaFeature = (str: string): MediaFeature | ParserError => {
  const tokens = lexer(str);
  return isParserError(tokens) ? tokens : readMediaFeature(tokens);
};

export const stringify = (
  node: MediaQueryList | MediaQuery | MediaCondition | MediaFeature | ValidValueToken
) => {
  switch (node.type) {
    case "query-list": {
      return generateMediaQueryList(node);
    }
    case "query": {
      return generateMediaQuery(node);
    }
    case "condition": {
      return generateMediaCondition(node);
    }
    case "feature": {
      return generateMediaFeature(node);
    }
    default: {
      return generateValidValueToken(node);
    }
  }
};

export * from "./shared.js";
