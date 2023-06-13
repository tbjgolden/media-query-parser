/**
 * a type guard that asserts whether `value` is of type ParserError
 *
 * tolerant of any input type, you can assume it will be true if (and only if) it is a ParserError
 */
export const isParserError = (value) => {
  return typeof value === "object" && value !== null && "errid" in value;
};
