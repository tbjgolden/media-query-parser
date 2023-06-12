import { ParserError } from "./utils.js";

export const invertParserError = (parserError: ParserError): ParserError => {
  const errors: [first: ParserError, ...rest: ParserError[]] = [parserError];
  for (let error = parserError.child; error !== undefined; error = error.child) {
    errors.push(error);
  }
  for (let i = errors.length - 2; i >= 0; i--) {
    errors[i + 1].child = errors.at(i);
  }
  return errors.at(-1) as ParserError;
};
