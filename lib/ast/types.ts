import type {
  DimensionToken,
  EOFToken,
  IdentToken,
  NumberToken,
  CSSToken,
} from "../lexer/types.js";

// eslint-disable-next-line @typescript-eslint/ban-types
type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

export type ParserToken = Simplify<
  Exclude<CSSToken, EOFToken> & { hasSpaceBefore: boolean; hasSpaceAfter: boolean }
>;

export type ParserErrId =
  | "EXPECT_LPAREN_OR_TYPE"
  | "EXPECT_TYPE"
  | "EXPECT_CONDITION"
  | "EXPECT_AND"
  | "EXPECT_LPAREN_OR_TYPE_OR_MODIFIER"
  | "EXPECT_LPAREN"
  | "EXPECT_FEATURE_OR_CONDITION"
  | "EXPECT_AND_OR_OR"
  | "EXPECT_RPAREN"
  | "EXPECT_VALUE"
  | "EXPECT_RANGE"
  | "MIX_AND_WITH_OR"
  | "OR_AT_TOP_LEVEL"
  | "MISMATCH_PARENS"
  | "EMPTY_QUERY"
  | "EMPTY_CONDITION"
  | "EMPTY_FEATURE"
  | "NO_LCURLY"
  | "NO_SEMICOLON"
  | "INVALID_FEATURE"
  | "INVALID_RANGE"
  | "INVALID_STRING";

export type ParserError = {
  errid: ParserErrId;
  start: number;
  end: number;
  child?: ParserError;
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

export type MediaCondition =
  | {
      type: "condition";
      operator?: "not";
      children: [child: MediaCondition | MediaFeature];
    }
  | {
      type: "condition";
      operator: "and" | "or";
      children: [
        child1: MediaCondition | MediaFeature,
        child2: MediaCondition | MediaFeature,
        ...rest: Array<MediaCondition | MediaFeature>
      ];
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
      rightOp?: undefined;
      rightToken?: undefined;
    }
  | {
      leftToken?: undefined;
      leftOp?: undefined;
      featureName: string;
      rightOp: ">" | ">=" | "<" | "<=" | "=";
      rightToken: ValidRangeToken;
    };
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
