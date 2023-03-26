import { setCookie } from "../cookies.js";

class Blah {
  constructor() {
    const description = document.createElement("div");
    description.textContent =
      "Enter the url to a google spreadsheet. We'll use this spreadsheet to save your data. You can create a new empty spreadsheet to get started with a new project, or you can enter a previously used spreadsheet to load an existing project.";
    const input = document.createElement("input");
    input.oninput = this.checkError;
    const button = document.createElement("button");
    button.onclick = this.onClick;
    button.textContent = "Submit";
    const wrapper = document.createElement("div");
    wrapper.appendChild(description);
    wrapper.appendChild(input);
    wrapper.appendChild(button);
    this.element = wrapper;
  }

  onClick = (ev) => {
    const { value } = ev.target.previousSibling;
    const match = value.match(/docs\.google\.com\/spreadsheets\/d\/([^/]*)/);
    if (!match) {
      return this.showError();
    }
    setCookie("gSpreadsheetId", match[1]);
    location.href = location.origin;
  };

  showError = () => {
    if (this.error?.isConnected) return;
    if (!this.error) {
      this.error = document.createElement("div");
      this.error.textContent = "Invalid url";
    }
    this.element.appendChild(this.error);
  };

  checkError = (ev) => {
    if (!this.error?.isConnected) return;
    if (ev.target.value.match(/docs\.google\.com\/spreadsheets\/d\/([^/]*)/)) {
      this.error.remove();
    }
  };
}

export default {
  build() {
    return new Blah().element;
  },
};
