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
  type: "whitespace";
};
export type StringToken = {
  type: "string";
  value: string;
};
export type HashToken = {
  type: "hash";
  value: string;
  flag: "id" | "unrestricted";
};
export type DelimToken = {
  type: "delim";
  value: number;
};
export type CommaToken = {
  type: "comma";
};
export type LeftParenToken = {
  type: "(";
};
export type RightParenToken = {
  type: ")";
};
export type DimensionToken = {
  type: "dimension";
  value: number;
  unit: string;
  flag: "number";
};
export type NumberToken = {
  type: "number";
  value: number;
  flag: "number" | "integer";
};
export type PercentageToken = {
  type: "percentage";
  value: number;
  flag: "number";
};
export type CDCToken = {
  type: "CDC";
};
export type ColonToken = {
  type: "colon";
};
export type SemicolonToken = {
  type: "semicolon";
};
export type CDOToken = {
  type: "CDO";
};
export type AtKeywordToken = {
  type: "at-keyword";
  value: string;
};
export type LeftBracketToken = {
  type: "[";
};
export type RightBracketToken = {
  type: "]";
};
export type LeftCurlyToken = {
  type: "{";
};
export type RightCurlyToken = {
  type: "}";
};
export type EOFToken = {
  type: "EOF";
};
export type IdentToken = {
  type: "ident";
  value: string;
};
export type FunctionToken = {
  type: "function";
  value: string;
};
export type UrlToken = {
  type: "url";
  value: string;
};

export const codepointsToTokens = (codepoints: number[], index = 0): Token[] | null => {
  const tokens: Token[] = [];

  for (; index < codepoints.length; index += 1) {
    const code = codepoints.at(index) as number;

    if (code === 0x00_2f && codepoints.at(index + 1) === 0x00_2a) {
      index += 2;
      for (
        let nextCode = codepoints.at(index);
        nextCode !== undefined;
        nextCode = codepoints.at(++index)
      ) {
        if (nextCode === 0x00_2a && codepoints.at(index + 1) === 0x00_2f) {
          index += 1;
          break;
        }
      }
    } else if (code === 0x00_09 || code === 0x00_20 || code === 0x00_0a) {
      let code = codepoints.at(++index);
      while (code === 0x00_09 || code === 0x00_20 || code === 0x00_0a) {
        code = codepoints.at(++index);
      }
      index -= 1;

      const prevToken = tokens.at(-1);
      if (prevToken?.type === "whitespace") {
        tokens.pop();
      }
      tokens.push({
        type: "whitespace",
      });
    } else if (code === 0x00_22) {
      const result = consumeString(codepoints, index);
      if (result === null) {
        return null;
      }
      const [lastIndex, value] = result;
      tokens.push({
        type: "string",
        value,
      });
      index = lastIndex;
    } else if (code === 0x00_23) {
      // if hash
      if (index + 1 < codepoints.length) {
        const nextCode = codepoints.at(index + 1) as number;

        if (
          nextCode === 0x00_5f ||
          (nextCode >= 0x00_41 && nextCode <= 0x00_5a) ||
          (nextCode >= 0x00_61 && nextCode <= 0x00_7a) ||
          nextCode >= 0x00_80 ||
          (nextCode >= 0x00_30 && nextCode <= 0x00_39) ||
          (nextCode === 0x00_5c &&
            index + 2 < codepoints.length &&
            codepoints.at(index + 2) !== 0x00_0a)
        ) {
          const flag: "id" | "unrestricted" = wouldStartIdentifier(codepoints, index + 1)
            ? "id"
            : "unrestricted";

          const result = consumeIdentUnsafe(codepoints, index + 1);
          if (result !== null) {
            const [lastIndex, value] = result;
            tokens.push({
              type: "hash",
              value: value.toLowerCase(),
              flag,
            });
            index = lastIndex;
            continue;
          }
        }
      }

      tokens.push({ type: "delim", value: code });
    } else if (code === 0x00_27) {
      const result = consumeString(codepoints, index);
      if (result === null) {
        return null;
      }
      const [lastIndex, value] = result;
      tokens.push({
        type: "string",
        value,
      });
      index = lastIndex;
    } else if (code === 0x00_28) {
      tokens.push({ type: "(" });
    } else if (code === 0x00_29) {
      tokens.push({ type: ")" });
    } else if (code === 0x00_2b) {
      const plusNumeric = consumeNumeric(codepoints, index);
      if (plusNumeric === null) {
        tokens.push({
          type: "delim",
          value: code,
        });
      } else {
        const [lastIndex, tokenTuple] = plusNumeric;
        if (tokenTuple[0] === "dimension") {
          tokens.push({
            type: "dimension",
            value: tokenTuple[1],
            unit: tokenTuple[2].toLowerCase(),
            flag: "number",
          });
        } else if (tokenTuple[0] === "number") {
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
      tokens.push({ type: "comma" });
    } else if (code === 0x00_2d) {
      const minusNumeric = consumeNumeric(codepoints, index);
      if (minusNumeric !== null) {
        const [lastIndex, tokenTuple] = minusNumeric;
        if (tokenTuple[0] === "dimension") {
          tokens.push({
            type: "dimension",
            value: tokenTuple[1],
            unit: tokenTuple[2].toLowerCase(),
            flag: "number",
          });
        } else if (tokenTuple[0] === "number") {
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
      if (index + 2 < codepoints.length) {
        const nextCode = codepoints.at(index + 1);
        const nextNextCode = codepoints.at(index + 2);
        if (nextCode === 0x00_2d && nextNextCode === 0x00_3e) {
          tokens.push({
            type: "CDC",
          });
          index += 2;
          continue;
        }
      }
      // try parse as ident
      const result = consumeIdentLike(codepoints, index);
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
        type: "delim",
        value: code,
      });
    } else if (code === 0x00_2e) {
      const minusNumeric = consumeNumeric(codepoints, index);
      if (minusNumeric === null) {
        tokens.push({
          type: "delim",
          value: code,
        });
      } else {
        const [lastIndex, tokenTuple] = minusNumeric;
        if (tokenTuple[0] === "dimension") {
          tokens.push({
            type: "dimension",
            value: tokenTuple[1],
            unit: tokenTuple[2].toLowerCase(),
            flag: "number",
          });
        } else if (tokenTuple[0] === "number") {
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
      tokens.push({ type: "colon" });
    } else if (code === 0x00_3b) {
      tokens.push({ type: "semicolon" });
    } else if (code === 0x00_3c) {
      // if CDO
      if (index + 3 < codepoints.length) {
        const nextCode = codepoints.at(index + 1);
        const nextNextCode = codepoints.at(index + 2);
        const nextNextNextCode = codepoints.at(index + 3);
        if (nextCode === 0x00_21 && nextNextCode === 0x00_2d && nextNextNextCode === 0x00_2d) {
          tokens.push({
            type: "CDO",
          });
          index += 3;
          continue;
        }
      }

      tokens.push({
        type: "delim",
        value: code,
      });
    } else if (code === 0x00_40) {
      // if at keyword
      const result = consumeIdent(codepoints, index + 1);
      if (result !== null) {
        const [lastIndex, value] = result;
        tokens.push({
          type: "at-keyword",
          value: value.toLowerCase(),
        });
        index = lastIndex;
        continue;
      }

      tokens.push({ type: "delim", value: code });
    } else if (code === 0x00_5b) {
      tokens.push({ type: "[" });
    } else if (code === 0x00_5d) {
      tokens.push({ type: "]" });
    } else if (code === 0x00_7b) {
      tokens.push({ type: "{" });
    } else if (code === 0x00_7d) {
      tokens.push({ type: "}" });
    } else if (code >= 0x00_30 && code <= 0x00_39) {
      const result = consumeNumeric(codepoints, index) as NonNullable<
        ReturnType<typeof consumeNumeric>
      >;
      const [lastIndex, tokenTuple] = result;
      if (tokenTuple[0] === "dimension") {
        tokens.push({
          type: "dimension",
          value: tokenTuple[1],
          unit: tokenTuple[2].toLowerCase(),
          flag: "number",
        });
      } else if (tokenTuple[0] === "number") {
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
      code >= 0x00_80 ||
      code === 0x00_5c
    ) {
      const nextCode = codepoints.at(index + 1);
      if (code === 0x00_5c && (nextCode === undefined || nextCode === 0x0a)) {
        tokens.push({ type: "delim", value: code });
      } else {
        const result = consumeIdentLike(codepoints, index);
        if (result === null) {
          return null;
        }
        const [lastIndex, value, type] = result;
        tokens.push({
          type,
          value,
        });
        index = lastIndex;
      }
    } else {
      tokens.push({ type: "delim", value: code });
    }
  }
  tokens.push({ type: "EOF" });
  return tokens;
};

export const consumeString = (codepoints: number[], index: number): [number, string] | null => {
  if (codepoints.length <= index + 1) return null;
  const firstCode = codepoints.at(index);
  const stringCodepoints: number[] = [];
  for (let i = index + 1; i < codepoints.length; i += 1) {
    const codepoint = codepoints.at(i) as number;
    if (codepoint === firstCode) {
      // " end string
      return [i, String.fromCodePoint.apply(null, stringCodepoints)];
    } else if (codepoint === 0x00_5c) {
      // \ escape mode
      const result = consumeEscape(codepoints, i);
      if (result === null) return null;
      const [lastIndex, charCode] = result;
      stringCodepoints.push(charCode);
      i = lastIndex;
    } else if (codepoint === 0x00_0a) {
      // \n
      return null;
    } else {
      stringCodepoints.push(codepoint);
    }
  }

  return null;
};

export const wouldStartIdentifier = (codepoints: number[], index: number): boolean => {
  const codepoint = codepoints.at(index);
  if (codepoint === undefined) return false;
  if (codepoint === 0x00_2d) {
    const nextCodepoint = codepoints.at(index + 1);
    if (nextCodepoint === undefined) return false;
    if (
      nextCodepoint === 0x00_2d ||
      nextCodepoint === 0x00_5f ||
      (nextCodepoint >= 0x00_41 && nextCodepoint <= 0x00_5a) ||
      (nextCodepoint >= 0x00_61 && nextCodepoint <= 0x00_7a) ||
      nextCodepoint >= 0x00_80
    ) {
      return true;
    } else if (nextCodepoint === 0x00_5c) {
      if (codepoints.length <= index + 2) return false;
      const nextNextCode = codepoints.at(index + 2);
      return nextNextCode !== 0x00_0a;
    } else {
      return false;
    }
  } else if (
    // identifier-start code point
    codepoint === 0x00_5f ||
    (codepoint >= 0x00_41 && codepoint <= 0x00_5a) ||
    (codepoint >= 0x00_61 && codepoint <= 0x00_7a) ||
    codepoint >= 0x00_80
  ) {
    return true;
  } else if (codepoint === 0x00_5c) {
    // \
    if (codepoints.length <= index + 1) return false;
    const nextCode = codepoints.at(index + 1);
    return nextCode !== 0x00_0a;
  } else {
    return false;
  }
};

export const consumeEscape = (codepoints: number[], index: number): [number, number] | null => {
  if (codepoints.length <= index + 1) return null;
  if (codepoints.at(index) !== 0x00_5c) return null;

  const code = codepoints.at(index + 1) as number;
  if (code === 0x00_0a) {
    return null;
  } else if (
    (code >= 0x00_30 && code <= 0x00_39) ||
    (code >= 0x00_41 && code <= 0x00_46) ||
    (code >= 0x00_61 && code <= 0x00_66)
  ) {
    const hexCharCodes: number[] = [code];
    const min = Math.min(index + 7, codepoints.length);
    let i = index + 2;
    for (; i < min; i += 1) {
      const code = codepoints.at(i) as number;
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
    if (i < codepoints.length) {
      const code = codepoints.at(i);
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
  codepoints: number[],
  index: number
):
  | [
      number,
      (
        | ["number", number, "number" | "integer"]
        | ["percentage", number]
        | ["dimension", number, string]
      )
    ]
  | null => {
  const numberResult = consumeNumber(codepoints, index);
  if (numberResult === null) return null;
  const [numberEndIndex, numberValue, numberFlag] = numberResult;

  const identResult = consumeIdent(codepoints, numberEndIndex + 1);
  if (identResult !== null) {
    const [identEndIndex, identValue] = identResult;
    return [identEndIndex, ["dimension", numberValue, identValue]];
  }

  if (numberEndIndex + 1 < codepoints.length && codepoints.at(numberEndIndex + 1) === 0x00_25) {
    return [numberEndIndex + 1, ["percentage", numberValue]];
  }

  return [numberEndIndex, ["number", numberValue, numberFlag]];
};

export const consumeNumber = (
  codepoints: number[],
  index: number
): [number, number, "integer" | "number"] | null => {
  const firstCode = codepoints.at(index);
  if (firstCode === undefined) return null;

  let flag: "integer" | "number" = "integer";

  const numberChars: number[] = [];
  if (firstCode === 0x00_2b || firstCode === 0x00_2d) {
    index += 1;
    if (firstCode === 0x00_2d) numberChars.push(0x00_2d);
  }
  while (index < codepoints.length) {
    const code = codepoints.at(index) as number;
    if (code >= 0x00_30 && code <= 0x00_39) {
      numberChars.push(code);
      index += 1;
    } else {
      break;
    }
  }

  if (index + 1 < codepoints.length) {
    const nextCode = codepoints.at(index) as number;
    const nextNextCode = codepoints.at(index + 1) as number;

    if (nextCode === 0x00_2e && nextNextCode >= 0x00_30 && nextNextCode <= 0x00_39) {
      numberChars.push(nextCode, nextNextCode);
      flag = "number";
      index += 2;

      while (index < codepoints.length) {
        const code = codepoints.at(index) as number;
        if (code >= 0x00_30 && code <= 0x00_39) {
          numberChars.push(code);
          index += 1;
        } else {
          break;
        }
      }
    }
  }

  if (index + 1 < codepoints.length) {
    const nextCode = codepoints.at(index) as number;
    const nextNextCode = codepoints.at(index + 1) as number;
    const nextNextNextCode = codepoints.at(index + 2);

    // e or E
    if (nextCode === 0x00_45 || nextCode === 0x00_65) {
      const nextNextIsDigit = nextNextCode >= 0x00_30 && nextNextCode <= 0x00_39;

      let isValidExponent = false;
      if (nextNextIsDigit) {
        numberChars.push(0x00_45, nextNextCode);
        index += 2;
        isValidExponent = true;
      } else if (
        (nextNextCode === 0x00_2d || nextNextCode === 0x00_2b) &&
        nextNextNextCode !== undefined &&
        nextNextNextCode >= 0x00_30 &&
        nextNextNextCode <= 0x00_39
      ) {
        numberChars.push(0x00_45);
        if (nextNextCode === 0x00_2d) numberChars.push(0x00_2d);
        numberChars.push(nextNextNextCode);
        index += 3;
        isValidExponent = true;
      }

      if (isValidExponent) {
        flag = "number";
        while (index < codepoints.length) {
          const code = codepoints.at(index) as number;
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
export const consumeIdentUnsafe = (
  codepoints: number[],
  index: number
): [number, string] | null => {
  if (codepoints.length <= index) {
    return null;
  }

  const identChars: number[] = [];
  for (
    let code = codepoints.at(index) as number;
    index < codepoints.length;
    code = codepoints.at(++index) as number
  ) {
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
      const result = consumeEscape(codepoints, index);
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

export const consumeIdent = (codepoints: number[], index: number): [number, string] | null => {
  if (codepoints.length <= index || !wouldStartIdentifier(codepoints, index)) {
    return null;
  }

  const identChars: number[] = [];
  for (
    let code = codepoints.at(index) as number;
    index < codepoints.length;
    code = codepoints.at(++index) as number
  ) {
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
      const result = consumeEscape(codepoints, index);
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

export const consumeUrl = (codepoints: number[], index: number): [number, string] | null => {
  let codepoint = codepoints.at(index);
  while (codepoint === 0x00_09 || codepoint === 0x00_20 || codepoint === 0x00_0a) {
    codepoint = codepoints.at(++index);
  }

  const urlChars: number[] = [];
  let hasFinishedWord = false;
  while (index < codepoints.length) {
    if (codepoint === 0x00_29) {
      return [index, String.fromCharCode.apply(null, urlChars)];
    } else if (codepoint === 0x00_22 || codepoint === 0x00_27 || codepoint === 0x00_28) {
      return null;
    } else if (codepoint === 0x00_09 || codepoint === 0x00_20 || codepoint === 0x00_0a) {
      if (!hasFinishedWord && urlChars.length > 0) hasFinishedWord = true;
    } else if (codepoint === 0x00_5c) {
      const result = consumeEscape(codepoints, index);
      if (result === null || hasFinishedWord) return null;
      const [lastIndex, value] = result;
      urlChars.push(value);
      index = lastIndex;
    } else {
      if (hasFinishedWord) return null;
      urlChars.push(codepoint as number);
    }
    codepoint = codepoints.at(++index);
  }
  return null;
};

export const consumeIdentLike = (
  codepoints: number[],
  index: number
): [number, string, "ident" | "function" | "url"] | null => {
  const result = consumeIdent(codepoints, index);
  if (result === null) return null;

  const [lastIndex, value] = result;
  if (value.toLowerCase() === "url") {
    if (codepoints.length > lastIndex + 1) {
      const nextCode = codepoints.at(lastIndex + 1);
      if (nextCode === 0x00_28) {
        for (let offset = 2; lastIndex + offset < codepoints.length; offset += 1) {
          const nextNextCode = codepoints.at(lastIndex + offset);
          if (nextNextCode === 0x00_22 || nextNextCode === 0x00_27) {
            return [lastIndex + 1, value.toLowerCase(), "function"];
          } else if (
            nextNextCode !== 0x00_09 &&
            nextNextCode !== 0x00_20 &&
            nextNextCode !== 0x00_0a
          ) {
            const result = consumeUrl(codepoints, lastIndex + offset);
            if (result === null) return null;
            const [lastUrlIndex, value] = result;
            return [lastUrlIndex, value, "url"];
          }
        }
        return [lastIndex + 1, value.toLowerCase(), "function"];
      }
    }
  } else if (codepoints.length > lastIndex + 1) {
    const nextCode = codepoints.at(lastIndex + 1);
    if (nextCode === 0x00_28) {
      return [lastIndex + 1, value.toLowerCase(), "function"];
    }
  }

  return [lastIndex, value.toLowerCase(), "ident"];
};
