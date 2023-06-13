import { lexer } from "../lexer/lexer.js";
import { isParserError, readMediaQuery, readMediaQueryList } from "./ast.js";
import { deepEqual } from "node:assert/strict";
export const toLiteMediaFeature = ({ type: _, ...rest }) => rest;
export const toLiteMediaCondition = ({ operator, children }) => ({
  operator,
  children: children.map((child) =>
    child.type === "condition" ? toLiteMediaCondition(child) : toLiteMediaFeature(child)
  ),
});
export const toLiteMediaQuery = ({ mediaType, mediaCondition, mediaPrefix }) => ({
  mediaType,
  mediaPrefix,
  mediaCondition: mediaCondition ? toLiteMediaCondition(mediaCondition) : mediaCondition,
});
export const toLiteMediaQueryList = (mediaQueryList) => {
  return {
    mediaQueries: mediaQueryList.mediaQueries.map((mediaQuery) => toLiteMediaQuery(mediaQuery)),
  };
};
export const parseLiteMediaQueryList = (str) => {
  return toLiteMediaQueryList(readMediaQueryList(lexer(str)));
};
export const expectMQL = (str, expected) => {
  const result = readMediaQueryList(lexer(str));
  expect(result.mediaQueries.map((mediaQuery) => toLiteMediaQuery(mediaQuery))).toEqual(expected);
};
export const expectMQ = (str, expected) => {
  const result = readMediaQuery(lexer(str));
  if (typeof expected === "boolean") {
    // for boolean, treat as whether the string parses successfully
    expect(isParserError(result)).not.toBe(expected);
  } else if (typeof expected === "string") {
    // for string, expect the string to be parsed as an error...
    expect(isParserError(result)).toBe(true);
    // ...and for the error id to be the string passed
    if (isParserError(result)) {
      expect(result.errid).toBe(expected);
    }
  } else {
    // for object, expect the string *not* to be parsed as an error...
    expect(!isParserError(result)).toBe(true);
    if (!isParserError(result)) expect(toLiteMediaQuery(result)).toEqual(expected);
  }
};
export const isEqualish = (a, b) => {
  let isDeepEqual = true;
  try {
    deepEqual(a, b);
  } catch {
    isDeepEqual = false;
  }
  return isDeepEqual;
};
