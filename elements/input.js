import Element from "./element.js";
import Label from "./label.js";

export default class Input extends Element {
  constructor({ label, ...args }) {
    if (!label) {
      return super({ tagName: "input", ...args });
    }
    const input = new Input(args);
    super({
      tagName: "div",
      contents: [new Label({ contents: label }), input]
    });
    this.input = input;
  }

  get inputElement() {
    return this.input ? this.input.element : this.element;
  }

  get value() {
    return this.inputElement.value;
  }

  set value(value) {
    this.inputElement.value = value;
  }
}
