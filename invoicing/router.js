const PATH_VAR = Symbol("PATH_VAR");
const PATH_VAR_NAME = Symbol("PATH_VAR_NAME");
const COMPONENT = Symbol("COMPONENT");
const PATH_VAR_REGEXP = new RegExp(/^{([^{}]*)}$/);

class Router {
  constructor({ ignorePrefix }) {
    this.ignorePrefix = ignorePrefix;
    this.routes = {};
  }

  getPathParts(path) {
    return path.split("/").filter(p => p !== "");
  }

  add(route, component) {
    const parts = this.getPathParts(route);
    let routes = this.routes;
    for (let part of parts) {
      const match = PATH_VAR_REGEXP.exec(part);
      if (match) {
        if (routes[PATH_VAR] === undefined) {
          routes[PATH_VAR] = { [PATH_VAR_NAME]: match[1] };
        }
        routes = routes[PATH_VAR];
      } else {
        if (routes[part] === undefined) {
          routes[part] = {};
        }
        routes = routes[part];
      }
    }
    routes[COMPONENT] = component;
  }

  getElement(path) {
    const vars = {};
    const parts = this.getPathParts(path);
    let routes = this.routes;

    for (let part of parts) {
      if (routes[part] !== undefined) {
        routes = routes[part];
        continue;
      }
      if (routes[PATH_VAR] === undefined) {
        return new Div("404");
      }
      routes = routes[PATH_VAR];
      vars[routes[PATH_VAR_NAME]] = part;
    }

    if (routes[COMPONENT] === undefined) {
      return new Div("404");
    }

    const elem = new routes[COMPONENT]();
    for (let [key, value] of Object.entries(vars)) {
      elem.setAttribute(key, value);
    }
    return elem;
  }

  renderCurrentRoute = () => {
    let path = window.location.pathname;
    if (path.startsWith(this.ignorePrefix)) {
      path = path.substring(this.ignorePrefix.length);
    }
    const elem = router.getElement(path);
    document.body.replaceChildren(elem);
  };

  attach() {
    const origReplaceState = window.history.replaceState;
    window.history.replaceState = (...args) => {
      origReplaceState.call(window.history, ...args);
      this.renderCurrentRoute();
    };

    window.onload = this.renderCurrentRoute;
  }
}
