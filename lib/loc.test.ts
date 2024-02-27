import { isParserError, parseMediaQuery, parseMediaCondition, parseMediaFeature } from "./index.js";

test("location (start, end) validation", () => {
  const mqStr = "only screen and (a: 1.3)";
  const mq = parseMediaQuery(mqStr);
  if (isParserError(mq)) {
    expect(mq).toBe(0);
  } else {
    expect(mqStr.slice(mq.start, mq.end + 1)).toEqual("only screen and (a: 1.3)");
  }

  const mqcStr = "not (a: 1.3)";
  const mqc = parseMediaCondition(mqcStr);
  if (isParserError(mqc)) {
    expect(mqc).toBe(0);
  } else {
    expect(mqcStr.slice(mqc.start, mqc.end + 1)).toEqual("not (a: 1.3)");
  }

  const mqfStr = "(a: 1.3)";
  const mqf = parseMediaFeature(mqfStr);
  if (isParserError(mqf)) {
    expect(mqf).toBe(0);
  } else {
    expect(mqfStr.slice(mqf.start, mqf.end + 1)).toEqual("a: 1.3");
  }
});
