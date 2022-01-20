const SpreadsheetPage = defineElement(
  "div",
  "spreadsheet-page",
  class extends HTMLDivElement {
    build(spreadsheetId) {
      this.innerHTML = `Loading spreadsheet ${spreadsheetId}...`;
    }

    async lookupTitle() {
      try {
        title = await new API(spreadsheetId).getSpreadsheetTitle();
        this.updateTitle(title);
      } catch (e) {
        window.history.replaceState({}, "", "/invoicing");
      }
    }

    updateTitle(title) {
      this.innerHTML = `Loaded ${title}.`;
    }

    connectedCallback() {
      const spreadsheetId = this.getAttribute("spreadsheetid");
      this.build(spreadsheetId);
      this.lookupTitle();
    }
  }
);
