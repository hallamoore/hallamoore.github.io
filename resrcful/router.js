import NotFoundPage from "./pages/not_found.js";
import IndexPage from "./pages/index.js";

const routes = {};

function addRoute(path, page) {
  routes[path] = page;
}

export class Redirect {
  constructor(path) {
    this.path = path;
  }
}

function loadRoute(path) {
  const page = routes[path]?.build() || NotFoundPage.build();
  if (page instanceof Redirect) {
    history.pushState("", "", location.origin + page.path);
    return loadRoute(page.path);
  }
  document.body.textContent = "";
  document.body.appendChild(page);
}

addRoute("/404", NotFoundPage);
addRoute("/", IndexPage);

loadRoute(location.pathname.split("/resrcful").at(-1));
