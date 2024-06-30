import ElementQuery from "./elementQuery.js";

export default class UI {
  constructor({ container = document.body } = {}) {
    this.iframe = document.createElement("iframe");
    container.appendChild(this.iframe);
  }

  loadUrl(url) {
    if (url.startsWith("/")) {
      url = window.location.origin + url;
    }
    const onloadPromise = new Promise(res => {
      this.iframe.onload = res;
    });
    this.iframe.src = window.location.origin + "/food";
    return onloadPromise;
  }

  back() {
    this.iframe.contentWindow.history.back();
  }

  forward() {
    this.iframe.contentWindow.history.forward();
  }

  hasContent = () => {
    return this.iframe.contentDocument.body.innerHTML !== "";
  };

  query(q) {
    return new ElementQuery(this.iframe.contentDocument, q);
  }

  waitUntil(fn, { timeout = 5000 } = {}) {
    return new Promise(async (res, rej) => {
      let lastError;
      const start = Date.now();
      while (Date.now() - start < timeout) {
        try {
          const result = await fn();
          if (result !== false) {
            res();
            return;
          }
        } catch (e) {
          lastError = e;
        }
        await new Promise(res => setTimeout(res, 500));
      }
      console.error(lastError);
      rej(`Timed out: ${fn.description}`);
    });
  }
}
