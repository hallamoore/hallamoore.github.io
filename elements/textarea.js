import Input from "./input.js";

export default class Textarea extends Input {
  constructor(args) {
    super({ ...args, tagName: "textarea" });
  }
}
