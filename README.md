```sh
git clone https://github.com/tbjgolden/media-query-parser.git cool-package-name
cd cool-package-name
npx find-repl media-query-parser cool-package-name
rm -rf .git
git init
npm install
```

---

# media-query-parser

![banner](banner.svg)

![npm](https://img.shields.io/npm/v/media-query-parser)
![npm type definitions](https://img.shields.io/npm/types/media-query-parser)
![license](https://img.shields.io/npm/l/media-query-parser)
[![install size](https://packagephobia.com/badge?p=media-query-parser)](https://packagephobia.com/result?p=media-query-parser)

A npm library that does exactly what it says on the tin.

## Background

- Cover motivation.
- Cover abstract dependencies.
- Cover compatible versions of Node, npm and ECMAScript.
- Cover similar packages and alternatives.

## Install

This package is available from the `npm` registry.

```sh
npm install media-query-parser
```

## Usage

```sh
npx media-query-parser ...
```

Supports JavaScript + TypeScript:

```ts
import { foo } from "media-query-parser";

foo();
```

Can also be imported via `require("media-query-parser")`.

## API

...

## Credits

...

## Contributing

- State where users can ask questions.
- State whether PRs are accepted.
- List any requirements for contributing; for instance, having a sign-off on commits.

Dev environment requires:

- node >= 16.14.0
- npm >= 6.8.0
- git >= 2.11

## Licence

Apache-2.0
