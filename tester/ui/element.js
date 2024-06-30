export default class Element {
  constructor(elem) {
    this.htmlElement = elem;
  }

  type(text) {
    this.htmlElement.value += text;
    return this;
  }

  click() {
    this.htmlElement.click();
    return this;
  }

  get innerText() {
    return this.htmlElement.innerText;
  }
}
