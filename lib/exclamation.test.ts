import { exclamation } from "./exclamation.js";

test("exclamation says exclamation", () => {
  expect(exclamation("world")).toBe(`world!`);
});
