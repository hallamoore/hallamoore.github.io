import { Div } from "../basicElements.js";

export default class NotFound extends Div {
  constructor() {
    super({ contents: "404" });
  }
}
