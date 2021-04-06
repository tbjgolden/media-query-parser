# `media-query-parser`

[![npm version](https://img.shields.io/npm/v/media-query-parser.svg?style=flat-square)](https://www.npmjs.com/package/media-query-parser)
[![test coverage](https://img.shields.io/badge/dynamic/json?style=flat-square&color=brightgreen&label=coverage&query=%24.total.branches.pct&suffix=%25&url=https%3A%2F%2Funpkg.com%2Fmedia-query-parser%2Fcoverage%2Fcoverage-summary.json)](https://www.npmjs.com/package/media-query-parser)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/tbjgolden/media-query-parser/Release?style=flat-square)](https://github.com/tbjgolden/media-query-parser/actions?query=workflow%3ARelease)

> **Parse CSS media queries**

The following components are supported (plus any min- and max- prefixes where applicable):

- any-hover
- any-pointer
- aspect-ratio
- color
- color-gamut
- color-index
- device-aspect-ratio
- device-height
- device-width
- display-mode
- forced-colors
- grid
- height
- hover
- inverted-colors
- monochrome
- orientation
- overflow-block
- overflow-inline
- pointer
- prefers-color-scheme
- prefers-contrast
- prefers-reduced-motion
- prefers-reduced-transparency
- resolution
- scan
- scripting
- update
- width

Can also parse short-hand syntax like `(400px <= width <= 700px)`.

## Installation

```sh
npm install media-query-parser --save
# yarn add media-query-parser
```

Alternatively, there are also client web builds available:

<!-- IMPORTANT: Do not delete or change the comments in the code block below -->

```html
<!-- Dependencies -->

<!-- window.MediaQueryParser -->
<script src="https://unpkg.com/media-query-parser/dist/media-query-parser.umd.js"></script>
```

## Documentation

- [`Docs`](docs)
- [`API`](docs/api)

## License

MIT

<!-- Original starter readme: https://github.com/tbjgolden/create-typescript-react-library -->
