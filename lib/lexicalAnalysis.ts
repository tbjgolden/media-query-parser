export type Token =
  | WhitespaceToken
  | StringToken
  | HashToken
  | DelimToken
  | CommaToken
  | LeftParenToken
  | RightParenToken
  | DimensionToken
  | NumberToken
  | PercentageToken
  | IdentToken
  | FunctionToken
  | UrlToken
  | CDCToken
  | ColonToken
  | SemicolonToken
  | CDOToken
  | AtKeywordToken
  | LeftBracketToken
  | RightBracketToken
  | LeftCurlyToken
  | RightCurlyToken
  | EOFToken;

export type WhitespaceToken = {
  type: "<whitespace-token>";
};
export type StringToken = {
  type: "<string-token>";
  value: string;
};
export type HashToken = {
  type: "<hash-token>";
  value: string;
  flag: "id" | "unrestricted";
};
export type DelimToken = {
  type: "<delim-token>";
  value: number;
};
export type CommaToken = {
  type: "<comma-token>";
};
export type LeftParenToken = {
  type: "<(-token>";
};
export type RightParenToken = {
  type: "<)-token>";
};
export type DimensionToken = {
  type: "<dimension-token>";
  value: number;
  unit: string;
  flag: "number";
};
export type NumberToken = {
  type: "<number-token>";
  value: number;
  flag: "number" | "integer";
};
export type PercentageToken = {
  type: "<percentage-token>";
  value: number;
  flag: "number";
};
export type CDCToken = {
  type: "<CDC-token>";
};
export type ColonToken = {
  type: "<colon-token>";
};
export type SemicolonToken = {
  type: "<semicolon-token>";
};
export type CDOToken = {
  type: "<CDO-token>";
};
export type AtKeywordToken = {
  type: "<at-keyword-token>";
  value: string;
};
export type LeftBracketToken = {
  type: "<[-token>";
};
export type RightBracketToken = {
  type: "<]-token>";
};
export type LeftCurlyToken = {
  type: "<{-token>";
};
export type RightCurlyToken = {
  type: "<}-token>";
};
export type EOFToken = {
  type: "<EOF-token>";
};
export type IdentToken = {
  type: "<ident-token>";
  value: string;
};
export type FunctionToken = {
  type: "<function-token>";
  value: string;
};
export type UrlToken = {
  type: "<url-token>";
  value: string;
};

// eslint-disable-next-line no-control-regex
const weirdNewlines = /(\u000D|\u000C|\u000D\u000A)/g;
// eslint-disable-next-line no-control-regex
const nullOrSurrogates = /[\u0000\uD800-\uDFFF]/g;
const commentRegex = /(\/\*)[\S\s]*?(\*\/)/g;

export const lexicalAnalysis = (str: string, index = 0): Token[] | null => {
  // pre-processing
  str = str.replace(weirdNewlines, "\n").replace(nullOrSurrogates, "\uFFFD");

  // remove comments
  str = str.replace(commentRegex, "");

  const tokens: Token[] = [];
  for (; index < str.length; index += 1) {
    const code = str.charCodeAt(index);
    if (code === 0x00_09 || code === 0x00_20 || code === 0x00_0a) {
      let code = str.charCodeAt(++index);
      while (code === 0x00_09 || code === 0x00_20 || code === 0x00_0a) {
        code = str.charCodeAt(++index);
      }
      index -= 1;
      tokens.push({
        type: "<whitespace-token>",
      });
    } else if (code === 0x00_22) {
      const result = consumeString(str, index);
      if (result === null) {
        return null;
      }
      const [lastIndex, value] = result;
      tokens.push({
        type: "<string-token>",
        value,
      });
      index = lastIndex;
    } else if (code === 0x00_23) {
      // if hash
      if (index + 1 < str.length) {
        const nextCode = str.charCodeAt(index + 1);

        if (
          nextCode === 0x00_5f ||
          (nextCode >= 0x00_41 && nextCode <= 0x00_5a) ||
          (nextCode >= 0x00_61 && nextCode <= 0x00_7a) ||
          nextCode >= 0x00_80 ||
          (nextCode >= 0x00_30 && nextCode <= 0x00_39) ||
          (nextCode === 0x00_5c && index + 2 < str.length && str.charCodeAt(index + 2) !== 0x00_0a)
        ) {
          const flag: "id" | "unrestricted" = wouldStartIdentifier(str, index + 1)
            ? "id"
            : "unrestricted";

          const result = consumeIdentUnsafe(str, index + 1);
          if (result !== null) {
            const [lastIndex, value] = result;
            tokens.push({
              type: "<hash-token>",
              value: value.toLowerCase(),
              flag,
            });
            index = lastIndex;
            continue;
          }
        }
      }

      tokens.push({ type: "<delim-token>", value: code });
    } else if (code === 0x00_27) {
      const result = consumeString(str, index);
      if (result === null) {
        return null;
      }
      const [lastIndex, value] = result;
      tokens.push({
        type: "<string-token>",
        value,
      });
      index = lastIndex;
    } else if (code === 0x00_28) {
      tokens.push({ type: "<(-token>" });
    } else if (code === 0x00_29) {
      tokens.push({ type: "<)-token>" });
    } else if (code === 0x00_2b) {
      const plusNumeric = consumeNumeric(str, index);
      if (plusNumeric === null) {
        tokens.push({
          type: "<delim-token>",
          value: code,
        });
      } else {
        const [lastIndex, tokenTuple] = plusNumeric;
        if (tokenTuple[0] === "<dimension-token>") {
          tokens.push({
            type: "<dimension-token>",
            value: tokenTuple[1],
            unit: tokenTuple[2].toLowerCase(),
            flag: "number",
          });
        } else if (tokenTuple[0] === "<number-token>") {
          tokens.push({
            type: tokenTuple[0],
            value: tokenTuple[1],
            flag: tokenTuple[2],
          });
        } else {
          tokens.push({
            type: tokenTuple[0],
            value: tokenTuple[1],
            flag: "number",
          });
        }
        index = lastIndex;
      }
    } else if (code === 0x00_2c) {
      tokens.push({ type: "<comma-token>" });
    } else if (code === 0x00_2d) {
      const minusNumeric = consumeNumeric(str, index);
      if (minusNumeric !== null) {
        const [lastIndex, tokenTuple] = minusNumeric;
        if (tokenTuple[0] === "<dimension-token>") {
          tokens.push({
            type: "<dimension-token>",
            value: tokenTuple[1],
            unit: tokenTuple[2].toLowerCase(),
            flag: "number",
          });
        } else if (tokenTuple[0] === "<number-token>") {
          tokens.push({
            type: tokenTuple[0],
            value: tokenTuple[1],
            flag: tokenTuple[2],
          });
        } else {
          tokens.push({
            type: tokenTuple[0],
            value: tokenTuple[1],
            flag: "number",
          });
        }
        index = lastIndex;
        continue;
      }
      // if CDC
      if (index + 2 < str.length) {
        const nextCode = str.charCodeAt(index + 1);
        const nextNextCode = str.charCodeAt(index + 2);
        if (nextCode === 0x00_2d && nextNextCode === 0x00_3e) {
          tokens.push({
            type: "<CDC-token>",
          });
          index += 2;
          continue;
        }
      }
      // try parse as ident
      const result = consumeIdentLike(str, index);
      if (result !== null) {
        const [lastIndex, value, type] = result;
        tokens.push({
          type,
          value,
        });
        index = lastIndex;
        continue;
      }

      tokens.push({
        type: "<delim-token>",
        value: code,
      });
    } else if (code === 0x00_2e) {
      const minusNumeric = consumeNumeric(str, index);
      if (minusNumeric === null) {
        tokens.push({
          type: "<delim-token>",
          value: code,
        });
      } else {
        const [lastIndex, tokenTuple] = minusNumeric;
        if (tokenTuple[0] === "<dimension-token>") {
          tokens.push({
            type: "<dimension-token>",
            value: tokenTuple[1],
            unit: tokenTuple[2].toLowerCase(),
            flag: "number",
          });
        } else if (tokenTuple[0] === "<number-token>") {
          tokens.push({
            type: tokenTuple[0],
            value: tokenTuple[1],
            flag: tokenTuple[2],
          });
        } else {
          tokens.push({
            type: tokenTuple[0],
            value: tokenTuple[1],
            flag: "number",
          });
        }
        index = lastIndex;
        continue;
      }
    } else if (code === 0x00_3a) {
      tokens.push({ type: "<colon-token>" });
    } else if (code === 0x00_3b) {
      tokens.push({ type: "<semicolon-token>" });
    } else if (code === 0x00_3c) {
      // if CDO
      if (index + 3 < str.length) {
        const nextCode = str.charCodeAt(index + 1);
        const nextNextCode = str.charCodeAt(index + 2);
        const nextNextNextCode = str.charCodeAt(index + 3);
        if (nextCode === 0x00_21 && nextNextCode === 0x00_2d && nextNextNextCode === 0x00_2d) {
          tokens.push({
            type: "<CDO-token>",
          });
          index += 3;
          continue;
        }
      }

      tokens.push({
        type: "<delim-token>",
        value: code,
      });
    } else if (code === 0x00_40) {
      // if at keyword
      const result = consumeIdent(str, index + 1);
      if (result !== null) {
        const [lastIndex, value] = result;
        tokens.push({
          type: "<at-keyword-token>",
          value: value.toLowerCase(),
        });
        index = lastIndex;
        continue;
      }

      tokens.push({ type: "<delim-token>", value: code });
    } else if (code === 0x00_5b) {
      tokens.push({ type: "<[-token>" });
    } else if (code === 0x00_5c) {
      const result = consumeEscape(str, index);
      if (result === null) {
        return null;
      }
      const [lastIndex, value] = result;
      str = str.slice(0, index) + value + str.slice(lastIndex + 1);
      index -= 1;
    } else if (code === 0x00_5d) {
      tokens.push({ type: "<]-token>" });
    } else if (code === 0x00_7b) {
      tokens.push({ type: "<{-token>" });
    } else if (code === 0x00_7d) {
      tokens.push({ type: "<}-token>" });
    } else if (code >= 0x00_30 && code <= 0x00_39) {
      const result = consumeNumeric(str, index) as NonNullable<ReturnType<typeof consumeNumeric>>;
      const [lastIndex, tokenTuple] = result;
      if (tokenTuple[0] === "<dimension-token>") {
        tokens.push({
          type: "<dimension-token>",
          value: tokenTuple[1],
          unit: tokenTuple[2].toLowerCase(),
          flag: "number",
        });
      } else if (tokenTuple[0] === "<number-token>") {
        tokens.push({
          type: tokenTuple[0],
          value: tokenTuple[1],
          flag: tokenTuple[2],
        });
      } else {
        tokens.push({
          type: tokenTuple[0],
          value: tokenTuple[1],
          flag: "number",
        });
      }

      index = lastIndex;
    } else if (
      code === 0x00_5f ||
      (code >= 0x00_41 && code <= 0x00_5a) ||
      (code >= 0x00_61 && code <= 0x00_7a) ||
      code >= 0x00_80
    ) {
      const result = consumeIdentLike(str, index);
      if (result === null) {
        return null;
      }
      const [lastIndex, value, type] = result;
      tokens.push({
        type,
        value,
      });
      index = lastIndex;
    } else {
      tokens.push({ type: "<delim-token>", value: code });
    }
  }
  tokens.push({ type: "<EOF-token>" });
  return tokens;
};

export const consumeString = (str: string, index: number): [number, string] | null => {
  if (str.length <= index + 1) return null;
  const firstCode = str.charCodeAt(index);
  const charCodes: number[] = [];
  for (let i = index + 1; i < str.length; i += 1) {
    const code = str.charCodeAt(i);
    if (code === firstCode) {
      // " end string
      return [i, String.fromCharCode.apply(null, charCodes)];
    } else if (code === 0x00_5c) {
      // \ escape mode
      const result = consumeEscape(str, i);
      if (result === null) return null;
      const [lastIndex, charCode] = result;
      charCodes.push(charCode);
      i = lastIndex;
    } else if (code === 0x00_0a) {
      // \n
      return null;
    } else {
      charCodes.push(code);
    }
  }

  return null;
};

export const wouldStartIdentifier = (str: string, index: number): boolean => {
  if (str.length <= index) return false;
  const code = str.charCodeAt(index);
  if (code === 0x00_2d) {
    // -
    if (str.length <= index + 1) return false;

    const nextCode = str.charCodeAt(index + 1);
    if (
      nextCode === 0x00_2d ||
      nextCode === 0x00_5f ||
      (nextCode >= 0x00_41 && nextCode <= 0x00_5a) ||
      (nextCode >= 0x00_61 && nextCode <= 0x00_7a) ||
      nextCode >= 0x00_80
    ) {
      return true;
    } else if (nextCode === 0x00_5c) {
      if (str.length <= index + 2) return false;
      const nextNextCode = str.charCodeAt(index + 2);
      return nextNextCode !== 0x00_0a;
    } else {
      return false;
    }
  } else if (
    // identifier-start code point
    code === 0x00_5f ||
    (code >= 0x00_41 && code <= 0x00_5a) ||
    (code >= 0x00_61 && code <= 0x00_7a) ||
    code >= 0x00_80
  ) {
    return true;
  } else if (code === 0x00_5c) {
    // \
    if (str.length <= index + 1) return false;
    const nextCode = str.charCodeAt(index + 1);
    return nextCode !== 0x00_0a;
  } else {
    return false;
  }
};

export const consumeEscape = (str: string, index: number): [number, number] | null => {
  if (str.length <= index + 1) return null;
  if (str.charCodeAt(index) !== 0x00_5c) return null;

  const code = str.charCodeAt(index + 1);
  if (code === 0x00_0a) {
    return null;
  } else if (
    (code >= 0x00_30 && code <= 0x00_39) ||
    (code >= 0x00_41 && code <= 0x00_46) ||
    (code >= 0x00_61 && code <= 0x00_66)
  ) {
    const hexCharCodes: number[] = [code];
    const min = Math.min(index + 7, str.length);
    let i = index + 2;
    for (; i < min; i += 1) {
      const code = str.charCodeAt(i);
      if (
        (code >= 0x00_30 && code <= 0x00_39) ||
        (code >= 0x00_41 && code <= 0x00_46) ||
        (code >= 0x00_61 && code <= 0x00_66)
      ) {
        hexCharCodes.push(code);
      } else {
        break;
      }
    }
    if (i < str.length) {
      const code = str.charCodeAt(i);
      if (code === 0x00_09 || code === 0x00_20 || code === 0x00_0a) {
        i += 1;
      }
    }
    return [i - 1, Number.parseInt(String.fromCharCode.apply(null, hexCharCodes), 16)];
  } else {
    return [index + 1, code];
  }
};

export const consumeNumeric = (
  str: string,
  index: number
):
  | [
      number,
      (
        | ["<number-token>", number, "number" | "integer"]
        | ["<percentage-token>", number]
        | ["<dimension-token>", number, string]
      )
    ]
  | null => {
  const numberResult = consumeNumber(str, index);
  if (numberResult === null) return null;
  const [numberEndIndex, numberValue, numberFlag] = numberResult;

  const identResult = consumeIdent(str, numberEndIndex + 1);
  if (identResult !== null) {
    const [identEndIndex, identValue] = identResult;
    return [identEndIndex, ["<dimension-token>", numberValue, identValue]];
  }

  if (numberEndIndex + 1 < str.length && str.charCodeAt(numberEndIndex + 1) === 0x00_25) {
    return [numberEndIndex + 1, ["<percentage-token>", numberValue]];
  }

  return [numberEndIndex, ["<number-token>", numberValue, numberFlag]];
};

export const consumeNumber = (
  str: string,
  index: number
): [number, number, "integer" | "number"] | null => {
  if (str.length <= index) return null;

  let flag: "integer" | "number" = "integer";

  const numberChars: number[] = [];
  const firstCode = str.charCodeAt(index);
  if (firstCode === 0x00_2b || firstCode === 0x00_2d) {
    index += 1;
    if (firstCode === 0x00_2d) numberChars.push(0x00_2d);
  }
  while (index < str.length) {
    const code = str.charCodeAt(index);
    if (code >= 0x00_30 && code <= 0x00_39) {
      numberChars.push(code);
      index += 1;
    } else {
      break;
    }
  }

  if (index + 1 < str.length) {
    const nextCode = str.charCodeAt(index);
    const nextNextCode = str.charCodeAt(index + 1);

    if (nextCode === 0x00_2e && nextNextCode >= 0x00_30 && nextNextCode <= 0x00_39) {
      numberChars.push(nextCode, nextNextCode);
      flag = "number";
      index += 2;

      while (index < str.length) {
        const code = str.charCodeAt(index);
        if (code >= 0x00_30 && code <= 0x00_39) {
          numberChars.push(code);
          index += 1;
        } else {
          break;
        }
      }
    }
  }

  if (index + 1 < str.length) {
    const nextCode = str.charCodeAt(index);
    const nextNextCode = str.charCodeAt(index + 1);
    const nextNextNextCode = str.charCodeAt(index + 2);

    if (nextCode === 0x00_45 || nextCode === 0x00_65) {
      const nextNextIsDigit = nextNextCode >= 0x00_30 && nextNextCode <= 0x00_39;
      if (
        nextNextIsDigit ||
        ((nextNextCode === 0x00_2b || nextNextCode === 0x00_2d) &&
          nextNextNextCode >= 0x00_30 &&
          nextNextNextCode <= 0x00_39)
      ) {
        flag = "number";
        if (nextNextIsDigit) {
          numberChars.push(0x00_45, nextNextCode);
          index += 2;
        } else if (nextNextCode === 0x00_2d) {
          numberChars.push(0x00_45, 0x00_2d, nextNextNextCode);
          index += 3;
        } else {
          numberChars.push(0x00_45, nextNextNextCode);
          index += 3;
        }

        while (index < str.length) {
          const code = str.charCodeAt(index);
          if (code >= 0x00_30 && code <= 0x00_39) {
            numberChars.push(code);
            index += 1;
          } else {
            break;
          }
        }
      }
    }
  }

  const numberString = String.fromCharCode.apply(null, numberChars);
  let value = flag === "number" ? Number.parseFloat(numberString) : Number.parseInt(numberString);
  // convert -0 to 0
  if (value === 0) value = 0;

  return Number.isNaN(value) ? null : [index - 1, value, flag];
};

// deliberately does not check if it starts with an identifier start code point
export const consumeIdentUnsafe = (str: string, index: number): [number, string] | null => {
  if (str.length <= index) {
    return null;
  }

  const identChars: number[] = [];
  for (let code = str.charCodeAt(index); index < str.length; code = str.charCodeAt(++index)) {
    if (
      code === 0x00_2d ||
      code === 0x00_5f ||
      (code >= 0x00_41 && code <= 0x00_5a) ||
      (code >= 0x00_61 && code <= 0x00_7a) ||
      code >= 0x00_80 ||
      (code >= 0x00_30 && code <= 0x00_39)
    ) {
      identChars.push(code);
      continue;
    } else {
      const result = consumeEscape(str, index);
      if (result !== null) {
        const [lastIndex, code] = result;
        identChars.push(code);
        index = lastIndex;
        continue;
      }
    }
    break;
  }

  return index === 0 ? null : [index - 1, String.fromCharCode.apply(null, identChars)];
};

export const consumeIdent = (str: string, index: number): [number, string] | null => {
  if (str.length <= index || !wouldStartIdentifier(str, index)) {
    return null;
  }

  const identChars: number[] = [];
  for (let code = str.charCodeAt(index); index < str.length; code = str.charCodeAt(++index)) {
    if (
      code === 0x00_2d ||
      code === 0x00_5f ||
      (code >= 0x00_41 && code <= 0x00_5a) ||
      (code >= 0x00_61 && code <= 0x00_7a) ||
      code >= 0x00_80 ||
      (code >= 0x00_30 && code <= 0x00_39)
    ) {
      identChars.push(code);
      continue;
    } else {
      const result = consumeEscape(str, index);
      if (result !== null) {
        const [lastIndex, code] = result;
        identChars.push(code);
        index = lastIndex;
        continue;
      }
    }
    break;
  }

  return [index - 1, String.fromCharCode.apply(null, identChars)];
};

export const consumeUrl = (str: string, index: number): [number, string] | null => {
  let code = str.charCodeAt(index);
  while (code === 0x00_09 || code === 0x00_20 || code === 0x00_0a) {
    code = str.charCodeAt(++index);
  }

  const urlChars: number[] = [];
  let hasFinishedWord = false;
  while (index < str.length) {
    if (code === 0x00_29) {
      return [index, String.fromCharCode.apply(null, urlChars)];
    } else if (code === 0x00_22 || code === 0x00_27 || code === 0x00_28) {
      return null;
    } else if (code === 0x00_09 || code === 0x00_20 || code === 0x00_0a) {
      if (!hasFinishedWord && urlChars.length > 0) hasFinishedWord = true;
    } else if (code === 0x00_5c) {
      const result = consumeEscape(str, index);
      if (result === null || hasFinishedWord) return null;
      const [lastIndex, value] = result;
      urlChars.push(value);
      index = lastIndex;
    } else {
      if (hasFinishedWord) return null;
      urlChars.push(code);
    }
    code = str.charCodeAt(++index);
  }
  return null;
};

export const consumeIdentLike = (
  str: string,
  index: number
): [number, string, "<ident-token>" | "<function-token>" | "<url-token>"] | null => {
  const result = consumeIdent(str, index);
  if (result === null) return null;

  const [lastIndex, value] = result;
  if (value.toLowerCase() === "url") {
    if (str.length > lastIndex + 1) {
      const nextCode = str.charCodeAt(lastIndex + 1);
      if (nextCode === 0x00_28) {
        for (let offset = 2; lastIndex + offset < str.length; offset += 1) {
          const nextNextCode = str.charCodeAt(lastIndex + offset);
          if (nextNextCode === 0x00_22 || nextNextCode === 0x00_27) {
            return [lastIndex + 1, value.toLowerCase(), "<function-token>"];
          } else if (
            nextNextCode !== 0x00_09 &&
            nextNextCode !== 0x00_20 &&
            nextNextCode !== 0x00_0a
          ) {
            const result = consumeUrl(str, lastIndex + offset);
            if (result === null) return null;
            const [lastUrlIndex, value] = result;
            return [lastUrlIndex, value, "<url-token>"];
          }
        }
        return [lastIndex + 1, value.toLowerCase(), "<function-token>"];
      }
    }
  } else if (str.length > lastIndex + 1) {
    const nextCode = str.charCodeAt(lastIndex + 1);
    if (nextCode === 0x00_28) {
      return [lastIndex + 1, value.toLowerCase(), "<function-token>"];
    }
  }

  return [lastIndex, value.toLowerCase(), "<ident-token>"];
};
