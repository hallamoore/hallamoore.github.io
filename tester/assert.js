window.assert = {
  equal: (actual, expected) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected} but received ${actual}`);
    }
  }
};
