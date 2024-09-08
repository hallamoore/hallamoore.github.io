import Element from "./element.js";

export default class Div extends Element {
  constructor(args) {
    super({ ...args, tagName: "div" });
  }
}
