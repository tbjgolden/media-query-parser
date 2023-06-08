import { readCodepoints } from "./codepoints.js";
import { codepointsToTokens } from "./tokens.js";

export const lexer = (cssStr: string) => codepointsToTokens(readCodepoints(cssStr));
