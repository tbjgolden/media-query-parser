# `media-query-parser`

> This package's v3 (currently in beta) involves a complete overhaul from v2 to a more sustainable
> shape.
> [See v2 API docs instead](https://github.com/tbjgolden/media-query-parser/tree/v2.0.2/docs/api#functions)

![npm](https://img.shields.io/npm/v/media-query-parser)
![npm type definitions](https://img.shields.io/npm/types/media-query-parser)
![license](https://img.shields.io/npm/l/media-query-parser)
![npm downloads](https://img.shields.io/npm/dw/media-query-parser)
[![install size](https://packagephobia.com/badge?p=media-query-parser)](https://packagephobia.com/result?p=media-query-parser)

- **Create a JS object from a CSS media queries**
- **Create a CSS media query from a JS object**
- **Returns a ParserError for invalid CSS media queries**
- **Spec-compliant** - https://www.w3.org/TR/mediaqueries-5/
  - **All valid queries parsed; e.g. `(100px < width < 200px)`**
- **Zero-dependencies**
- **Well tested**
- **TypeScript friendly**

> This repo/package contains only the parser, stringify and isParserError.
>
> `media-query-fns` uses this library internally to achieve common use-cases.

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
  //         feature: "width",
  //         context: "range",
  //         range: {
  //           featureName: "width",
  //           rightOp: "<=",
  //           rightToken: {
  //             type: "dimension",
  //             value: 768,
  //             unit: "px",
  //             flag: "number"
  //           },
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

- follow the spec's CSS syntax / media query parsing rules
- remove extra layers from unnecessary parentheses `(((((max-width: 768px)))))`
- handle unusual whitespace anywhere that the spec allows it

This library **will not**:

- sanity check the actual media features or their types beyond the parser rules; so
  `(max-power: infinite)` is as valid as `(min-width: 768px)`
- support `calc()` or `var()` - functions are disallowed by the spec, even though some browsers seem
  to support them. If/when the spec allows them they'll be added in a new major version

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
