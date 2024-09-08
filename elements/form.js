import Element from "./element.js";

export default class Form extends Element {
  constructor(args) {
    super({ ...args, tagName: "form" });
  }
}
