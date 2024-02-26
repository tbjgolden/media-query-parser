import { Simplify } from "./internals.js";

// Lexer

type FileRange = { start: number; end: number };

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

export type WhitespaceToken = Simplify<{ _t: "whitespace" } & FileRange>;
export type StringToken = Simplify<{ _t: "string"; value: string } & FileRange>;
export type HashToken = Simplify<
  { _t: "hash"; value: string; flag: "id" | "unrestricted" } & FileRange
>;
export type DelimToken = Simplify<{ _t: "delim"; value: number } & FileRange>;
export type CommaToken = Simplify<{ _t: "comma" } & FileRange>;
export type LeftParenToken = Simplify<{ _t: "(" } & FileRange>;
export type RightParenToken = Simplify<{ _t: ")" } & FileRange>;
export type DimensionToken = Simplify<
  { _t: "dimension"; value: number; unit: string; flag: "number" } & FileRange
>;
export type NumberToken = Simplify<
  { _t: "number"; value: number; flag: "number" | "integer" } & FileRange
>;
export type PercentageToken = Simplify<
  { _t: "percentage"; value: number; flag: "number" } & FileRange
>;
export type CDCToken = Simplify<{ _t: "CDC" } & FileRange>;
export type ColonToken = Simplify<{ _t: "colon" } & FileRange>;
export type SemicolonToken = Simplify<{ _t: "semicolon" } & FileRange>;
export type CDOToken = Simplify<{ _t: "CDO" } & FileRange>;
export type AtKeywordToken = Simplify<{ _t: "at-keyword"; value: string } & FileRange>;
export type LeftBracketToken = Simplify<{ _t: "[" } & FileRange>;
export type RightBracketToken = Simplify<{ _t: "]" } & FileRange>;
export type LeftCurlyToken = Simplify<{ _t: "{" } & FileRange>;
export type RightCurlyToken = Simplify<{ _t: "}" } & FileRange>;
export type IdentToken = Simplify<{ _t: "ident"; value: string } & FileRange>;
export type FunctionToken = Simplify<{ _t: "function"; value: string } & FileRange>;
export type UrlToken = Simplify<{ _t: "url"; value: string } & FileRange>;
export type EOFToken = Simplify<{ _t: "EOF" } & FileRange>;

export type ParserToken = Simplify<
  Exclude<LexerToken, WhitespaceToken | EOFToken> & { isAfterSpace: boolean }
>;

// AST

export type QueryListNode = { _t: "query-list"; nodes: Array<QueryNode | undefined> };
export type QueryNode = Simplify<
  (
    | { _t: "query"; prefix?: undefined; type?: undefined; condition: ConditionNode }
    | { _t: "query"; prefix?: "not" | "only"; type: string; condition?: ConditionWithoutOrNode }
  ) &
    FileRange
>;
export type FeatureNode =
  | BooleanFeatureNode
  | PlainFeatureNode
  | SingleRangeFeatureNode
  | DoubleRangeFeatureNode;
export type BooleanFeatureNode = Simplify<
  { _t: "feature"; context: "boolean"; feature: string } & FileRange
>;
export type PlainFeatureNode = Simplify<
  {
    _t: "feature";
    context: "value";
    feature: string;
    value: ValueNode;
  } & FileRange
>;
export type SingleRangeFeatureNode = Simplify<
  {
    _t: "feature";
    context: "range";
    ops: 1;
    feature: string;
    op: ">" | ">=" | "<" | "<=" | "=";
    value: NumericValueNode;
  } & FileRange
>;
export type DoubleRangeFeatureNode = Simplify<
  {
    _t: "feature";
    context: "range";
    ops: 2;
    feature: string;
    minOp: "<" | "<=";
    minValue: NumericValueNode;
    maxOp: "<" | "<=";
    maxValue: NumericValueNode;
  } & FileRange
>;
export type RangeFeatureNode = SingleRangeFeatureNode | DoubleRangeFeatureNode;
export type NumberNode = Simplify<
  { _t: "number"; value: number; flag: "number" | "integer" } & FileRange
>;
export type DimensionNode = Simplify<{ _t: "dimension"; value: number; unit: string } & FileRange>;
export type RatioNode = Simplify<{ _t: "ratio"; left: number; right: number } & FileRange>;
export type IdentNode = Simplify<{ _t: "ident"; value: string } & FileRange>;
export type NumericValueNode = NumberNode | DimensionNode | RatioNode;
export type ValueNode = NumericValueNode | IdentNode;
export type NotConditionNode = Simplify<
  { _t: "condition"; op: "not"; nodes: [InParensNode] } & FileRange
>;
export type AndConditionNode = Simplify<
  {
    _t: "condition";
    op: "and";
    nodes: [InParensNode, ...InParensNode[]];
  } & FileRange
>;
export type OrConditionNode = Simplify<
  {
    _t: "condition";
    op: "or";
    nodes: [InParensNode, ...InParensNode[]];
  } & FileRange
>;
export type ConditionNode = Simplify<NotConditionNode | AndConditionNode | OrConditionNode>;
export type ConditionWithoutOrNode = Simplify<NotConditionNode | AndConditionNode>;
export type GeneralEnclosedNode = Simplify<
  {
    _t: "general-enclosed";
    tokens: Exclude<LexerToken, EOFToken>[];
  } & FileRange
>;
export type InParensNode = Simplify<{
  _t: "in-parens";
  node: ConditionNode | FeatureNode | GeneralEnclosedNode;
}>;

// ParserError

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
