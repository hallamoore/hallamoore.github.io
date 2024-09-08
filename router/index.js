import { Element } from "../elements/index.js";
import Login from "../elements/login.js";
import NotFound from "../elements/notFound.js";
import { getCookie } from "../cookies.js";

const PATH_VAR = Symbol("PATH_VAR");
const PATH_VAR_NAME = Symbol("PATH_VAR_NAME");
const COMPONENT = Symbol("COMPONENT");
const REQUIRE_AUTH = Symbol("REQUIRE_AUTH");
const PATH_VAR_REGEXP = new RegExp(/^{([^{}]*)}$/);

export class Redirect {
  constructor(path) {
    this.path = path;
  }
}

const getPathParts = (path) => path.split("/").filter((p) => p !== "");

export default class Router {
  constructor({ prefix, notFoundComponent, requireAuth, sessionCookieName, loginComponent }) {
    this.prefix = prefix;
    this.notFoundComponent = notFoundComponent;

    this.defaultRequireAuth = requireAuth;
    this.sessionCookieName = sessionCookieName;

    this.routes = {};

    if (loginComponent) {
      this.addRoute("/login", loginComponent, { requireAuth: false });
    }
  }

  addRoute(path, component, { requireAuth } = {}) {
    const parts = getPathParts(this.prefix + path);
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
    routes[REQUIRE_AUTH] = requireAuth ?? this.defaultRequireAuth;
  }

  buildElementFromComponent(component, args) {
    if (component instanceof Redirect) {
      window.history.pushState(
        { originalUrl: window.location.href },
        "",
        window.location.origin + this.prefix + component.path
      );
      return null;
    }

    if (component.prototype instanceof Element || component === Element) {
      return new component(args).element;
    }

    const element = component(args);
    return element instanceof Element ? element.element : element;
  }

  isLoggedIn() {
    return getCookie(this.sessionCookieName);
  }

  getComponentAndVarsForPath(path) {
    const vars = {};
    const parts = getPathParts(path);
    let routes = this.routes;

    for (let part of parts) {
      if (routes[part] !== undefined) {
        routes = routes[part];
        continue;
      }
      if (routes[PATH_VAR] === undefined) {
        if (this.defaultRequireAuth && !this.isLoggedIn()) {
          return { component: new Redirect("/login"), vars };
        }
        return { component: this.notFoundComponent, vars };
      }
      routes = routes[PATH_VAR];
      vars[routes[PATH_VAR_NAME]] = part;
    }

    if (routes[COMPONENT] === undefined) {
      if (this.defaultRequireAuth && !this.isLoggedIn()) {
        return { component: new Redirect("/login"), vars };
      }
      return { component: this.notFoundComponent, vars };
    }

    if (routes[REQUIRE_AUTH] && !this.isLoggedIn()) {
      return { component: new Redirect("/login"), vars };
    }

    return { component: routes[COMPONENT], vars };
  }

  renderRoute = () => {
    let path = window.location.pathname;
    const { component, vars } = this.getComponentAndVarsForPath(path);
    const element = this.buildElementFromComponent(component, vars);

    // example of when element is `null` and we specifically don't want to
    // replace children is /food/test. The tester attaches an iframe itself,
    // and we can't just return the iframe and attach it here because it also
    // starts running the tests, which requires the iframe to already be
    // attached.
    if (element) {
      document.body.replaceChildren(element);
    }
  };

  attach() {
    const origPushState = window.history.pushState;
    window.history.pushState = (state, _, url, { render = true } = {}) => {
      origPushState.call(window.history, state, _, url);
      if (render) {
        this.renderRoute();
      }
    };
    window.onpopstate = this.renderRoute;
    window.onload = this.renderRoute;
    window.router = this;
  }

  pushQueryParam(key, value) {
    const [url, qParamsString] = window.location.href.split("?");
    const qParams = new URLSearchParams(qParamsString);
    qParams.set(key, value);
    window.history.pushState(window.history.state, "", `${url}?${qParams}`, {
      render: false,
    });
  }

  getQueryParam(key) {
    return new URLSearchParams(window.location.search).get(key);
  }
}
