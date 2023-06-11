// eslint-disable-next-line @typescript-eslint/ban-types
type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

interface GenericToken {
  type: string;
  start: number;
  end: number;
}

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
