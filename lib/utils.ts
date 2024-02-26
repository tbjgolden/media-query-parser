import { Simplify } from "./internals.js";

// Lexer

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

export type WhitespaceToken = Simplify<{ _t: "whitespace" } & GenericToken>;
export type StringToken = Simplify<{ _t: "string"; value: string } & GenericToken>;
export type HashToken = Simplify<
  { _t: "hash"; value: string; flag: "id" | "unrestricted" } & GenericToken
>;
export type DelimToken = Simplify<{ _t: "delim"; value: number } & GenericToken>;
export type CommaToken = Simplify<{ _t: "comma" } & GenericToken>;
export type LeftParenToken = Simplify<{ _t: "(" } & GenericToken>;
export type RightParenToken = Simplify<{ _t: ")" } & GenericToken>;
export type DimensionToken = Simplify<
  { _t: "dimension"; value: number; unit: string; flag: "number" } & GenericToken
>;
export type NumberToken = Simplify<
  { _t: "number"; value: number; flag: "number" | "integer" } & GenericToken
>;
export type PercentageToken = Simplify<
  { _t: "percentage"; value: number; flag: "number" } & GenericToken
>;
export type CDCToken = Simplify<{ _t: "CDC" } & GenericToken>;
export type ColonToken = Simplify<{ _t: "colon" } & GenericToken>;
export type SemicolonToken = Simplify<{ _t: "semicolon" } & GenericToken>;
export type CDOToken = Simplify<{ _t: "CDO" } & GenericToken>;
export type AtKeywordToken = Simplify<{ _t: "at-keyword"; value: string } & GenericToken>;
export type LeftBracketToken = Simplify<{ _t: "[" } & GenericToken>;
export type RightBracketToken = Simplify<{ _t: "]" } & GenericToken>;
export type LeftCurlyToken = Simplify<{ _t: "{" } & GenericToken>;
export type RightCurlyToken = Simplify<{ _t: "}" } & GenericToken>;
export type IdentToken = Simplify<{ _t: "ident"; value: string } & GenericToken>;
export type FunctionToken = Simplify<{ _t: "function"; value: string } & GenericToken>;
export type UrlToken = Simplify<{ _t: "url"; value: string } & GenericToken>;
export type EOFToken = Simplify<{ _t: "EOF" } & GenericToken>;

export type ParserToken = Simplify<
  Exclude<LexerToken, WhitespaceToken | EOFToken> & { isAfterSpace: boolean }
>;

// AST

export type QueryListNode = { _t: "query-list"; nodes: Array<QueryNode | undefined> };
export type QueryNode =
  | { _t: "query"; prefix?: undefined; type?: undefined; condition: ConditionNode }
  | { _t: "query"; prefix?: "not" | "only"; type: string; condition?: ConditionWithoutOrNode };
export type FeatureNode = BooleanFeatureNode | PlainFeatureNode | RangeFeatureNode;
export type BooleanFeatureNode = { _t: "feature"; context: "boolean"; feature: string };
export type PlainFeatureNode = {
  _t: "feature";
  context: "value";
  feature: string;
  value: ValueNode;
};
export type RangeFeatureNode = {
  _t: "feature";
  context: "range";
  feature: string;
  value: RangeNode;
};
export type NumberNode = { _t: "number"; value: number; flag: "number" | "integer" };
export type DimensionNode = { _t: "dimension"; value: number; unit: string };
export type RatioNode = { _t: "ratio"; left: number; right: number };
export type IdentNode = { _t: "ident"; value: string };
export type NumericValueNode = NumberNode | DimensionNode | RatioNode;
export type ValueNode = NumericValueNode | IdentNode;
export type Range1Node =
  | { a: IdentNode; op: ">" | ">=" | "<" | "<=" | "="; b: NumericValueNode }
  | { a: NumericValueNode; op: ">" | ">=" | "<" | "<=" | "="; b: IdentNode };
export type Range2Node =
  | { a: NumericValueNode; op: "<" | "<="; b: IdentNode; op2: "<" | "<="; c: NumericValueNode }
  | { a: NumericValueNode; op: ">" | ">="; b: IdentNode; op2: ">" | ">="; c: NumericValueNode };
export type RangeNode = Simplify<Range1Node | Range2Node>;
export type NotConditionNode = { _t: "condition"; op: "not"; a: InParensNode; bs?: undefined };
export type AndConditionNode = { _t: "condition"; op: "and"; a: InParensNode; bs?: InParensNode[] };
export type OrConditionNode = { _t: "condition"; op: "or"; a: InParensNode; bs?: InParensNode[] };
export type ConditionNode = Simplify<NotConditionNode | AndConditionNode | OrConditionNode>;
export type ConditionWithoutOrNode = Simplify<NotConditionNode | AndConditionNode>;
export type GeneralEnclosedNode = {
  _t: "general-enclosed";
  tokens: Exclude<LexerToken, EOFToken>[];
  raw: string;
};
export type InParensNode = {
  _t: "in-parens";
  node: ConditionNode | FeatureNode | GeneralEnclosedNode;
};

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
