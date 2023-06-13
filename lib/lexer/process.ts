import { CSSToken, ParserToken, ParserError } from "../utils.js";

export const convertToParserTokens = (cssTokens: CSSToken[]): ParserToken[] | ParserError => {
  const tokens: ParserToken[] = [];

  let hasSpaceBefore = false;
  for (const cssToken of cssTokens) {
    switch (cssToken.type) {
      case "{": {
        return { errid: "NO_LCURLY", start: cssToken.start, end: cssToken.end };
      }
      case "semicolon": {
        return { errid: "NO_SEMICOLON", start: cssToken.start, end: cssToken.end };
      }
      case "whitespace": {
        hasSpaceBefore = true;
        if (tokens.length > 0) {
          tokens[tokens.length - 1].hasSpaceAfter = true;
        }
        break;
      }
      case "EOF": {
        break;
      }
      default: {
        tokens.push({ ...cssToken, hasSpaceBefore, hasSpaceAfter: false });
        hasSpaceBefore = false;
      }
    }
  }

  return tokens;
};
