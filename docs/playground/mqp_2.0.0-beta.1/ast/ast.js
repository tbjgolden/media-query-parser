export const isParserError = (value) => {
  return typeof value === "object" && value !== null && "errid" in value;
};
export const splitMediaQueryList = (tokens) => {
  const mediaQueriesParserTokens = [[]];
  const stack = [];
  for (const token of tokens) {
    if (token.type === "comma" && stack.length === 0) {
      mediaQueriesParserTokens.push([]);
    } else {
      switch (token.type) {
        case "function":
        case "(": {
          stack.push(")");
          break;
        }
        case "[": {
          stack.push("]");
          break;
        }
        case "{": {
          stack.push("}");
          break;
        }
        case ")":
        case "]":
        case "}": {
          const topOfStack = stack.at(-1);
          if (topOfStack === token.type) {
            stack.pop();
          }
          break;
        }
      }
      mediaQueriesParserTokens[mediaQueriesParserTokens.length - 1].push(token);
    }
  }
  return mediaQueriesParserTokens;
};
export const readMediaQueryList = (parsingTokens) => {
  const mediaQueriesParserTokens = splitMediaQueryList(parsingTokens);
  if (mediaQueriesParserTokens.length === 1 && mediaQueriesParserTokens[0].length === 0) {
    // '@media {' is fine, treat as all
    return { type: "query-list", mediaQueries: [{ type: "query" }] };
  } else {
    const mediaQueries = [];
    for (const mediaQueryParserTokens of mediaQueriesParserTokens) {
      const mediaQuery = readMediaQuery(mediaQueryParserTokens);
      // note: a media query list can contain an invalid media query
      if (isParserError(mediaQuery)) {
        mediaQueries.push({ type: "query", mediaPrefix: "not" });
      } else {
        mediaQueries.push(mediaQuery);
      }
    }
    return { type: "query-list", mediaQueries };
  }
};
export const readMediaQuery = (parsingTokens) => {
  var _a, _b, _c;
  const firstToken = parsingTokens.at(0);
  if (firstToken) {
    if (firstToken.type === "(") {
      const mediaCondition = readMediaCondition(parsingTokens, true);
      if (isParserError(mediaCondition)) {
        const { start, end } =
          (_a = parsingTokens.at(1)) !== null && _a !== void 0 ? _a : firstToken;
        return { errid: "EXPECT_FEATURE_OR_CONDITION", start, end, child: mediaCondition };
      } else {
        return { type: "query", mediaCondition };
      }
    } else if (firstToken.type === "ident") {
      let mediaPrefix;
      let mediaType;
      const { value, end } = firstToken;
      if (value === "only" || value === "not") {
        mediaPrefix = value;
      }
      const firstIndex = mediaPrefix === undefined ? 0 : 1;
      const firstNonUnaryToken = parsingTokens.at(firstIndex);
      if (!firstNonUnaryToken) {
        return { errid: "EXPECT_LPAREN_OR_TYPE", start: end, end };
      }
      if (firstNonUnaryToken.type === "ident") {
        const { value, start, end } = firstNonUnaryToken;
        if (value === "all") {
          mediaType = undefined;
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
          mediaType = undefined;
        } else {
          return { errid: "EXPECT_TYPE", start, end };
        }
      } else if (mediaPrefix === "not" && firstNonUnaryToken.type === "(") {
        const mediaCondition = readMediaCondition(parsingTokens.slice(firstIndex), true);
        if (isParserError(mediaCondition)) {
          const { start, end } =
            (_b = parsingTokens.at(firstIndex + 1)) !== null && _b !== void 0
              ? _b
              : firstNonUnaryToken;
          return { errid: "EXPECT_CONDITION", start, end, child: mediaCondition };
        } else {
          return {
            type: "query",
            mediaCondition: { type: "condition", operator: "not", children: [mediaCondition] },
          };
        }
      } else {
        const { start, end } = firstNonUnaryToken;
        return { errid: "EXPECT_TYPE", start, end };
      }
      if (firstIndex + 1 === parsingTokens.length) {
        return { type: "query", mediaPrefix, mediaType };
      } else {
        const secondNonUnaryToken = parsingTokens[firstIndex + 1];
        if (secondNonUnaryToken.type === "ident" && secondNonUnaryToken.value === "and") {
          const lastToken = parsingTokens.at(-1);
          const afterAndToken = parsingTokens.at(firstIndex + 2);
          let index = lastToken.end + 1;
          let mediaCondition;
          if (
            (afterAndToken === null || afterAndToken === void 0 ? void 0 : afterAndToken.type) ===
              "ident" &&
            afterAndToken.value === "not"
          ) {
            index += 1;
            const parsedCondition = readMediaCondition(parsingTokens.slice(firstIndex + 3), false);
            mediaCondition = isParserError(parsedCondition)
              ? parsedCondition
              : { type: "condition", operator: "not", children: [parsedCondition] };
          } else {
            mediaCondition = readMediaCondition(parsingTokens.slice(firstIndex + 2), false);
          }
          const { start, end } =
            (_c = parsingTokens.at(firstIndex + 2)) !== null && _c !== void 0
              ? _c
              : { start: index, end: index };
          return isParserError(mediaCondition)
            ? { errid: "EXPECT_CONDITION", start, end, child: mediaCondition }
            : { type: "query", mediaPrefix, mediaType, mediaCondition };
        } else {
          return {
            errid: "EXPECT_AND",
            start: secondNonUnaryToken.start,
            end: secondNonUnaryToken.end,
          };
        }
      }
    } else {
      return {
        errid: "EXPECT_LPAREN_OR_TYPE_OR_MODIFIER",
        start: firstToken.start,
        end: firstToken.end,
      };
    }
  } else {
    return { errid: "EMPTY_QUERY", start: 0, end: 0 };
  }
};
export const readMediaCondition = (parsingTokens, mayContainOr, previousOperator) => {
  const firstToken = parsingTokens.at(0);
  if (firstToken) {
    if (firstToken.type !== "(") {
      return { errid: "EXPECT_LPAREN", start: firstToken.start, end: firstToken.end };
    }
    let endIndexOfFirstFeature = parsingTokens.length - 1;
    let maxDepth = 0;
    let count = 0;
    for (const [i, token] of parsingTokens.entries()) {
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
      return {
        errid: "MISMATCH_PARENS",
        start: firstToken.start,
        end: parsingTokens[parsingTokens.length - 1].end,
      };
    }
    let child;
    const featureTokens = parsingTokens.slice(0, endIndexOfFirstFeature + 1);
    if (maxDepth === 1) {
      child = readMediaFeature(featureTokens);
    } else {
      child =
        featureTokens[1].type === "ident" && featureTokens[1].value === "not"
          ? readMediaCondition(featureTokens.slice(2, -1), true, "not")
          : readMediaCondition(featureTokens.slice(1, -1), true);
    }
    if (isParserError(child)) {
      return {
        errid: "EXPECT_FEATURE_OR_CONDITION",
        start: firstToken.start,
        end: featureTokens[featureTokens.length - 1].end,
        child,
      };
    }
    if (endIndexOfFirstFeature === parsingTokens.length - 1) {
      return { type: "condition", operator: previousOperator, children: [child] };
    } else {
      // read for a boolean op "and", "not", "or"
      const nextToken = parsingTokens[endIndexOfFirstFeature + 1];
      if (nextToken.type !== "ident" || (nextToken.value !== "and" && nextToken.value !== "or")) {
        return { errid: "EXPECT_AND_OR_OR", start: nextToken.start, end: nextToken.end };
      } else if (previousOperator !== undefined && previousOperator !== nextToken.value) {
        return { errid: "MIX_AND_WITH_OR", start: nextToken.start, end: nextToken.end };
      } else if (nextToken.value === "or" && !mayContainOr) {
        return { errid: "MIX_AND_WITH_OR", start: nextToken.start, end: nextToken.end };
      }
      const mediaCondition = readMediaCondition(
        parsingTokens.slice(endIndexOfFirstFeature + 2),
        mayContainOr,
        nextToken.value
      );
      return isParserError(mediaCondition)
        ? mediaCondition
        : {
            type: "condition",
            operator: nextToken.value,
            children: [child, ...mediaCondition.children],
          };
    }
  } else {
    return { errid: "EMPTY_CONDITION", start: 0, end: 0 };
  }
};
export const readMediaFeature = (parsingTokens) => {
  const firstToken = parsingTokens.at(0);
  if (firstToken) {
    if (firstToken.type !== "(") {
      return { errid: "EXPECT_LPAREN", start: firstToken.start, end: firstToken.end };
    }
    const lastToken = parsingTokens[parsingTokens.length - 1];
    if (lastToken.type !== ")") {
      return { errid: "EXPECT_RPAREN", start: lastToken.end + 1, end: lastToken.end + 1 };
    }
    const tokens = [parsingTokens[0]];
    // convert ratios to single tokens for convenience
    for (let i = 1; i < parsingTokens.length; i++) {
      if (i < parsingTokens.length - 2) {
        // eslint-disable-next-line security/detect-object-injection
        const a = parsingTokens[i];
        const b = parsingTokens[i + 1];
        const c = parsingTokens[i + 2];
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
      tokens.push(parsingTokens[i]);
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
        let mediaPrefix;
        const slice = feature.slice(0, 4);
        if (slice === "min-") {
          mediaPrefix = "min";
          feature = feature.slice(4);
        } else if (slice === "max-") {
          mediaPrefix = "max";
          feature = feature.slice(4);
        }
        const { hasSpaceBefore: _, hasSpaceAfter: _0, start: _1, end: _2, ...value } = valueToken;
        return { type: "feature", context: "value", mediaPrefix, feature, value };
      } else {
        return { errid: "EXPECT_VALUE", start: valueToken.start, end: valueToken.end };
      }
    } else if (tokens.length >= 5) {
      const maybeRange = readRange(tokens);
      if (isParserError(maybeRange)) {
        return {
          errid: "EXPECT_RANGE",
          start: firstToken.start,
          end: tokens[tokens.length - 1].end,
          child: maybeRange,
        };
      } else {
        const { feature, ...range } = maybeRange;
        return { type: "feature", context: "range", feature, range };
      }
    }
    return {
      errid: "INVALID_FEATURE",
      start: firstToken.start,
      end: parsingTokens[parsingTokens.length - 1].end,
    };
  } else {
    return { errid: "EMPTY_FEATURE", start: 0, end: 0 };
  }
};
export const readRange = (convenientTokens) => {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  if (convenientTokens.length < 5) {
    return {
      errid: "INVALID_RANGE",
      start:
        (_b = (_a = convenientTokens.at(0)) === null || _a === void 0 ? void 0 : _a.start) !==
          null && _b !== void 0
          ? _b
          : 0,
      end:
        (_d = (_c = convenientTokens.at(-1)) === null || _c === void 0 ? void 0 : _c.end) !==
          null && _d !== void 0
          ? _d
          : 0,
    };
  }
  if (convenientTokens[0].type !== "(") {
    return {
      errid: "EXPECT_LPAREN",
      start: convenientTokens[0].start,
      end: convenientTokens[0].end,
    };
  }
  const lastToken = convenientTokens[convenientTokens.length - 1];
  if (lastToken.type !== ")") {
    return { errid: "EXPECT_RPAREN", start: lastToken.start, end: lastToken.end };
  }
  // range form
  const range = { feature: "" };
  const hasLeft =
    convenientTokens[1].type === "number" ||
    convenientTokens[1].type === "dimension" ||
    convenientTokens[1].type === "ratio" ||
    (convenientTokens[1].type === "ident" && convenientTokens[1].value === "infinite");
  if (convenientTokens[2].type === "delim") {
    if (convenientTokens[2].value === 0x003c) {
      if (
        convenientTokens[3].type === "delim" &&
        convenientTokens[3].value === 0x003d &&
        !convenientTokens[3].hasSpaceBefore
      ) {
        range[hasLeft ? "leftOp" : "rightOp"] = "<=";
      } else {
        range[hasLeft ? "leftOp" : "rightOp"] = "<";
      }
    } else if (convenientTokens[2].value === 0x003e) {
      if (
        convenientTokens[3].type === "delim" &&
        convenientTokens[3].value === 0x003d &&
        !convenientTokens[3].hasSpaceBefore
      ) {
        range[hasLeft ? "leftOp" : "rightOp"] = ">=";
      } else {
        range[hasLeft ? "leftOp" : "rightOp"] = ">";
      }
    } else if (convenientTokens[2].value === 0x003d) {
      range[hasLeft ? "leftOp" : "rightOp"] = "=";
    } else {
      return { errid: "INVALID_RANGE", start: convenientTokens[0].start, end: lastToken.end };
    }
    if (hasLeft) {
      range.leftToken = convenientTokens[1];
    } else if (convenientTokens[1].type === "ident") {
      range.feature = convenientTokens[1].value;
    } else {
      return { errid: "INVALID_RANGE", start: convenientTokens[0].start, end: lastToken.end };
    }
    const tokenIndexAfterFirstOp =
      2 +
      ((_f =
        (_e = range[hasLeft ? "leftOp" : "rightOp"]) === null || _e === void 0
          ? void 0
          : _e.length) !== null && _f !== void 0
        ? _f
        : 0);
    // eslint-disable-next-line security/detect-object-injection
    const tokenAfterFirstOp = convenientTokens[tokenIndexAfterFirstOp];
    if (hasLeft) {
      if (tokenAfterFirstOp.type === "ident") {
        range.feature = tokenAfterFirstOp.value;
        if (convenientTokens.length >= 7) {
          // check for right side
          const secondOpToken = convenientTokens[tokenIndexAfterFirstOp + 1];
          const followingToken = convenientTokens[tokenIndexAfterFirstOp + 2];
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
              return {
                errid: "INVALID_RANGE",
                start: convenientTokens[0].start,
                end: lastToken.end,
              };
            }
            const indexAfterSecondOp =
              tokenIndexAfterFirstOp +
              1 +
              ((_h = (_g = range.rightOp) === null || _g === void 0 ? void 0 : _g.length) !==
                null && _h !== void 0
                ? _h
                : 0);
            const tokenAfterSecondOp = convenientTokens.at(indexAfterSecondOp);
            if (indexAfterSecondOp + 2 === convenientTokens.length) {
              range.rightToken = tokenAfterSecondOp;
            } else {
              return {
                errid: "INVALID_RANGE",
                start: convenientTokens[0].start,
                end: lastToken.end,
              };
            }
          } else {
            return { errid: "INVALID_RANGE", start: convenientTokens[0].start, end: lastToken.end };
          }
        } else if (tokenIndexAfterFirstOp + 2 !== convenientTokens.length) {
          return { errid: "INVALID_RANGE", start: convenientTokens[0].start, end: lastToken.end };
        }
      } else {
        return { errid: "INVALID_RANGE", start: convenientTokens[0].start, end: lastToken.end };
      }
    } else {
      range.rightToken = tokenAfterFirstOp;
    }
    let validRange;
    const { leftToken: lt, leftOp, feature, rightOp, rightToken: rt } = range;
    let leftToken;
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
    let rightToken;
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
        validRange = { leftToken, leftOp, feature, rightOp, rightToken };
      } else if ((leftOp === ">" || leftOp === ">=") && (rightOp === ">" || rightOp === ">=")) {
        validRange = { leftToken, leftOp, feature, rightOp, rightToken };
      } else {
        return { errid: "INVALID_RANGE", start: convenientTokens[0].start, end: lastToken.end };
      }
    } else if (
      leftToken === undefined &&
      leftOp === undefined &&
      rightOp !== undefined &&
      rightToken !== undefined
    ) {
      validRange = { leftToken, leftOp, feature, rightOp, rightToken };
    } else if (
      leftToken !== undefined &&
      leftOp !== undefined &&
      rightOp === undefined &&
      rightToken === undefined
    ) {
      validRange = { leftToken, leftOp, feature, rightOp, rightToken };
    }
    return validRange !== null && validRange !== void 0
      ? validRange
      : { errid: "INVALID_RANGE", start: convenientTokens[0].start, end: lastToken.end };
  } else {
    return { errid: "INVALID_RANGE", start: convenientTokens[0].start, end: lastToken.end };
  }
};
