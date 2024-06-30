import Test from "./test.js";

export default class TestContainer {
  constructor(parentContainer, description) {
    this.parentContainer = parentContainer;
    this.childContainers = [];
    this.description = description;
    this.tests = [];
  }

  createChildContainer(description) {
    const childContainer = new TestContainer(this, description);
    this.childContainers.push(childContainer);
    return childContainer;
  }

  addTest(label, test) {
    this.tests.push(new Test(label, test));
  }

  async runTests(prefix, args) {
    let results = [];
    const nextPrefix = prefix
      ? `${prefix} > ${this.description}`
      : this.description;
    for (let childContainer of this.childContainers) {
      results = results.concat(await childContainer.runTests(nextPrefix, args));
    }
    for (let test of this.tests) {
      results.push(await test.run(nextPrefix, args));
    }
    return results;
  }
}
