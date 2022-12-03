# `media-query-parser`

[![npm version](https://img.shields.io/npm/v/media-query-parser.svg?style=flat-square)](https://www.npmjs.com/package/media-query-parser)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/media-query-parser?style=flat-square)
![npm downloads](https://img.shields.io/npm/dw/media-query-parser)
[![test coverage](https://img.shields.io/badge/dynamic/json?style=flat-square&color=brightgreen&label=coverage&query=%24.total.branches.pct&url=https%3A%2F%2Fraw.githubusercontent.com%2Ftbjgolden%2Fmedia-query-parser%2Fmain%2Fcoverage%2Fcoverage-summary.json)](https://www.npmjs.com/package/media-query-parser)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/tbjgolden/media-query-parser/Release?style=flat-square)](https://github.com/tbjgolden/media-query-parser/actions?query=workflow%3ARelease)

- [x] **Parses correct CSS media queries**
- [x] **Fails on invalid CSS media queries**
- [x] **Spec-compliant** - https://www.w3.org/TR/mediaqueries-5/
  - [x] **All valid queries parsed, even newer ones like  
         `@media (100px < width < 200px)`**
- [x] **Zero-dependencies**
- [x] **TypeScript friendly**

## Quickfire examples

```js
import { toAST } from 'media-query-parser'

// Simple responsive media query
console.log(toAST('(max-width: 768px)'))
/* [
  {
    "mediaPrefix":null,
    "mediaType":"all",
    "mediaCondition":{
      "operator":null,
      "children":[
        {"context":"value",
         "prefix":"max",
         "feature":"width",
         "value":{"type":"<dimension-token>","value":768,"unit":"px","flag":"number"}
        }
      ]
    }
  }
] */

// Supports comma separated media-query lists
console.log(toAST('print, (not (color))'))
// Trims the `@media` if it starts with it, the `{` and anything that follows
console.log(toAST('@media screen { body { background: #000 } }'))
// Full support for new range syntax
console.log(toAST('(100px < width < 200px)'))
// ...which was no mean feat...
console.log(toAST('(4/3 <= aspect-ratio <= 16/9)'))
// Throws an Error with invalid media query syntax
console.log(toAST('clearly this is not a valid media query')) // => Error

// ...even the normal looking but invalid ones:
console.log(toAST('(max-width: 768px) and screen')) // => Error
// explanation: screen can only appear at the start of a media query
console.log(toAST('screen and (max-width: 768px) or (hover)')) // => Error
// explanation: spec disallows `and` and `or` on same level as ambiguous
```

## Considerations & Caveats

This library does:

- remove extra layers from unnecessary parentheses `(((((max-width: 768px)))))`
- parses units, numbers and other values according to the spec
- handle unusual whitespace anywhere that the spec allows it
- contain many a unit test

This library does not:

- sanity check the actual media features or their types `(max-power: infinite)`
  is as valid as `(hover: none)` - see
  [media-query-fns](https://github.com/tbjgolden/media-query-fns)
- contain anything that converts the AST back into a media query - watch this
  space

## Installation

```sh
npm install media-query-parser --save
# yarn add media-query-parser
```

Alternatively, there are also client web builds available:

```html
<!-- window.MediaQueryParser -->
<script src="https://unpkg.com/media-query-parser/dist/media-query-parser.umd.js"></script>
```

## [`API`](api)

## License

MIT

<!-- Original starter readme: https://github.com/tbjgolden/create-typescript-react-library -->
