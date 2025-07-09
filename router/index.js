import { Element } from "../elements/index.js";
import { getCookie } from "../cookies.js";

const CALLBACK = Symbol("CALLBACK");
const PATH_VAR = Symbol("PATH_VAR");
const PATH_VAR_NAME = Symbol("PATH_VAR_NAME");

const PATH_VAR_REGEXP = new RegExp(/^{([^{}]*)}$/);

const getPathParts = (path) => path.split("/").filter((p) => p !== "");

export default class Router {
  constructor({ prefix, notFoundComponent, requireAuth, sessionCookieName, loginComponent }) {
    this.prefix = prefix;
    this.notFoundComponent = notFoundComponent;

    this.defaultRequireAuth = requireAuth;
    this.sessionCookieName = sessionCookieName;

    this.routes = {};

    if (loginComponent) {
      this.renderComponentOnRoute("/login", loginComponent, { requireAuth: false });
    }
  }

  wrapCallbackWithAuthCheck(callback) {
    return (...args) => {
      if (!this.isLoggedIn()) {
        return this.redirect("/login");
      }
      return callback(...args);
    };
  }

  onRoute(pathTemplate, callback, { requireAuth } = {}) {
    if (requireAuth ?? this.defaultRequireAuth) {
      callback = this.wrapCallbackWithAuthCheck(callback);
    }

    const parts = getPathParts(this.prefix + pathTemplate);
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
    routes[CALLBACK] = callback;
  }

  renderComponentOnRoute(pathTemplate, component, { requireAuth } = {}) {
    this.onRoute(
      pathTemplate,
      ({ pathVars }) => {
        const element = this.buildElementFromComponent(component, pathVars);
        document.body.replaceChildren(element);
      },
      { requireAuth }
    );
  }

  buildElementFromComponent(component, args) {
    if (component.prototype instanceof Element || component === Element) {
      return new component(args).init().element;
    }

    const element = component(args);
    return element instanceof Element ? element.init().element : element;
  }

  isLoggedIn() {
    return getCookie(this.sessionCookieName);
  }

  redirect(path) {
    window.history.pushState(
      { originalUrl: window.location.href },
      "",
      window.location.origin + this.prefix + path
    );
  }

  onRouteNotFound() {
    if (this.defaultRequireAuth && !this.isLoggedIn()) {
      return this.redirect("/login");
    }
    const element = this.buildElementFromComponent(this.notFoundComponent);
    document.body.replaceChildren(element);
  }

  loadRoute() {
    let path = window.location.pathname;
    const pathVars = {};
    const pathParts = getPathParts(path);
    console.log(this);
    let routes = this.routes;

    for (let part of pathParts) {
      if (routes[part] !== undefined) {
        routes = routes[part];
        continue;
      }
      if (routes[PATH_VAR] === undefined) {
        return this.onRouteNotFound();
      }
      routes = routes[PATH_VAR];
      pathVars[routes[PATH_VAR_NAME]] = part;
    }

    if (routes[CALLBACK] === undefined) {
      return this.onRouteNotFound();
    }

    return routes[CALLBACK]({ path, pathVars });
  }

  attach() {
    const origPushState = window.history.pushState;
    window.history.pushState = (state, _, url, { loadRoute = true } = {}) => {
      origPushState.call(window.history, state, _, url);
      if (loadRoute) {
        this.loadRoute();
      }
    };
    window.onpopstate = this.loadRoute.bind(this);
    window.onload = this.loadRoute.bind(this);
    window.router = this;
    return this;
  }

  pushQueryParam(key, value) {
    const [url, qParamsString] = window.location.href.split("?");
    const qParams = new URLSearchParams(qParamsString);
    qParams.set(key, value);
    window.history.pushState(window.history.state, "", `${url}?${qParams}`, {
      loadRoute: false,
    });
  }

  getQueryParam(key) {
    return new URLSearchParams(window.location.search).get(key);
  }
}
