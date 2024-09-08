import Element from "./element.js";

export default class Label extends Element {
  constructor(args) {
    super({ ...args, tagName: "label" });
  }
}
