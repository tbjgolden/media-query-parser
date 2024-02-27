import { LexerToken, ParserToken, ParserError } from "../utils.js";

export const convertToParserTokens = (cssTokens: LexerToken[]): ParserToken[] | ParserError => {
  const tokens: ParserToken[] = [];

  let isAfterSpace = false;
  for (const cssToken of cssTokens) {
    switch (cssToken._t) {
      case "{": {
        return { _errid: "NO_LCURLY", start: cssToken.start, end: cssToken.end };
      }
      case "semicolon": {
        return { _errid: "NO_SEMICOLON", start: cssToken.start, end: cssToken.end };
      }
      case "whitespace": {
        isAfterSpace = true;
        break;
      }
      case "EOF": {
        break;
      }
      default: {
        tokens.push({ ...cssToken, isAfterSpace });
        isAfterSpace = false;
      }
    }
  }

  return tokens;
};
