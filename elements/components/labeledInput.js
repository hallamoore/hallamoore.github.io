import { Div, Input, Label } from "../basicElements.js";

export default class LabeledInput extends Div {
  constructor({ label, attrs }) {
    const input = new Input({ attrs });
    super({
      contents: [new Label({ contents: label }), input],
    });
    this.input = input;
  }

  get value() {
    return this.input.element.value;
  }

  set value(value) {
    this.input.element.value = value;
  }
}
