import testCase1 from "./data/test_case_1.js";
import { schedule } from "../scheduler.js";
import { diffValue, formatSchedulerOutput } from "./utils.js";

export default function test() {
  const start = Date.now();
  const output = schedule(testCase1.input);
  const end = Date.now();
  console.log("time:", end - start);
  const expected = formatSchedulerOutput(testCase1.expectedOutput);
  const actual = formatSchedulerOutput(output);
  const diff = diffValue(expected, actual, "output");
  if (diff) {
    console.log("test_scheduler FAILED");
    console.log("expected:", expected);
    console.log("actual:", actual);
    console.log("diff:", diff);
  } else {
    console.log("test_scheduler PASSED");
  }
}
