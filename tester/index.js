import "./assert.js";
import TestContainer from "./testContainer.js";

let currentContainer = new TestContainer(null, "");

window.describe = (description, registerTests) => {
  currentContainer = currentContainer.createChildContainer(description);
  registerTests();
  currentContainer = currentContainer.parentContainer;
};

window.it = (label, testFn) => currentContainer.addTest(label, testFn);

const runTests = async args => {
  const results = await currentContainer.runTests("", args);
  results.forEach(r => r.report());
};

export default runTests;
