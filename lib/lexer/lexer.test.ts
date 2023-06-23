import { isParserError } from "../utils.js";
import { readCodepoints } from "./codepoints.js";
import { lexer } from "./lexer.js";
import {
  consumeEscape,
  consumeIdent,
  consumeIdentLike,
  consumeIdentUnsafe,
  consumeNumber,
  consumeNumeric,
  consumeString,
  consumeUrl,
} from "./tokens.js";

// codepoints
const c = (strings: TemplateStringsArray): number[] => readCodepoints(strings[0]);
// lexer without indexes
const l = (cssStr: string) => {
  const result = lexer(cssStr);
  return isParserError(result)
    ? result
    : result.map(({ start: _0, end: _1, isAfterSpace: _2, ...token }) => token);
};

test("consumeEscape", () => {
  expect(consumeEscape(c``, 0)).toEqual(null);
  expect(consumeEscape(c`"`, 0)).toEqual(null);
  // escape any
  expect(consumeEscape(c`\\'`, 0)?.[0]).toEqual(1);
  expect(String.fromCharCode(consumeEscape(c`\\'`, 0)?.[1] ?? -1)).toEqual("'");
  // escape hex
  expect(consumeEscape(c`\\0a`, 0)?.[0]).toEqual(2);
  expect(String.fromCharCode(consumeEscape(c`\\0a`, 0)?.[1] ?? -1)).toEqual("\n");
  // escape hex with trailing whitespace
  expect(consumeEscape(c`\\0a `, 0)?.[0]).toEqual(3);
  expect(String.fromCharCode(consumeEscape(c`\\0a `, 0)?.[1] ?? -1)).toEqual("\n");
  // escape hex with trailing whitespace + more
  expect(consumeEscape(c`\\0a hehe`, 0)?.[0]).toEqual(3);
  expect(String.fromCharCode(consumeEscape(c`\\0a hehe`, 0)?.[1] ?? -1)).toEqual("\n");
  // escape hex with no trailing whitespace
  expect(consumeEscape(c`\\0ahehe`, 0)?.[0]).toEqual(2);
  expect(String.fromCharCode(consumeEscape(c`\\0ahehe`, 0)?.[1] ?? -1)).toEqual("\n");

  expect(consumeEscape(c`\\0ahehe`, 1)).toEqual(null);
  expect(consumeEscape(c` \\0ahehe`, 0)).toEqual(null);
});

test("consumeString", () => {
  expect(consumeString(c`""`, 0)).toEqual([1, ""]);
  expect(consumeString(c`"""`, 0)).toEqual([1, ""]);
  expect(consumeString(c`'"'`, 0)).toEqual([2, '"']);
  expect(consumeString(c`"\\""`, 0)).toEqual([3, '"']);
  expect(consumeString(c`'"'`, 0)).toEqual([2, '"']);
  // escape any
  expect(consumeString(c`"\\'"`, 0)).toEqual([3, "'"]);
  // escape hex
  expect(consumeString(c`"\\0a"`, 0)).toEqual([4, "\n"]);
  // escape hex with trailing whitespace
  expect(consumeString(c`"\\0a "`, 0)).toEqual([5, "\n"]);
  // escape hex with trailing whitespace + more
  expect(consumeString(c`"\\0a hehe"`, 0)).toEqual([9, "\nhehe"]);
  // escape hex with no trailing whitespace
  expect(consumeString(c`"\\0ahehe"`, 0)).toEqual([8, "\nhehe"]);

  expect(consumeString(c`"typical string really"`, 0)).toEqual([22, "typical string really"]);
  expect(consumeString(c`"allow stuff like \\"escapes\\""`, 0)).toEqual([
    29,
    'allow stuff like "escapes"',
  ]);
  expect(consumeString(c`'Single quotes work too'`, 0)).toEqual([23, "Single quotes work too"]);
  expect(consumeString(c`'Mixing quotes does not"`, 0)).toEqual(null);
  expect(consumeString(c`"\\a9"`, 0)).toEqual([4, "©"]);
  expect(consumeString(c`"\\"`, 0)).toEqual(null);
  expect(consumeString(c`"\\\\"`, 0)).toEqual([3, "\\"]);
  expect(consumeString(c`"\\\\\\"`, 0)).toEqual(null);
  expect(consumeString(c`"\\\\\\\\"`, 0)).toEqual([5, "\\\\"]);

  expect(consumeString(c`"\n"`, 0)).toEqual(null);
  expect(consumeString(c`'\n'`, 0)).toEqual(null);
  expect(consumeString(c`''`, 0)).toEqual([1, ""]);
  expect(consumeString(c``, 0)).toEqual(null);
  expect(consumeString(c`"\\\u000A"`, 0)).toEqual(null);
});

test("consumeNumeric", () => {
  expect(consumeNumeric(c``, 0)).toEqual(null);
  expect(consumeNumeric(c`-`, 0)).toEqual(null);
  expect(consumeNumeric(c`+`, 0)).toEqual(null);
  expect(consumeNumeric(c`.`, 0)).toEqual(null);
  expect(consumeNumeric(c`.5`, 0)).toEqual([1, ["number", 0.5, "number"]]);
  expect(consumeNumeric(c`1`, 0)).toEqual([0, ["number", 1, "integer"]]);
  expect(consumeNumeric(c`+3rem`, 0)).toEqual([4, ["dimension", 3, "rem"]]);
  expect(consumeNumeric(c`-1ch`, 0)).toEqual([3, ["dimension", -1, "ch"]]);
  expect(consumeNumeric(c` -.5`, 1)).toEqual([3, ["number", -0.5, "number"]]);
  expect(consumeNumeric(c`  1e-1wow`, 2)).toEqual([8, ["dimension", 1e-1, "wow"]]);
  expect(consumeNumeric(c`  1e-1wow`, 0)).toEqual(null);
  expect(consumeNumeric(c`3e+1`, 0)).toEqual([3, ["number", 3e1, "number"]]);
  expect(consumeNumeric(c`.5e3% `, 0)).toEqual([4, ["percentage", 0.5e3]]);
  expect(consumeNumeric(c`2e10`, 0)).toEqual([3, ["number", 2e10, "number"]]);
  expect(consumeNumeric(c`1/2`, 0)).toEqual([0, ["number", 1, "integer"]]);
});

test("consumeNumber", () => {
  expect(consumeNumber(c``, 0)).toEqual(null);
  expect(consumeNumber(c`-`, 0)).toEqual(null);
  expect(consumeNumber(c`+`, 0)).toEqual(null);
  expect(consumeNumber(c`.`, 0)).toEqual(null);
  expect(consumeNumber(c`.5`, 0)).toEqual([1, 0.5, "number"]);
  expect(consumeNumber(c`1`, 0)).toEqual([0, 1, "integer"]);
  expect(consumeNumber(c`+3`, 0)).toEqual([1, 3, "integer"]);
  expect(consumeNumber(c`-1`, 0)).toEqual([1, -1, "integer"]);
  expect(consumeNumber(c`-.5`, 0)).toEqual([2, -0.5, "number"]);
  expect(consumeNumber(c`1e-1`, 0)).toEqual([3, 1e-1, "number"]);
  expect(consumeNumber(c`3e+1`, 0)).toEqual([3, 3e1, "number"]);
  expect(consumeNumber(c`.5e3`, 0)).toEqual([3, 0.5e3, "number"]);
  expect(consumeNumber(c`2e10`, 0)).toEqual([3, 2e10, "number"]);
  expect(consumeNumber(c`-10e+20`, 0)).toEqual([6, -10e20, "number"]);
  expect(consumeNumber(c`8181818`, 0)).toEqual([6, 8181818, "integer"]);
  expect(consumeNumber(c`-302.1010`, 0)).toEqual([8, -302.101, "number"]);
  expect(consumeNumber(c` -302.1010`, 1)).toEqual([9, -302.101, "number"]);
  expect(consumeNumber(c`1/2`, 0)).toEqual([0, 1, "integer"]);
  expect(consumeNumber(c` -302.1010`, 0)).toEqual(null);
});

test("consumeIdent", () => {
  expect(consumeIdent(c``, 0)).toEqual(null);
  expect(consumeIdent(c`-`, 0)).toEqual(null);
  expect(consumeIdent(c`-0`, 0)).toEqual(null);
  expect(consumeIdent(c`-a`, 0)).toEqual([1, "-a"]);
  expect(consumeIdent(c`--`, 0)).toEqual([1, "--"]);
  expect(consumeIdent(c`-\\41`, 0)).toEqual([3, "-A"]);
  expect(consumeIdent(c`_`, 0)).toEqual([0, "_"]);

  expect(consumeIdent(c`\\31 a2b3c`, 0)).toEqual([8, "1a2b3c"]);
  expect(consumeIdent(c`\\#fake-id`, 0)).toEqual([8, "#fake-id"]);
  expect(consumeIdent(c`-a-b-c-`, 0)).toEqual([6, "-a-b-c-"]);

  expect(consumeIdent(c`0`, 0)).toEqual(null);
  expect(consumeIdent(c`_a`, 0)).toEqual([1, "_a"]);
  expect(consumeIdent(c` abc`, 0)).toEqual(null);
  expect(consumeIdent(c` abc`, 1)).toEqual([3, "abc"]);
  expect(consumeIdent(c`url`, 0)).toEqual([2, "url"]);
  expect(consumeIdent(c`url(http://something.com)`, 0)).toEqual([2, "url"]);
});

test("consumeUrl", () => {
  expect(consumeUrl(c`url()`, 4)).toEqual([4, ""]);
  expect(consumeUrl(c`url(-)`, 4)).toEqual([5, "-"]);
  expect(consumeUrl(c`url(-0)`, 4)).toEqual([6, "-0"]);
  expect(consumeUrl(c`url(-a)`, 4)).toEqual([6, "-a"]);
  expect(consumeUrl(c`url( --)`, 4)).toEqual([7, "--"]);
  expect(consumeUrl(c`url(-\\41 )`, 4)).toEqual([9, "-A"]);
  expect(consumeUrl(c`url(_  )`, 4)).toEqual([7, "_"]);
  expect(consumeUrl(c`url(\\31 a2b3c)`, 4)).toEqual([13, "1a2b3c"]);
  expect(consumeUrl(c`url(\\#fake-id)`, 4)).toEqual([13, "#fake-id"]);
  expect(consumeUrl(c`url(-a-b -c-)`, 4)).toEqual(null);
  expect(consumeUrl(c`url(0)`, 4)).toEqual([5, "0"]);
  expect(consumeUrl(c`url(_a)`, 4)).toEqual([6, "_a"]);
  expect(consumeUrl(c`url( abc)`, 4)).toEqual([8, "abc"]);
  expect(consumeUrl(c`url( abc`, 4)).toEqual(null);
  expect(consumeUrl(c`url(abc)`, 3)).toEqual(null);
  expect(consumeUrl(c`url( url )`, 4)).toEqual([9, "url"]);
});

test("consumeIdentLike", () => {
  expect(consumeIdentLike(c``, 0)).toEqual(null);
  expect(consumeIdentLike(c`-`, 0)).toEqual(null);
  expect(consumeIdentLike(c`-0`, 0)).toEqual(null);
  expect(consumeIdentLike(c`-a`, 0)).toEqual([1, "-a", "ident"]);
  expect(consumeIdentLike(c`--`, 0)).toEqual([1, "--", "ident"]);
  expect(consumeIdentLike(c`-\\41`, 0)).toEqual([3, "-a", "ident"]);
  expect(consumeIdentLike(c`_`, 0)).toEqual([0, "_", "ident"]);

  expect(consumeIdentLike(c`\\31 a2b3c`, 0)).toEqual([8, "1a2b3c", "ident"]);
  expect(consumeIdentLike(c`\\#fake-id`, 0)).toEqual([8, "#fake-id", "ident"]);
  expect(consumeIdentLike(c`-a-b-c-`, 0)).toEqual([6, "-a-b-c-", "ident"]);

  expect(consumeIdentLike(c`0`, 0)).toEqual(null);
  expect(consumeIdentLike(c`_a`, 0)).toEqual([1, "_a", "ident"]);
  expect(consumeIdentLike(c` abc`, 0)).toEqual(null);
  expect(consumeIdentLike(c` abc`, 1)).toEqual([3, "abc", "ident"]);
  expect(consumeIdentLike(c`currentColor`, 0)).toEqual([11, "currentcolor", "ident"]);

  expect(consumeIdentLike(c`0`, 0)).toEqual(null);
  expect(consumeIdentLike(c`_a`, 0)).toEqual([1, "_a", "ident"]);
  expect(consumeIdentLike(c` abc`, 0)).toEqual(null);
  expect(consumeIdentLike(c` abc`, 1)).toEqual([3, "abc", "ident"]);
  expect(consumeIdentLike(c` abc(`, 1)).toEqual([4, "abc", "function"]);
  expect(consumeIdentLike(c`url(http://something.com)`, 0)).toEqual([
    24,
    "http://something.com",
    "url",
  ]);
  expect(consumeIdentLike(c`Url(http://google.com/logo.png)`, 0)).toEqual([
    30,
    "http://google.com/logo.png",
    "url",
  ]);
  expect(consumeIdentLike(c`url`, 0)).toEqual([2, "url", "ident"]);
  expect(consumeIdentLike(c`abc(   )`, 0)).toEqual([3, "abc", "function"]);
  expect(consumeIdentLike(c`abc(    `, 0)).toEqual([3, "abc", "function"]);
  expect(consumeIdentLike(c`url(    `, 0)).toEqual([3, "url", "function"]);
});

test("consumeIdentUnsafe", () => {
  expect(consumeIdentUnsafe(c``, 0)).toEqual(null);
  expect(consumeIdentUnsafe(c`-`, 0)).toEqual([0, "-"]);
  expect(consumeIdentUnsafe(c`-0`, 0)).toEqual([1, "-0"]);
  expect(consumeIdentUnsafe(c`-a`, 0)).toEqual([1, "-a"]);
  expect(consumeIdentUnsafe(c`--`, 0)).toEqual([1, "--"]);
  expect(consumeIdentUnsafe(c`-a-b-c-`, 0)).toEqual([6, "-a-b-c-"]);

  expect(consumeIdentUnsafe(c`0`, 0)).toEqual([0, "0"]);
  expect(consumeIdentUnsafe(c`_a`, 0)).toEqual([1, "_a"]);
  expect(consumeIdentUnsafe(c`~a`, 0)).toEqual(null);
  expect(consumeIdentUnsafe(c` abc`, 0)).toEqual(null);
  expect(consumeIdentUnsafe(c` abc`, 1)).toEqual([3, "abc"]);
  expect(consumeIdentUnsafe(c`##currentColor`, 0)).toEqual(null);
  expect(consumeIdentUnsafe(c`all\\0agood`, 0)).toEqual([9, "all\ngood"]);
  expect(consumeIdentUnsafe(c`all\\`, 0)).toEqual([2, "all"]);
  expect(consumeIdentUnsafe(c`all\\\n`, 0)).toEqual([2, "all"]);
  expect(consumeIdentUnsafe(c`\\\n`, 0)).toEqual(null);
});

test("old bugs", () => {
  expect(l("(min-width: -100px)")).toEqual([
    { type: "(" },
    { type: "ident", value: "min-width" },
    { type: "colon" },
    { flag: "number", type: "dimension", unit: "px", value: -100 },
    { type: ")" },
  ]);
  expect(lexer("(min-width: -100px)")).toEqual([
    { end: 0, start: 0, type: "(", isAfterSpace: false },
    { end: 9, start: 1, type: "ident", value: "min-width", isAfterSpace: false },
    { end: 10, start: 10, type: "colon", isAfterSpace: false },
    {
      end: 17,
      flag: "number",
      start: 12,
      type: "dimension",
      unit: "px",
      value: -100,
      isAfterSpace: true,
    },
    { end: 18, start: 18, type: ")", isAfterSpace: false },
  ]);

  expect(l(".dropdown-item:hover{color:#1e2125;background-color:#e9ecef}")).toEqual({
    end: 20,
    errid: "NO_LCURLY",
    start: 20,
  });
  expect(l("(1/2 < aspect-ratio < 1/1)")).toEqual([
    { type: "(" },
    { flag: "integer", type: "number", value: 1 },
    { type: "delim", value: 47 },
    { flag: "integer", type: "number", value: 2 },
    { type: "delim", value: 60 },
    { type: "ident", value: "aspect-ratio" },
    { type: "delim", value: 60 },
    { flag: "integer", type: "number", value: 1 },
    { type: "delim", value: 47 },
    { flag: "integer", type: "number", value: 1 },
    { type: ")" },
  ]);
});

test("missing coverage", () => {
  expect(l('"\n"')).toEqual({ end: 0, errid: "INVALID_STRING", start: 0 });
  expect(l("'\n'")).toEqual({ end: 0, errid: "INVALID_STRING", start: 0 });
  expect(l("#")).toEqual([{ type: "delim", value: 35 }]);
  expect(l("+3% +4 +2px")).toEqual([
    { flag: "number", type: "percentage", value: 3 },
    { flag: "integer", type: "number", value: 4 },
    { flag: "number", type: "dimension", unit: "px", value: 2 },
  ]);
  expect(l("-3% -4 -2px")).toEqual([
    { flag: "number", type: "percentage", value: -3 },
    { flag: "integer", type: "number", value: -4 },
    { flag: "number", type: "dimension", unit: "px", value: -2 },
  ]);
  expect(l(".3% .4 .2px")).toEqual([
    { flag: "number", type: "percentage", value: 0.3 },
    { flag: "number", type: "number", value: 0.4 },
    { flag: "number", type: "dimension", unit: "px", value: 0.2 },
  ]);
  expect(l("+2.")).toEqual([
    { flag: "integer", type: "number", value: 2 },
    { type: "delim", value: 46 },
  ]);
  expect(l("<!-- -->")).toEqual([{ type: "CDO" }, { type: "CDC" }]);
  expect(l("@")).toEqual([{ type: "delim", value: 64 }]);
  expect(l("\\ \\\n")).toEqual([
    { type: "ident", value: " " },
    { type: "delim", value: 92 },
  ]);
  expect(l("a/**/b")).toEqual([
    { type: "ident", value: "a" },
    { type: "ident", value: "b" },
  ]);
  expect(l("a/*b")).toEqual([{ type: "ident", value: "a" }]);
  expect(l("a/**b")).toEqual([{ type: "ident", value: "a" }]);
  expect(l("/* * / * */b")).toEqual([{ type: "ident", value: "b" }]);
});
