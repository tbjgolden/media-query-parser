import type { DimensionToken, EOFToken, IdentToken, NumberToken, Token } from "../lexer/types.js";
import type { ValidRange } from "./ast.js";

// eslint-disable-next-line @typescript-eslint/ban-types
type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

export type ParsingToken = Simplify<
  Exclude<Token, EOFToken> & { hasSpaceBefore: boolean; hasSpaceAfter: boolean }
>;

export type ParsingErrId = "MEDIA_QUERY_LIST";

export type ParsingError = {
  errid: ParsingErrId;
  start: number;
  end: number;
  child?: ParsingError;
};

export type MediaQueryList = {
  type: "query-list";
  mediaQueries: MediaQuery[];
};

export type MediaQuery = {
  type: "query";
  mediaPrefix?: "not" | "only";
  mediaType: "all" | "screen" | "print";
  mediaCondition?: MediaCondition;
};

export type MediaCondition = {
  type: "condition";
  operator?: "and" | "or" | "not";
  children: Array<MediaCondition | MediaFeature>;
};

export type MediaFeature = Simplify<
  { type: "feature" } & (MediaFeatureBoolean | MediaFeatureValue | MediaFeatureRange)
>;
export type MediaFeatureBoolean = {
  context: "boolean";
  feature: string;
};
export type MediaFeatureValue = {
  context: "value";
  prefix?: "min" | "max";
  feature: string;
  value: ValidValueToken;
};
export type MediaFeatureRange = {
  context: "range";
  feature: string;
  range: ValidRange;
};
export type ValidValueToken = Simplify<
  | Omit<NumberToken, "start" | "end">
  | Omit<DimensionToken, "start" | "end">
  | Omit<RatioToken, "start" | "end">
  | Omit<IdentToken, "start" | "end">
>;

export type RatioToken = {
  type: "ratio";
  numerator: number;
  denominator: number;
};
export type ValidRangeToken = Simplify<
  | Omit<NumberToken, "start" | "end">
  | Omit<DimensionToken, "start" | "end">
  | Omit<RatioToken, "start" | "end">
  | { type: "ident"; value: "infinite" }
>;
