// url should be something like:
// https://docs.google.com/spreadsheets/d/1x7nJULgHz3T1nljtLb5ZBSPIYnZ98QMagorjsUpQxWk/edit#gid=790763898
const idFromURLRegExp = new RegExp(/.*spreadsheets\/d\/([^/]*).*/);

class OpenProject extends Div {
  constructor() {
    const input = new Input();
    const button = new Button("Open Project");
    button.addEventListener("click", () => {
      this.clearError();
      this.setSpreadsheetIdFromURL(input.value);
    });
    super([input, button]);

    this.errorElement = new Div();
    if (window.history.state?.error) {
      this.setError(window.history.state.error);
    }
  }

  clearError() {
    this.errorElement.innerHTML = "";
    this.errorElement.remove();
  }

  setError(error) {
    this.errorElement.innerHTML = error;
    if (!this.errorElement.isConnected) {
      this.appendChild(this.errorElement);
    }
  }

  setSpreadsheetIdFromURL(url) {
    const match = idFromURLRegExp.exec(url);
    if (match) {
      window.history.pushState({}, "", `/invoicing/${match[1]}`);
    } else {
      this.setError("Unrecognized format");
    }
  }
}
