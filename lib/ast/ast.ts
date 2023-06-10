import type { Token } from "../lexer/types.js";
import type {
  MediaCondition,
  MediaFeature,
  MediaQuery,
  MediaQueryList,
  ParsingError,
  ParsingToken,
  RatioToken,
  ValidRangeToken,
} from "./types.js";

type ConvenientToken =
  | ParsingToken
  | (RatioToken & { hasSpaceBefore: boolean; hasSpaceAfter: boolean; start: number; end: number });

type UncheckedRange = {
  leftToken?: ConvenientToken | undefined;
  leftOp?: ">=" | "<=" | ">" | "<" | "=" | undefined;
  featureName: string;
  rightOp?: ">=" | "<=" | ">" | "<" | "=" | undefined;
  rightToken?: ConvenientToken | undefined;
};

export const isParsingError = (value: unknown): value is ParsingError => {
  return typeof value === "object" && value !== null && "errid" in value;
};

const createError = (message: string): ParsingError => {
  return {
    errid: message as ParsingError["errid"],
    start: -1,
    end: -1,
  };
};

export const convertToParsingTokens = (tokenList: Token[]): ParsingToken[] => {
  const normalTokens: ParsingToken[] = [];

  let hasSpaceBefore = false;
  for (const element of tokenList) {
    if (element.type === "whitespace") {
      hasSpaceBefore = true;
      if (normalTokens.length > 0) {
        normalTokens[normalTokens.length - 1].hasSpaceAfter = true;
      }
    } else if (element.type !== "EOF") {
      normalTokens.push({
        ...element,
        hasSpaceBefore,
        hasSpaceAfter: false,
      });
      hasSpaceBefore = false;
    }
  }

  return normalTokens;
};

export const parseMediaQueryList = (tokens: ParsingToken[]): MediaQueryList => {
  const mediaQueriesParsingTokens: ParsingToken[][] = [[]];
  for (const token of tokens) {
    if (token.type === "comma") {
      mediaQueriesParsingTokens.push([]);
    } else {
      mediaQueriesParsingTokens[mediaQueriesParsingTokens.length - 1].push(token);
    }
  }

  if (mediaQueriesParsingTokens.length === 1 && mediaQueriesParsingTokens[0].length === 0) {
    // '@media {' is fine, treat as all
    return { type: "query-list", mediaQueries: [{ type: "query", mediaType: "all" }] };
  } else {
    const mediaQueries: MediaQuery[] = [];
    for (const mediaQueryParsingTokens of mediaQueriesParsingTokens) {
      const mediaQuery = parseMediaQuery(mediaQueryParsingTokens);
      // note: a media query list can contain an invalid media query
      if (!isParsingError(mediaQuery)) {
        mediaQueries.push(mediaQuery);
      }
    }
    return { type: "query-list", mediaQueries };
  }
};

export const parseMediaQuery = (tokens: ParsingToken[]): MediaQuery | ParsingError => {
  const firstToken = tokens.at(0);
  if (firstToken) {
    if (firstToken.type === "(") {
      const mediaCondition = parseMediaCondition(tokens, true);
      return isParsingError(mediaCondition)
        ? createError("Expected media condition after '('")
        : { type: "query", mediaType: "all", mediaCondition };
    } else if (firstToken.type === "ident") {
      let mediaPrefix: "not" | "only" | undefined;
      let mediaType: "all" | "print" | "screen";

      const { value } = firstToken;
      if (value === "only" || value === "not") {
        mediaPrefix = value;
      }

      const firstIndex = mediaPrefix === undefined ? 0 : 1;

      if (tokens.length <= firstIndex) {
        return createError(`Expected extra token in media query`);
      }

      // eslint-disable-next-line security/detect-object-injection
      const firstNonUnaryToken = tokens[firstIndex];

      if (firstNonUnaryToken.type === "ident") {
        const { value } = firstNonUnaryToken;

        if (value === "all") {
          mediaType = "all";
        } else if (value === "print" || value === "screen") {
          mediaType = value;
        } else if (
          value === "tty" ||
          value === "tv" ||
          value === "projection" ||
          value === "handheld" ||
          value === "braille" ||
          value === "embossed" ||
          value === "aural" ||
          value === "speech"
        ) {
          // these are treated as equivalent to 'not all'
          mediaPrefix = mediaPrefix === "not" ? undefined : "not";
          mediaType = "all";
        } else {
          return createError(`Unknown ident '${value}' in media query`);
        }
      } else if (mediaPrefix === "not" && firstNonUnaryToken.type === "(") {
        const mediaCondition = parseMediaCondition(tokens.slice(firstIndex), true);

        if (isParsingError(mediaCondition)) {
          return createError("Expected media condition after '('");
        } else {
          return {
            type: "query",
            mediaType: "all",
            mediaCondition: { type: "condition", operator: "not", children: [mediaCondition] },
          };
        }
      } else {
        return createError("Invalid media query");
      }

      if (firstIndex + 1 === tokens.length) {
        return { type: "query", mediaPrefix, mediaType };
      } else if (firstIndex + 4 < tokens.length) {
        const secondNonUnaryToken = tokens[firstIndex + 1];
        if (secondNonUnaryToken.type === "ident" && secondNonUnaryToken.value === "and") {
          const mediaCondition = parseMediaCondition(tokens.slice(firstIndex + 2), false);

          return isParsingError(mediaCondition)
            ? createError("Expected media condition after 'and'")
            : { type: "query", mediaPrefix, mediaType, mediaCondition };
        } else {
          return createError("Expected 'and' after media prefix");
        }
      } else {
        return createError("Expected media condition after media prefix");
      }
    } else {
      return createError("Expected media condition or media prefix");
    }
  } else {
    return createError("Empty media query");
  }
};

export const parseMediaCondition = (
  tokens: ParsingToken[],
  mayContainOr: boolean,
  previousOperator?: "and" | "or" | "not" | undefined
): MediaCondition | ParsingError => {
  if (tokens.length < 3 || tokens[0].type !== "(" || tokens[tokens.length - 1].type !== ")") {
    return createError("Invalid media condition");
  }

  let endIndexOfFirstFeature = tokens.length - 1;
  let maxDepth = 0;
  let count = 0;
  for (const [i, token] of tokens.entries()) {
    if (token.type === "(") {
      count += 1;
      maxDepth = Math.max(maxDepth, count);
    } else if (token.type === ")") {
      count -= 1;
    }
    if (count === 0) {
      endIndexOfFirstFeature = i;
      break;
    }
  }

  if (count !== 0) {
    return createError("Mismatched parens\nInvalid media condition");
  }

  let child: MediaCondition | MediaFeature | ParsingError;
  const featureTokens = tokens.slice(0, endIndexOfFirstFeature + 1);
  if (maxDepth === 1) {
    child = parseMediaFeature(featureTokens);
  } else {
    child =
      featureTokens[1].type === "ident" && featureTokens[1].value === "not"
        ? parseMediaCondition(featureTokens.slice(2, -1), true, "not")
        : parseMediaCondition(featureTokens.slice(1, -1), true);
  }

  if (isParsingError(child)) {
    return child;
  }

  if (endIndexOfFirstFeature === tokens.length - 1) {
    return { type: "condition", operator: previousOperator, children: [child] };
  } else {
    // read for a boolean op "and", "not", "or"
    const nextToken = tokens[endIndexOfFirstFeature + 1];
    if (nextToken.type !== "ident") {
      return createError("Invalid operator\nInvalid media condition");
    } else if (previousOperator !== undefined && previousOperator !== nextToken.value) {
      return createError(
        `'${nextToken.value}' and '${previousOperator}' must not be at same level\nInvalid media condition`
      );
    } else if (nextToken.value === "or" && !mayContainOr) {
      return createError("Cannot use 'or' at top level of a media query\nInvalid media condition");
    } else if (nextToken.value !== "and" && nextToken.value !== "or") {
      return createError(`Invalid operator: '${nextToken.value}'\nInvalid media condition`);
    }

    const mediaCondition = parseMediaCondition(
      tokens.slice(endIndexOfFirstFeature + 2),
      mayContainOr,
      nextToken.value
    );

    return isParsingError(mediaCondition)
      ? mediaCondition
      : {
          type: "condition",
          operator: nextToken.value,
          children: [child, ...mediaCondition.children],
        };
  }
};

export const parseMediaFeature = (rawTokens: ParsingToken[]): MediaFeature | ParsingError => {
  if (
    rawTokens.length < 3 ||
    rawTokens[0].type !== "(" ||
    rawTokens[rawTokens.length - 1].type !== ")"
  ) {
    return createError("Invalid media feature");
  }

  const tokens: ConvenientToken[] = [rawTokens[0]];

  for (let i = 1; i < rawTokens.length; i++) {
    if (i < rawTokens.length - 2) {
      // eslint-disable-next-line security/detect-object-injection
      const a = rawTokens[i];
      const b = rawTokens[i + 1];
      const c = rawTokens[i + 2];
      if (
        a.type === "number" &&
        a.value > 0 &&
        b.type === "delim" &&
        b.value === 0x002f &&
        c.type === "number" &&
        c.value > 0
      ) {
        tokens.push({
          type: "ratio",
          numerator: a.value,
          denominator: c.value,
          hasSpaceBefore: a.hasSpaceBefore,
          hasSpaceAfter: c.hasSpaceAfter,
          start: a.start,
          end: c.end,
        });
        i += 2;
        continue;
      }
    }
    // eslint-disable-next-line security/detect-object-injection
    tokens.push(rawTokens[i]);
  }

  const nextToken = tokens[1];
  if (nextToken.type === "ident" && tokens.length === 3) {
    return { type: "feature", context: "boolean", feature: nextToken.value };
  } else if (tokens.length === 5 && tokens[1].type === "ident" && tokens[2].type === "colon") {
    const valueToken = tokens[3];
    if (
      valueToken.type === "number" ||
      valueToken.type === "dimension" ||
      valueToken.type === "ratio" ||
      valueToken.type === "ident"
    ) {
      let feature = tokens[1].value;

      let prefix: "min" | "max" | undefined;

      const slice = feature.slice(0, 4);
      if (slice === "min-") {
        prefix = "min";
        feature = feature.slice(4);
      } else if (slice === "max-") {
        prefix = "max";
        feature = feature.slice(4);
      }

      const { hasSpaceBefore: _0, hasSpaceAfter: _1, start: _2, end: _3, ...value } = valueToken;

      return { type: "feature", context: "value", prefix, feature, value };
    }
  } else if (tokens.length >= 5) {
    const range = parseRange(tokens);
    return isParsingError(range)
      ? createError("Invalid media feature")
      : { type: "feature", context: "range", feature: range.featureName, range };
  }

  return createError("Invalid media feature");
};

export type ValidRange =
  | {
      leftToken: ValidRangeToken;
      leftOp: "<" | "<=";
      featureName: string;
      rightOp: "<" | "<=";
      rightToken: ValidRangeToken;
    }
  | {
      leftToken: ValidRangeToken;
      leftOp: ">" | ">=";
      featureName: string;
      rightOp: ">" | ">=";
      rightToken: ValidRangeToken;
    }
  | {
      leftToken: ValidRangeToken;
      leftOp: ">" | ">=" | "<" | "<=" | "=";
      featureName: string;
    }
  | {
      featureName: string;
      rightOp: ">" | ">=" | "<" | "<=" | "=";
      rightToken: ValidRangeToken;
    };

export const parseRange = (tokens: ConvenientToken[]): ValidRange | ParsingError => {
  if (tokens.length < 5 || tokens[0].type !== "(" || tokens[tokens.length - 1].type !== ")") {
    return createError("Invalid range");
  }

  // range form
  const range: UncheckedRange = {
    featureName: "",
  };

  const hasLeft =
    tokens[1].type === "number" ||
    tokens[1].type === "dimension" ||
    tokens[1].type === "ratio" ||
    (tokens[1].type === "ident" && tokens[1].value === "infinite");

  if (tokens[2].type === "delim") {
    if (tokens[2].value === 0x003c) {
      if (tokens[3].type === "delim" && tokens[3].value === 0x003d && !tokens[3].hasSpaceBefore) {
        range[hasLeft ? "leftOp" : "rightOp"] = "<=";
      } else {
        range[hasLeft ? "leftOp" : "rightOp"] = "<";
      }
    } else if (tokens[2].value === 0x003e) {
      if (tokens[3].type === "delim" && tokens[3].value === 0x003d && !tokens[3].hasSpaceBefore) {
        range[hasLeft ? "leftOp" : "rightOp"] = ">=";
      } else {
        range[hasLeft ? "leftOp" : "rightOp"] = ">";
      }
    } else if (tokens[2].value === 0x003d) {
      range[hasLeft ? "leftOp" : "rightOp"] = "=";
    } else {
      return createError("Invalid range");
    }

    if (hasLeft) {
      range.leftToken = tokens[1];
    } else if (tokens[1].type === "ident") {
      range.featureName = tokens[1].value;
    } else {
      return createError("Invalid range");
    }

    const tokenIndexAfterFirstOp = 2 + (range[hasLeft ? "leftOp" : "rightOp"]?.length ?? 0);
    // eslint-disable-next-line security/detect-object-injection
    const tokenAfterFirstOp = tokens[tokenIndexAfterFirstOp];

    if (hasLeft) {
      if (tokenAfterFirstOp.type === "ident") {
        range.featureName = tokenAfterFirstOp.value;

        if (tokens.length >= 7) {
          // check for right side
          const secondOpToken = tokens[tokenIndexAfterFirstOp + 1];
          const followingToken = tokens[tokenIndexAfterFirstOp + 2];
          if (secondOpToken.type === "delim") {
            const charCode = secondOpToken.value;
            if (charCode === 0x003c) {
              if (
                followingToken.type === "delim" &&
                followingToken.value === 0x003d &&
                !followingToken.hasSpaceBefore
              ) {
                range.rightOp = "<=";
              } else {
                range.rightOp = "<";
              }
            } else if (charCode === 0x003e) {
              if (
                followingToken.type === "delim" &&
                followingToken.value === 0x003d &&
                !followingToken.hasSpaceBefore
              ) {
                range.rightOp = ">=";
              } else {
                range.rightOp = ">";
              }
            } else {
              return createError("Invalid range");
            }

            const indexAfterSecondOp = tokenIndexAfterFirstOp + 1 + (range.rightOp?.length ?? 0);
            const tokenAfterSecondOp = tokens.at(indexAfterSecondOp);
            if (indexAfterSecondOp + 2 === tokens.length) {
              range.rightToken = tokenAfterSecondOp;
            } else {
              return createError("Invalid range");
            }
          } else {
            return createError("Invalid range");
          }
        } else if (tokenIndexAfterFirstOp + 2 !== tokens.length) {
          return createError("Invalid range");
        }
      } else {
        return createError("Invalid range");
      }
    } else {
      range.rightToken = tokenAfterFirstOp;
    }

    let validRange: ValidRange | undefined;

    const { leftToken: lt, leftOp, featureName, rightOp, rightToken: rt } = range;

    let leftToken: ValidRangeToken | undefined;
    if (lt !== undefined) {
      if (lt.type === "ident") {
        const { type, value } = lt;
        if (value === "infinite") {
          leftToken = { type, value };
        }
      } else if (lt.type === "number" || lt.type === "dimension" || lt.type === "ratio") {
        const { hasSpaceBefore: _0, hasSpaceAfter: _1, start: _2, end: _3, ...ltNoWS } = lt;
        leftToken = ltNoWS;
      }
    }
    let rightToken: ValidRangeToken | undefined;
    if (rt !== undefined) {
      if (rt.type === "ident") {
        const { type, value } = rt;
        if (value === "infinite") {
          rightToken = { type, value };
        }
      } else if (rt.type === "number" || rt.type === "dimension" || rt.type === "ratio") {
        const { hasSpaceBefore: _0, hasSpaceAfter: _1, start: _2, end: _3, ...rtNoWS } = rt;
        rightToken = rtNoWS;
      }
    }

    if (leftToken !== undefined && rightToken !== undefined) {
      if ((leftOp === "<" || leftOp === "<=") && (rightOp === "<" || rightOp === "<=")) {
        validRange = { leftToken, leftOp, featureName, rightOp, rightToken };
      } else if ((leftOp === ">" || leftOp === ">=") && (rightOp === ">" || rightOp === ">=")) {
        validRange = { leftToken, leftOp, featureName, rightOp, rightToken };
      } else {
        return createError("Invalid range");
      }
    } else if (
      leftToken === undefined &&
      leftOp === undefined &&
      rightOp !== undefined &&
      rightToken !== undefined
    ) {
      validRange = { leftToken, leftOp, featureName, rightOp, rightToken };
    } else if (
      leftToken !== undefined &&
      leftOp !== undefined &&
      rightOp === undefined &&
      rightToken === undefined
    ) {
      validRange = { leftToken, leftOp, featureName, rightOp, rightToken };
    }

    return validRange ?? createError("Invalid range");
  } else {
    return createError("Invalid range");
  }
};
