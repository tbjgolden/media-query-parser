import { lexer } from "../lexer/index.js";
import type { Token } from "../lexer/types.js";
import {
  ValidRange,
  convertToParsingTokens,
  isParsingError,
  parseMediaQuery,
  parseMediaQueryList,
} from "./ast.js";
import {
  MediaCondition,
  MediaFeature,
  MediaQuery,
  MediaQueryList,
  ValidValueToken,
} from "./types.js";
import { deepEqual } from "node:assert/strict";

export type LiteMediaQueryList = {
  mediaQueries: LiteMediaQuery[];
};

export type LiteMediaQuery = {
  mediaPrefix?: "not" | "only";
  mediaType: "all" | "screen" | "print";
  mediaCondition?: LiteMediaCondition;
};

export type LiteMediaCondition = {
  operator?: "and" | "or" | "not";
  children: Array<LiteMediaCondition | LiteMediaFeature>;
};

export type LiteMediaFeature =
  | LiteMediaFeatureBoolean
  | LiteMediaFeatureValue
  | LiteMediaFeatureRange;
export type LiteMediaFeatureBoolean = {
  context: "boolean";
  feature: string;
};
export type LiteMediaFeatureValue = {
  context: "value";
  prefix?: "min" | "max";
  feature: string;
  value: ValidValueToken;
};
export type LiteMediaFeatureRange = {
  context: "range";
  feature: string;
  range: ValidRange;
};

export const toLiteMediaFeature = ({ type: _, ...rest }: MediaFeature): LiteMediaFeature => rest;

export const toLiteMediaCondition = ({
  operator,
  children,
}: MediaCondition): LiteMediaCondition => ({
  operator,
  children: children.map((child) =>
    child.type === "condition" ? toLiteMediaCondition(child) : toLiteMediaFeature(child)
  ),
});

export const toLiteMediaQuery = ({
  mediaType,
  mediaCondition,
  mediaPrefix,
}: MediaQuery): LiteMediaQuery => ({
  mediaType,
  mediaPrefix,
  mediaCondition: mediaCondition ? toLiteMediaCondition(mediaCondition) : mediaCondition,
});

export const toLiteMediaQueryList = (mediaQueryList: MediaQueryList): LiteMediaQueryList => {
  return {
    mediaQueries: mediaQueryList.mediaQueries.map((mediaQuery) => toLiteMediaQuery(mediaQuery)),
  };
};

export const parseLiteMediaQueryList = (str: string): LiteMediaQueryList => {
  return toLiteMediaQueryList(parseMediaQueryList(convertToParsingTokens(lexer(str) as Token[])));
};

export const expectMQL = (str: string, expected: LiteMediaQuery[]) => {
  const result = parseMediaQueryList(convertToParsingTokens(lexer(str) as Token[]));
  expect(result.mediaQueries.map((mediaQuery) => toLiteMediaQuery(mediaQuery))).toEqual(expected);
};

export const expectMQ = (str: string, expected: LiteMediaQuery | string | boolean) => {
  const result = parseMediaQuery(convertToParsingTokens(lexer(str) as Token[]));
  if (typeof expected === "boolean") {
    // for boolean, treat as whether the string parses successfully
    expect(isParsingError(result)).not.toBe(expected);
  } else if (typeof expected === "string") {
    // for string, expect the string to be parsed as an error...
    expect(isParsingError(result)).toBe(true);
    // ...and for the error id to be the string passed
    if (isParsingError(result)) expect(result.errid).toBe(expected);
  } else {
    // for object, expect the string *not* to be parsed as an error...
    expect(!isParsingError(result)).toBe(true);
    if (!isParsingError(result)) expect(toLiteMediaQuery(result)).toEqual(expected);
  }
};

export const isEqualish = (a: unknown, b: unknown): boolean => {
  let isDeepEqual = true;
  try {
    deepEqual(a, b);
  } catch {
    isDeepEqual = false;
  }
  return isDeepEqual;
};
