import { isParserError } from "../ast/ast.js";
import { readCodepoints } from "./codepoints.js";
import { convertToParserTokens } from "./process.js";
import { codepointsToTokens } from "./tokens.js";
export const lexer = (cssStr) => {
  const cssTokens = codepointsToTokens(readCodepoints(cssStr));
  return isParserError(cssTokens) ? cssTokens : convertToParserTokens(cssTokens);
};
