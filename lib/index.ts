// parse{MediaQueryList,MediaQuery,MediaCondition,MediaFeature}
// string -> AST | ParserError
// convert to a recursive descent parser

// stringify
// can infer which of {MediaQueryList,MediaQuery,MediaCondition,MediaFeature}

// move below to media-query-fns:

// simplify{...}

// prettify{...}

// validate{...}
// differences
// - will error on invalid media query for media query list
// - (future) supports fail fast by checking token types

// that which is already in media-query-fns
// but should probably have a way for users to pass in custom features

export {};
