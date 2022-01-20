class NotFound extends Error {
  constructor() {
    super("Not Found");
  }
}

class API {
  constructor(spreadsheetId) {
    this.spreadsheetId = spreadsheetId;
    this.url =
      "https://script.google.com/macros/s/" +
      "AKfycbwO7wWS1IrdqYb5VZaHoIFPYkRmXnDWX4MH2rhMDr69gieZ-KAmSuQ4afAD3cvRKAj1IQ" +
      "/exec";
  }

  async makeRequest(path, params) {
    const searchParams = new URLSearchParams({
      ...params,
      path,
      spreadsheetId: this.spreadsheetId
    });
    const resp = await fetch(`${this.url}?${searchParams}`);
    const data = await resp.json();
    if (Number(data.status) === 404) {
      throw new NotFound();
    }
    return data;
  }

  async getSpreadsheetTitle() {
    return (await this.makeRequest(`/metadata`, { fields: "title" })).title;
  }
}
