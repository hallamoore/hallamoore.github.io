import Element from "./element.js";

export default class Button extends Element {
  constructor(args) {
    super({ ...args, tagName: "button" });
  }
}
