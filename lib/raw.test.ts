import fs from "node:fs";
import path from "node:path";
import { isParserError, parseMediaQueryList } from "./index.js";

test("parseMediaQueryList", () => {
  const testQueryLists: string[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "lib/__fixtures__/raw.json"), "utf8")
  );
  const errorsMap: [string, number[]][] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "lib/__fixtures__/errors.json"), "utf8")
  );

  const shouldBeErrorSet = new Set([
    `print" is not supported in IE6 or 7.  Fully patched IE8 should be OK */\n@media print`,
    `statement leaving one of the breakpoints\n *                 outside a @media query let's you use the grid in IE8.\n *  \n */\n.grid-order`,
    "(resolution: 2dppx), (-webkit-device-pixel-ratio: 2), (-moz-device-pixel-ratio: 2), (resolution: 192dpi)'",
    `(min-resolution: 192dpi), (-webkit-min-device-pixel-ratio: 2), (min--moz-device-pixel-ratio: 2)'`,
    `(max-width: 350px), (min-width: 500px) and (max-width: 600px)'`,
    `(min-width: 500px), tv and (min-width: 700px) and (color)'`,
    `(min-width: 31.25em), tv and (min-width: 43.75em) and (color)'`,
    `(height: 500px)'`,
    "(lion: 500px)'",
    "(orientation: portrait)'",
    "(height: 31.25em)'",
    "(lion: 31.25em)'",
    "not screen and (min-width: 500px)'",
  ]);

  const mqlErrorIndexMap = new Map<string, number[]>(errorsMap);

  for (const testQueryList of testQueryLists) {
    const mql = parseMediaQueryList(testQueryList);
    expect(isParserError(mql)).toBe(shouldBeErrorSet.has(testQueryList));
    if (!isParserError(mql)) {
      const neverQueries: number[] = [];
      for (const [i, mq] of mql.qs.entries()) {
        if (!mq || (mq.prefix === "not" && mq.type === "all" && mq.condition === undefined)) {
          neverQueries.push(i);
        }
      }
      expect(neverQueries).toEqual(mqlErrorIndexMap.get(testQueryList) ?? []);
    }
  }
});
