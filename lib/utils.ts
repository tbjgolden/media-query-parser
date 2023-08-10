import { Simplify } from "./internals.js";

type GenericToken = { start: number; end: number };

export type LexerToken =
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
  Exclude<LexerToken, WhitespaceToken | EOFToken> & { isAfterSpace: boolean }
>;

export type QueryListNode = { n: "query-list"; qs: Array<QueryNode | undefined> };
export type QueryNode =
  | { n: "query"; prefix?: undefined; type?: undefined; condition: ConditionNode }
  | { n: "query"; prefix?: "not" | "only"; type: string; condition?: ConditionWithoutOrNode };
export type FeatureNode = BooleanFeatureNode | PlainFeatureNode | RangeFeatureNode;
export type BooleanFeatureNode = { n: "feature"; t: "boolean"; f: string };
export type PlainFeatureNode = { n: "feature"; t: "value"; f: string; v: ValueNode };
export type RangeFeatureNode = { n: "feature"; t: "range"; f: string; r: RangeNode };
export type NumberNode = { n: "number"; v: number; isInt: boolean };
export type DimensionNode = { n: "dimension"; v: number; u: string };
export type RatioNode = { n: "ratio"; l: number; r: number };
export type IdentNode = { n: "ident"; v: string };
export type NumericValueNode = NumberNode | DimensionNode | RatioNode;
export type ValueNode = NumericValueNode | IdentNode;
export type Range1Node =
  | { a: IdentNode; op: ">" | ">=" | "<" | "<=" | "="; b: NumericValueNode }
  | { a: NumericValueNode; op: ">" | ">=" | "<" | "<=" | "="; b: IdentNode };
export type Range2Node =
  | { a: NumericValueNode; op: "<" | "<="; b: IdentNode; op2: "<" | "<="; c: NumericValueNode }
  | { a: NumericValueNode; op: ">" | ">="; b: IdentNode; op2: ">" | ">="; c: NumericValueNode };
export type RangeNode = Simplify<Range1Node | Range2Node>;
export type NotConditionNode = { n: "condition"; op: "not"; a: InParensNode; bs?: undefined };
export type AndConditionNode = { n: "condition"; op: "and"; a: InParensNode; bs?: InParensNode[] };
export type OrConditionNode = { n: "condition"; op: "or"; a: InParensNode; bs?: InParensNode[] };
export type ConditionNode = Simplify<NotConditionNode | AndConditionNode | OrConditionNode>;
export type ConditionWithoutOrNode = Simplify<NotConditionNode | AndConditionNode>;
export type GeneralEnclosedNode = { n: "general-enclosed" };
export type InParensNode = { n: "in-parens"; v: ConditionNode | FeatureNode | GeneralEnclosedNode };

export type Match<T> = { n: T; i: number } | undefined;

// ---

export type ParserErrId =
  | "INVALID_QUERY"
  | "INVALID_CONDITION"
  | "INVALID_FEATURE"
  | "INVALID_STRING"
  | "NO_LCURLY"
  | "NO_SEMICOLON";

export type ParserError = { errid: ParserErrId; start: number; end: number; child?: ParserError };

/**
 * a type guard that asserts whether `value` is of type ParserError
 *
 * tolerant of any input type, you can assume it will be true if (and only if) it is a ParserError
 */
export const isParserError = (value: unknown): value is ParserError => {
  return typeof value === "object" && value !== null && "errid" in value;
};
