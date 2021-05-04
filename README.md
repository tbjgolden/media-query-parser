# `media-query-parser`

[![npm version](https://img.shields.io/npm/v/media-query-parser.svg?style=flat-square)](https://www.npmjs.com/package/media-query-parser)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/media-query-parser?style=flat-square)
[![test coverage](https://img.shields.io/badge/dynamic/json?style=flat-square&color=brightgreen&label=coverage&query=%24.total.branches.pct&suffix=%25&url=https%3A%2F%2Funpkg.com%2Fmedia-query-parser%2Fcoverage%2Fcoverage-summary.json)](https://www.npmjs.com/package/media-query-parser)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/tbjgolden/media-query-parser/Release?style=flat-square)](https://github.com/tbjgolden/media-query-parser/actions?query=workflow%3ARelease)

- [x] **Parses correct CSS media queries**
- [x] **Fails on invalid CSS media queries**
- [x] **Spec-compliant** - https://www.w3.org/TR/mediaqueries-4/
- [x] **Zero-dependencies**
- [x] **TypeScript friendly**

Next steps are to create something similar to matchMedia

## Quickfire examples

```js
const { toAST } = require('media-query-parser')

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
// Returns null when it is not valid media query syntax
console.log(toAST('clearly this is not a valid media query')) // => null
// ...even the normal looking invalid ones
console.log(toAST('(max-width: 768px) and screen')) // => null
console.log(toAST('screen and (max-width: 768px) or (hover)')) // => null
```

## Considerations & Caveats

This library does:

- remove extra layers from unnecessary parentheses `(((((max-width: 768px)))))`
- parses units, numbers and other values to the spec
- handle unusual whitespace anywhere that the spec allows it
- contain many a unit test

This library does not (yet):

- sanity check the actual media features or their types `(max-power: infinite)`
  is as valid as `(hover: none)`
- normalize the media query features (e.g. `(max-width: -100px)` is always
  `false`)

These two objectives are both on the roadmap.

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

## Documentation

Full docs to come but auto-generated docs are at this link:

- [`API`](docs/api)

## License

MIT

<!-- Original starter readme: https://github.com/tbjgolden/create-typescript-react-library -->
