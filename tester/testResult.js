export default class TestResult {
  constructor({ fullTestName, passed, error }) {
    this.fullTestName = fullTestName;
    this.passed = passed;
    this.error = error;
  }

  report() {
    if (this.passed) {
      console.log(`PASSED: ${this.fullTestName}`);
    } else {
      console.log(`FAILED: ${this.fullTestName}`);
      console.log(this.error);
    }
  }
}
