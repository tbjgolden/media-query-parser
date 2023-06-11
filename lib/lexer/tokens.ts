import { CSSToken, ParserError } from "../shared.js";

const TAB_CODEPOINT = 0x00_09;
const NEWLINE_CODEPOINT = 0x00_0a;
const SPACE_CODEPOINT = 0x00_20;
const EXCLAMATION_CODEPOINT = 0x00_21;
const DOUBLE_QUOTE_CODEPOINT = 0x00_22;
const HASH_CODEPOINT = 0x00_23;
const PERCENTAGE_CODEPOINT = 0x00_25;
const SINGLE_QUOTE_CODEPOINT = 0x00_27;
const LEFT_PAREN_CODEPOINT = 0x00_28;
const RIGHT_PAREN_CODEPOINT = 0x00_29;
const ASTERISK_CODEPOINT = 0x00_2a;
const PLUS_CODEPOINT = 0x00_2b;
const COMMA_CODEPOINT = 0x00_2c;
const HYPHEN_CODEPOINT = 0x00_2d;
const DOT_CODEPOINT = 0x00_2e;
const FORWARD_SLASH_CODEPOINT = 0x00_2f;
const ZERO_CODEPOINT = 0x00_30;
const NINE_CODEPOINT = 0x00_39;
const COLON_CODEPOINT = 0x00_3a;
const SEMICOLON_CODEPOINT = 0x00_3b;
const LEFT_ANGLE_CODEPOINT = 0x00_3c;
const RIGHT_ANGLE_CODEPOINT = 0x00_3e;
const AT_SIGN_CODEPOINT = 0x00_40;
const UPPER_A_CODEPOINT = 0x00_41;
const UPPER_E_CODEPOINT = 0x00_45;
const UPPER_F_CODEPOINT = 0x00_46;
const UPPER_Z_CODEPOINT = 0x00_5a;
const LEFT_SQUARE_CODEPOINT = 0x00_5b;
const BACKSLASH_CODEPOINT = 0x00_5c;
const RIGHT_SQUARE_CODEPOINT = 0x00_5d;
const UNDERSCORE_CODEPOINT = 0x00_5f;
const LOWER_A_CODEPOINT = 0x00_61;
const LOWER_E_CODEPOINT = 0x00_65;
const LOWER_F_CODEPOINT = 0x00_66;
const LOWER_Z_CODEPOINT = 0x00_7a;
const LEFT_CURLY_CODEPOINT = 0x00_7b;
const RIGHT_CURLY_CODEPOINT = 0x00_7d;
const FIRST_NON_ASCII_CODEPOINT = 0x00_80;

export const codepointsToTokens = (codepoints: number[], index = 0): CSSToken[] | ParserError => {
  const tokens: CSSToken[] = [];

  for (; index < codepoints.length; index += 1) {
    const c = codepoints.at(index) as number;
    const start = index;

    if (c === FORWARD_SLASH_CODEPOINT && codepoints.at(index + 1) === ASTERISK_CODEPOINT) {
      index += 2;
      for (let cc = codepoints.at(index); cc !== undefined; cc = codepoints.at(++index)) {
        if (cc === ASTERISK_CODEPOINT && codepoints.at(index + 1) === FORWARD_SLASH_CODEPOINT) {
          index += 1;
          break;
        }
      }
    } else if (c === TAB_CODEPOINT || c === SPACE_CODEPOINT || c === NEWLINE_CODEPOINT) {
      let c = codepoints.at(++index);
      while (c === TAB_CODEPOINT || c === SPACE_CODEPOINT || c === NEWLINE_CODEPOINT) {
        c = codepoints.at(++index);
      }
      index -= 1;

      const prevToken = tokens.at(-1);
      if (prevToken?.type === "whitespace") {
        tokens.pop();
        tokens.push({ type: "whitespace", start: prevToken.start, end: index });
      } else {
        tokens.push({ type: "whitespace", start, end: index });
      }
    } else if (c === DOUBLE_QUOTE_CODEPOINT) {
      const result = consumeString(codepoints, index);
      if (result === null) {
        return { errid: "INVALID_STRING", start: index, end: index };
      }
      const [lastIndex, value] = result;
      index = lastIndex;
      tokens.push({ type: "string", value, start, end: index });
    } else if (c === HASH_CODEPOINT) {
      // if hash
      if (index + 1 < codepoints.length) {
        const cc = codepoints.at(index + 1) as number;

        if (
          cc === UNDERSCORE_CODEPOINT ||
          (cc >= UPPER_A_CODEPOINT && cc <= UPPER_Z_CODEPOINT) ||
          (cc >= LOWER_A_CODEPOINT && cc <= LOWER_Z_CODEPOINT) ||
          cc >= FIRST_NON_ASCII_CODEPOINT ||
          (cc >= ZERO_CODEPOINT && cc <= NINE_CODEPOINT) ||
          (cc === BACKSLASH_CODEPOINT &&
            index + 2 < codepoints.length &&
            codepoints.at(index + 2) !== NEWLINE_CODEPOINT)
        ) {
          const flag: "id" | "unrestricted" = wouldStartIdentifier(codepoints, index + 1)
            ? "id"
            : "unrestricted";

          const result = consumeIdentUnsafe(codepoints, index + 1);
          if (result !== null) {
            const [lastIndex, value] = result;
            index = lastIndex;
            tokens.push({ type: "hash", value: value.toLowerCase(), flag, start, end: index });
            continue;
          }
        }
      }

      tokens.push({ type: "delim", value: c, start, end: index });
    } else if (c === SINGLE_QUOTE_CODEPOINT) {
      const result = consumeString(codepoints, index);
      if (result === null) {
        return { errid: "INVALID_STRING", start: index, end: index };
      }
      const [lastIndex, value] = result;
      index = lastIndex;
      tokens.push({ type: "string", value, start, end: index });
    } else if (c === LEFT_PAREN_CODEPOINT) {
      tokens.push({ type: "(", start, end: index });
    } else if (c === RIGHT_PAREN_CODEPOINT) {
      tokens.push({ type: ")", start, end: index });
    } else if (c === PLUS_CODEPOINT) {
      const plusNumeric = consumeNumeric(codepoints, index);
      if (plusNumeric === null) {
        tokens.push({ type: "delim", value: c, start, end: index });
      } else {
        const [lastIndex, tokenTuple] = plusNumeric;
        index = lastIndex;
        if (tokenTuple[0] === "dimension") {
          tokens.push({
            type: "dimension",
            value: tokenTuple[1],
            unit: tokenTuple[2].toLowerCase(),
            flag: "number",
            start,
            end: index,
          });
        } else if (tokenTuple[0] === "number") {
          tokens.push({
            type: tokenTuple[0],
            value: tokenTuple[1],
            flag: tokenTuple[2],
            start,
            end: index,
          });
        } else {
          tokens.push({
            type: tokenTuple[0],
            value: tokenTuple[1],
            flag: "number",
            start,
            end: index,
          });
        }
      }
    } else if (c === COMMA_CODEPOINT) {
      tokens.push({ type: "comma", start, end: index });
    } else if (c === HYPHEN_CODEPOINT) {
      const minusNumeric = consumeNumeric(codepoints, index);
      if (minusNumeric !== null) {
        const [lastIndex, tokenTuple] = minusNumeric;
        index = lastIndex;
        if (tokenTuple[0] === "dimension") {
          tokens.push({
            type: "dimension",
            value: tokenTuple[1],
            unit: tokenTuple[2].toLowerCase(),
            flag: "number",
            start,
            end: index,
          });
        } else if (tokenTuple[0] === "number") {
          tokens.push({
            type: tokenTuple[0],
            value: tokenTuple[1],
            flag: tokenTuple[2],
            start,
            end: index,
          });
        } else {
          tokens.push({
            type: tokenTuple[0],
            value: tokenTuple[1],
            flag: "number",
            start,
            end: index,
          });
        }
        continue;
      }
      // if CDC
      if (index + 2 < codepoints.length) {
        const cc = codepoints.at(index + 1);
        const ccc = codepoints.at(index + 2);
        if (cc === HYPHEN_CODEPOINT && ccc === RIGHT_ANGLE_CODEPOINT) {
          index += 2;
          tokens.push({ type: "CDC", start, end: index });
          continue;
        }
      }
      // try parse as ident
      const result = consumeIdentLike(codepoints, index);
      if (result !== null) {
        const [lastIndex, value, type] = result;
        index = lastIndex;
        tokens.push({ type, value, start, end: index });
        continue;
      }

      tokens.push({ type: "delim", value: c, start, end: index });
    } else if (c === DOT_CODEPOINT) {
      const minusNumeric = consumeNumeric(codepoints, index);
      if (minusNumeric === null) {
        tokens.push({ type: "delim", value: c, start, end: index });
      } else {
        const [lastIndex, tokenTuple] = minusNumeric;
        index = lastIndex;
        if (tokenTuple[0] === "dimension") {
          tokens.push({
            type: "dimension",
            value: tokenTuple[1],
            unit: tokenTuple[2].toLowerCase(),
            flag: "number",
            start,
            end: index,
          });
        } else if (tokenTuple[0] === "number") {
          tokens.push({
            type: tokenTuple[0],
            value: tokenTuple[1],
            flag: tokenTuple[2],
            start,
            end: index,
          });
        } else {
          tokens.push({
            type: tokenTuple[0],
            value: tokenTuple[1],
            flag: "number",
            start,
            end: index,
          });
        }
        continue;
      }
    } else if (c === COLON_CODEPOINT) {
      tokens.push({ type: "colon", start, end: index });
    } else if (c === SEMICOLON_CODEPOINT) {
      tokens.push({ type: "semicolon", start, end: index });
    } else if (c === LEFT_ANGLE_CODEPOINT) {
      // if CDO
      if (index + 3 < codepoints.length) {
        const cc = codepoints.at(index + 1);
        const ccc = codepoints.at(index + 2);
        const cccc = codepoints.at(index + 3);
        if (cc === EXCLAMATION_CODEPOINT && ccc === HYPHEN_CODEPOINT && cccc === HYPHEN_CODEPOINT) {
          index += 3;
          tokens.push({ type: "CDO", start, end: index });
          continue;
        }
      }

      tokens.push({ type: "delim", value: c, start, end: index });
    } else if (c === AT_SIGN_CODEPOINT) {
      // if at keyword
      const result = consumeIdent(codepoints, index + 1);
      if (result !== null) {
        const [lastIndex, value] = result;
        index = lastIndex;
        tokens.push({
          type: "at-keyword",
          value: value.toLowerCase(),
          start,
          end: index,
        });
        continue;
      }

      tokens.push({ type: "delim", value: c, start, end: index });
    } else if (c === LEFT_SQUARE_CODEPOINT) {
      tokens.push({ type: "[", start, end: index });
    } else if (c === RIGHT_SQUARE_CODEPOINT) {
      tokens.push({ type: "]", start, end: index });
    } else if (c === LEFT_CURLY_CODEPOINT) {
      tokens.push({ type: "{", start, end: index });
    } else if (c === RIGHT_CURLY_CODEPOINT) {
      tokens.push({ type: "}", start, end: index });
    } else if (c >= ZERO_CODEPOINT && c <= NINE_CODEPOINT) {
      const result = consumeNumeric(codepoints, index) as NonNullable<
        ReturnType<typeof consumeNumeric>
      >;
      const [lastIndex, tokenTuple] = result;
      index = lastIndex;
      if (tokenTuple[0] === "dimension") {
        tokens.push({
          type: "dimension",
          value: tokenTuple[1],
          unit: tokenTuple[2].toLowerCase(),
          flag: "number",
          start,
          end: index,
        });
      } else if (tokenTuple[0] === "number") {
        tokens.push({
          type: tokenTuple[0],
          value: tokenTuple[1],
          flag: tokenTuple[2],
          start,
          end: index,
        });
      } else {
        tokens.push({
          type: tokenTuple[0],
          value: tokenTuple[1],
          flag: "number",
          start,
          end: index,
        });
      }
    } else if (
      c === UNDERSCORE_CODEPOINT ||
      (c >= UPPER_A_CODEPOINT && c <= UPPER_Z_CODEPOINT) ||
      (c >= LOWER_A_CODEPOINT && c <= LOWER_Z_CODEPOINT) ||
      c >= FIRST_NON_ASCII_CODEPOINT ||
      c === BACKSLASH_CODEPOINT
    ) {
      const cc = codepoints.at(index + 1);
      if (c === BACKSLASH_CODEPOINT && (cc === undefined || cc === NEWLINE_CODEPOINT)) {
        tokens.push({ type: "delim", value: c, start, end: index });
      } else {
        const result = consumeIdentLike(codepoints, index);
        if (result === null) {
          tokens.push({ type: "delim", value: c, start, end: index });
        } else {
          const [lastIndex, value, type] = result;
          index = lastIndex;
          tokens.push({ type, value, start, end: index });
        }
      }
    } else {
      tokens.push({ type: "delim", value: c, start, end: index });
    }
  }
  tokens.push({ type: "EOF", start: index, end: index });
  return tokens;
};

export const consumeString = (codepoints: number[], index: number): [number, string] | null => {
  if (codepoints.length <= index + 1) return null;
  const c = codepoints.at(index);
  const stringCodepoints: number[] = [];
  for (let i = index + 1; i < codepoints.length; i += 1) {
    const codepoint = codepoints.at(i) as number;
    if (codepoint === c) {
      // " end string
      return [i, String.fromCodePoint(...stringCodepoints)];
    } else if (codepoint === BACKSLASH_CODEPOINT) {
      // \ escape mode
      const result = consumeEscape(codepoints, i);
      if (result === null) return null;
      const [lastIndex, cc] = result;
      stringCodepoints.push(cc);
      i = lastIndex;
    } else if (codepoint === NEWLINE_CODEPOINT) {
      // \n
      return null;
    } else {
      stringCodepoints.push(codepoint);
    }
  }

  return null;
};

export const wouldStartIdentifier = (codepoints: number[], index: number): boolean => {
  const c = codepoints.at(index);
  if (c === undefined) return false;
  if (c === HYPHEN_CODEPOINT) {
    const cc = codepoints.at(index + 1);
    if (cc === undefined) return false;
    if (
      cc === HYPHEN_CODEPOINT ||
      cc === UNDERSCORE_CODEPOINT ||
      (cc >= UPPER_A_CODEPOINT && cc <= UPPER_Z_CODEPOINT) ||
      (cc >= LOWER_A_CODEPOINT && cc <= LOWER_Z_CODEPOINT) ||
      cc >= FIRST_NON_ASCII_CODEPOINT
    ) {
      return true;
    } else if (cc === BACKSLASH_CODEPOINT) {
      if (codepoints.length <= index + 2) return false;
      const ccc = codepoints.at(index + 2);
      return ccc !== NEWLINE_CODEPOINT;
    } else {
      return false;
    }
  } else if (
    // identifier-start code point
    c === UNDERSCORE_CODEPOINT ||
    (c >= UPPER_A_CODEPOINT && c <= UPPER_Z_CODEPOINT) ||
    (c >= LOWER_A_CODEPOINT && c <= LOWER_Z_CODEPOINT) ||
    c >= FIRST_NON_ASCII_CODEPOINT
  ) {
    return true;
  } else if (c === BACKSLASH_CODEPOINT) {
    // \
    if (codepoints.length <= index + 1) return false;
    const cc = codepoints.at(index + 1);
    return cc !== NEWLINE_CODEPOINT;
  } else {
    return false;
  }
};

export const consumeEscape = (codepoints: number[], index: number): [number, number] | null => {
  if (codepoints.length <= index + 1) return null;
  if (codepoints.at(index) !== BACKSLASH_CODEPOINT) return null;

  const cc = codepoints.at(index + 1) as number;
  if (cc === NEWLINE_CODEPOINT) {
    return null;
  } else if (
    (cc >= ZERO_CODEPOINT && cc <= NINE_CODEPOINT) ||
    (cc >= UPPER_A_CODEPOINT && cc <= UPPER_F_CODEPOINT) ||
    (cc >= LOWER_A_CODEPOINT && cc <= LOWER_F_CODEPOINT)
  ) {
    const hexCharCodes: number[] = [cc];
    const min = Math.min(index + 7, codepoints.length);
    let i = index + 2;
    for (; i < min; i += 1) {
      const ccc = codepoints.at(i) as number;
      if (
        (ccc >= ZERO_CODEPOINT && ccc <= NINE_CODEPOINT) ||
        (ccc >= UPPER_A_CODEPOINT && ccc <= UPPER_F_CODEPOINT) ||
        (ccc >= LOWER_A_CODEPOINT && ccc <= LOWER_F_CODEPOINT)
      ) {
        hexCharCodes.push(ccc);
      } else {
        break;
      }
    }
    if (i < codepoints.length) {
      const cccc = codepoints.at(i);
      if (cccc === TAB_CODEPOINT || cccc === SPACE_CODEPOINT || cccc === NEWLINE_CODEPOINT) {
        i += 1;
      }
    }
    return [i - 1, Number.parseInt(String.fromCodePoint(...hexCharCodes), 16)];
  } else {
    return [index + 1, cc];
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

  if (
    numberEndIndex + 1 < codepoints.length &&
    codepoints.at(numberEndIndex + 1) === PERCENTAGE_CODEPOINT
  ) {
    return [numberEndIndex + 1, ["percentage", numberValue]];
  }

  return [numberEndIndex, ["number", numberValue, numberFlag]];
};

export const consumeNumber = (
  codepoints: number[],
  index: number
): [number, number, "integer" | "number"] | null => {
  const c = codepoints.at(index);
  if (c === undefined) return null;

  let flag: "integer" | "number" = "integer";

  const numberChars: number[] = [];
  if (c === PLUS_CODEPOINT || c === HYPHEN_CODEPOINT) {
    index += 1;
    if (c === HYPHEN_CODEPOINT) numberChars.push(HYPHEN_CODEPOINT);
  }
  while (index < codepoints.length) {
    const cc = codepoints.at(index) as number;
    if (cc >= ZERO_CODEPOINT && cc <= NINE_CODEPOINT) {
      numberChars.push(cc);
      index += 1;
    } else {
      break;
    }
  }

  if (index + 1 < codepoints.length) {
    const cc = codepoints.at(index) as number;
    const ccc = codepoints.at(index + 1) as number;

    if (cc === DOT_CODEPOINT && ccc >= ZERO_CODEPOINT && ccc <= NINE_CODEPOINT) {
      numberChars.push(cc, ccc);
      flag = "number";
      index += 2;

      while (index < codepoints.length) {
        const cccc = codepoints.at(index) as number;
        if (cccc >= ZERO_CODEPOINT && cccc <= NINE_CODEPOINT) {
          numberChars.push(cccc);
          index += 1;
        } else {
          break;
        }
      }
    }
  }

  if (index + 1 < codepoints.length) {
    const cc = codepoints.at(index) as number;
    const ccc = codepoints.at(index + 1) as number;
    const cccc = codepoints.at(index + 2);

    // e or E
    if (cc === UPPER_E_CODEPOINT || cc === LOWER_E_CODEPOINT) {
      const nextNextIsDigit = ccc >= ZERO_CODEPOINT && ccc <= NINE_CODEPOINT;

      let isValidExponent = false;
      if (nextNextIsDigit) {
        numberChars.push(UPPER_E_CODEPOINT, ccc);
        index += 2;
        isValidExponent = true;
      } else if (
        (ccc === HYPHEN_CODEPOINT || ccc === PLUS_CODEPOINT) &&
        cccc !== undefined &&
        cccc >= ZERO_CODEPOINT &&
        cccc <= NINE_CODEPOINT
      ) {
        numberChars.push(UPPER_E_CODEPOINT);
        if (ccc === HYPHEN_CODEPOINT) numberChars.push(HYPHEN_CODEPOINT);
        numberChars.push(cccc);
        index += 3;
        isValidExponent = true;
      }

      if (isValidExponent) {
        flag = "number";
        while (index < codepoints.length) {
          const ccccc = codepoints.at(index) as number;
          if (ccccc >= ZERO_CODEPOINT && ccccc <= NINE_CODEPOINT) {
            numberChars.push(ccccc);
            index += 1;
          } else {
            break;
          }
        }
      }
    }
  }

  const numberString = String.fromCodePoint(...numberChars);
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
    let c = codepoints.at(index) as number;
    index < codepoints.length;
    c = codepoints.at(++index) as number
  ) {
    if (
      c === HYPHEN_CODEPOINT ||
      c === UNDERSCORE_CODEPOINT ||
      (c >= UPPER_A_CODEPOINT && c <= UPPER_Z_CODEPOINT) ||
      (c >= LOWER_A_CODEPOINT && c <= LOWER_Z_CODEPOINT) ||
      c >= FIRST_NON_ASCII_CODEPOINT ||
      (c >= ZERO_CODEPOINT && c <= NINE_CODEPOINT)
    ) {
      identChars.push(c);
      continue;
    } else {
      const result = consumeEscape(codepoints, index);
      if (result !== null) {
        const [lastIndex, cc] = result;
        identChars.push(cc);
        index = lastIndex;
        continue;
      }
    }
    break;
  }

  return index === 0 ? null : [index - 1, String.fromCodePoint(...identChars)];
};

export const consumeIdent = (codepoints: number[], index: number): [number, string] | null => {
  if (codepoints.length <= index || !wouldStartIdentifier(codepoints, index)) {
    return null;
  }

  const identChars: number[] = [];
  for (
    let c = codepoints.at(index) as number;
    index < codepoints.length;
    c = codepoints.at(++index) as number
  ) {
    if (
      c === HYPHEN_CODEPOINT ||
      c === UNDERSCORE_CODEPOINT ||
      (c >= UPPER_A_CODEPOINT && c <= UPPER_Z_CODEPOINT) ||
      (c >= LOWER_A_CODEPOINT && c <= LOWER_Z_CODEPOINT) ||
      c >= FIRST_NON_ASCII_CODEPOINT ||
      (c >= ZERO_CODEPOINT && c <= NINE_CODEPOINT)
    ) {
      identChars.push(c);
      continue;
    } else {
      const result = consumeEscape(codepoints, index);
      if (result !== null) {
        const [lastIndex, cc] = result;
        identChars.push(cc);
        index = lastIndex;
        continue;
      }
    }
    break;
  }

  return [index - 1, String.fromCodePoint(...identChars)];
};

export const consumeUrl = (codepoints: number[], index: number): [number, string] | null => {
  let codepoint = codepoints.at(index);
  while (
    codepoint === TAB_CODEPOINT ||
    codepoint === SPACE_CODEPOINT ||
    codepoint === NEWLINE_CODEPOINT
  ) {
    codepoint = codepoints.at(++index);
  }

  const urlChars: number[] = [];
  let hasFinishedWord = false;
  while (index < codepoints.length) {
    if (codepoint === RIGHT_PAREN_CODEPOINT) {
      return [index, String.fromCodePoint(...urlChars)];
    } else if (
      codepoint === DOUBLE_QUOTE_CODEPOINT ||
      codepoint === SINGLE_QUOTE_CODEPOINT ||
      codepoint === LEFT_PAREN_CODEPOINT
    ) {
      return null;
    } else if (
      codepoint === TAB_CODEPOINT ||
      codepoint === SPACE_CODEPOINT ||
      codepoint === NEWLINE_CODEPOINT
    ) {
      if (!hasFinishedWord && urlChars.length > 0) hasFinishedWord = true;
    } else if (codepoint === BACKSLASH_CODEPOINT) {
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
      const cc = codepoints.at(lastIndex + 1);
      if (cc === LEFT_PAREN_CODEPOINT) {
        for (let offset = 2; lastIndex + offset < codepoints.length; offset += 1) {
          const ccc = codepoints.at(lastIndex + offset);
          if (ccc === DOUBLE_QUOTE_CODEPOINT || ccc === SINGLE_QUOTE_CODEPOINT) {
            return [lastIndex + 1, value.toLowerCase(), "function"];
          } else if (
            ccc !== TAB_CODEPOINT &&
            ccc !== SPACE_CODEPOINT &&
            ccc !== NEWLINE_CODEPOINT
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
    const cc = codepoints.at(lastIndex + 1);
    if (cc === LEFT_PAREN_CODEPOINT) {
      return [lastIndex + 1, value.toLowerCase(), "function"];
    }
  }

  return [lastIndex, value.toLowerCase(), "ident"];
};
