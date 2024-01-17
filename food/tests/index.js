import runTests from "../../tester/index.js";
import UI from "../../tester/ui/index.js";
import "./navigation.js";

export default () => {
  const ui = new UI();
  runTests({ ui });
};
