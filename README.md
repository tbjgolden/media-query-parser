# `media-query-parser`

![npm](https://img.shields.io/npm/v/media-query-parser)
![npm type definitions](https://img.shields.io/npm/types/media-query-parser)
![license](https://img.shields.io/npm/l/media-query-parser)
![npm downloads](https://img.shields.io/npm/dw/media-query-parser)
[![install size](https://packagephobia.com/badge?p=media-query-parser)](https://packagephobia.com/result?p=media-query-parser)

- **Parses correct CSS media queries**
- **Fails on invalid CSS media queries**
- **Spec-compliant** - https://www.w3.org/TR/mediaqueries-5/
  - **All valid queries parsed, even newer ones like  
     `@media (100px < width < 200px)`**
- **Zero-dependencies**
- **TypeScript friendly**

**_[You can try it out!](https://tbjgolden.github.io/media-query-parser/)_**

![banner](banner.svg)

## Install

This package is available from the `npm` registry.

```sh
npm install media-query-parser
```

## Usage

Supports JavaScript + TypeScript:

```ts
import { parseMediaQuery } from "media-query-parser";

const mediaQuery = parseMediaQuery("screen and (width <= 768px)");
if (!isParserError(mediaQuery)) {
  console.log(mediaQuery);
  // {
  //   type: "query",
  //   mediaType: "screen",
  //   mediaCondition: {
  //     type: "condition",
  //     children: [
  //       {
  //         type: "feature",
  //         context: "range",
  //         feature: "width",
  //         range: {
  //           featureName: "width",
  //           rightOp: "<=",
  //           rightToken: { type: "dimension", unit: "px", value: 768, flag: "number" },
  //         },
  //       },
  //     ],
  //   },
  // }
  console.log(stringify(mediaQuery.mediaCondition.children[0]));
  // "(width <= 768px)"
}
```

Can also be imported via `require("media-query-parser")`.

## Considerations & Caveats

This library **does**:

- remove extra layers from unnecessary parentheses `(((((max-width: 768px)))))`
- parses units, numbers and other values according to the spec
- handle unusual whitespace anywhere that the spec allows it
- contain over 200 unit tests

This library **will not**:

- sanity check the actual media features or their types `(max-power: infinite)` is as valid as
  `(hover: none)` - see [media-query-fns](https://github.com/tbjgolden/media-query-fns)
- support `calc()` or `var()` - functions are disallowed by the spec, even though some browsers seem
  to support them. If/when the spec allows them they'll be added in a new major version
- (yet) convert the AST back into a media query

## Contributing

- PRs welcome and accepted, simply fork and create
- Issues also very welcome
- Treat others with common courtesy and respect 🤝

Dev environment (for contributing) requires:

- node >= 16.14.0
- npm >= 6.8.0
- git >= 2.11

## Licence

MIT
