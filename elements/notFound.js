import { Div } from "./index.js";

export default class NotFound extends Div {
  constructor() {
    super({ contents: "404" });
  }
}
