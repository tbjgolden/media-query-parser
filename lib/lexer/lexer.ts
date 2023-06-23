import { ParserToken, ParserError, isParserError } from "../utils.js";
import { readCodepoints } from "./codepoints.js";
import { convertToParserTokens } from "./process.js";
import { codepointsToTokens } from "./tokens.js";

export const lexer = (cssStr: string): ParserToken[] | ParserError => {
  const cssTokens = codepointsToTokens(readCodepoints(cssStr));
  return isParserError(cssTokens) ? cssTokens : convertToParserTokens(cssTokens);
};
