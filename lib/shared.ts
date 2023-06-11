// eslint-disable-next-line @typescript-eslint/ban-types
type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

type GenericToken = { type: string; start: number; end: number };

export type CSSToken =
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

export type WhitespaceToken = Simplify<GenericToken & { type: "whitespace" }>;
export type StringToken = Simplify<GenericToken & { type: "string"; value: string }>;
export type HashToken = Simplify<
  GenericToken & { type: "hash"; value: string; flag: "id" | "unrestricted" }
>;
export type DelimToken = Simplify<GenericToken & { type: "delim"; value: number }>;
export type CommaToken = Simplify<GenericToken & { type: "comma" }>;
export type LeftParenToken = Simplify<GenericToken & { type: "(" }>;
export type RightParenToken = Simplify<GenericToken & { type: ")" }>;
export type DimensionToken = Simplify<
  GenericToken & { type: "dimension"; value: number; unit: string; flag: "number" }
>;
export type NumberToken = Simplify<
  GenericToken & { type: "number"; value: number; flag: "number" | "integer" }
>;
export type PercentageToken = Simplify<
  GenericToken & { type: "percentage"; value: number; flag: "number" }
>;
export type CDCToken = Simplify<GenericToken & { type: "CDC" }>;
export type ColonToken = Simplify<GenericToken & { type: "colon" }>;
export type SemicolonToken = Simplify<GenericToken & { type: "semicolon" }>;
export type CDOToken = Simplify<GenericToken & { type: "CDO" }>;
export type AtKeywordToken = Simplify<GenericToken & { type: "at-keyword"; value: string }>;
export type LeftBracketToken = Simplify<GenericToken & { type: "[" }>;
export type RightBracketToken = Simplify<GenericToken & { type: "]" }>;
export type LeftCurlyToken = Simplify<GenericToken & { type: "{" }>;
export type RightCurlyToken = Simplify<GenericToken & { type: "}" }>;
export type IdentToken = Simplify<GenericToken & { type: "ident"; value: string }>;
export type FunctionToken = Simplify<GenericToken & { type: "function"; value: string }>;
export type UrlToken = Simplify<GenericToken & { type: "url"; value: string }>;
export type EOFToken = Simplify<GenericToken & { type: "EOF" }>;

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

export type ParserError = { errid: ParserErrId; start: number; end: number; child?: ParserError };

export type MediaQueryList = { type: "query-list"; mediaQueries: MediaQuery[] };

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
export type MediaFeatureBoolean = { context: "boolean"; feature: string };
export type MediaFeatureValue = {
  context: "value";
  mediaPrefix?: "min" | "max";
  feature: string;
  value: ValidValueToken;
};
export type MediaFeatureRange = { context: "range"; feature: string; range: ValidRange };
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
export type RatioToken = { type: "ratio"; numerator: number; denominator: number };
export type ValidRangeToken = Simplify<
  | Omit<NumberToken, "start" | "end">
  | Omit<DimensionToken, "start" | "end">
  | Omit<RatioToken, "start" | "end">
  | { type: "ident"; value: "infinite" }
>;

export const isParserError = (value: unknown): value is ParserError => {
  return typeof value === "object" && value !== null && "errid" in value;
};
