import TestResult from "./testResult.js";

export default class Test {
  constructor(label, testFn) {
    this.label = label;
    this.testFn = testFn;
  }

  async run(prefix, args) {
    let passed = true;
    let error;
    try {
      await this.testFn(args);
    } catch (err) {
      passed = false;
      error = err;
    }
    return new TestResult({
      fullTestName: `${prefix} > ${this.label}`,
      passed,
      error
    });
  }
}
