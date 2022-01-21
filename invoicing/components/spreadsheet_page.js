const SpreadsheetPage = defineElement(
  "div",
  "spreadsheet-page",
  class extends HTMLDivElement {
    build(spreadsheetId) {
      this.innerHTML = `Loading spreadsheet ${spreadsheetId}...`;
    }

    async lookupTitle(spreadsheetId) {
      try {
        const title = await new API(spreadsheetId).getSpreadsheetTitle();
        this.updateTitle(title);
      } catch (err) {
        console.error(err);
        window.history.pushState(
          { error: "Unable to load project" },
          "",
          "/invoicing"
        );
      }
    }

    updateTitle(title) {
      this.innerHTML = `Loaded ${title}.`;
    }

    connectedCallback() {
      const spreadsheetId = this.getAttribute("spreadsheetid");
      this.build(spreadsheetId);
      this.lookupTitle(spreadsheetId);
    }
  }
);
