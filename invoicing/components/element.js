class Element {
  // Parent helper for a) being able to construct elements with `new` and b) being able to pass
  // children in directly. E.g. with the Div child class (see below), we can now do `elem = new Div("hi")`
  // instead of `elem = document.createElement('div'); elem.innerHTML = "hi"`.
  constructor(tag, children = [], customizedAs) {
    if (!(children instanceof Array)) {
      children = [children];
    }
    const element = document.createElement(tag, { is: customizedAs });
    for (let child of children) {
      if (typeof child === "string") {
        element.innerHTML += child;
      } else {
        element.appendChild(child);
      }
    }
    for (let key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
      if (element[key] === undefined) {
        element[key] = this[key];
      }
    }
    return element;
  }
}

function defineElement(builtInTag, customTag, element) {
  // Callbacks like `connectedCallback` have to be defined directly on a class implementation that
  // inherits from HTMLElement or its subclasses. I haven't found any working way to copy it
  // to a different element's prototype or anything like that. So, just create that subclass and
  // then pass it through this function to register it with customElements and get back an
  // Element subclass instead.
  customElements.define(customTag, element, { extends: builtInTag });
  return class extends Element {
    constructor(children) {
      super(builtInTag, children, customTag);
    }
  };
}

class Div extends Element {
  constructor(...args) {
    super("div", ...args);
  }
}

class Button extends Element {
  constructor(...args) {
    super("button", ...args);
  }
}

class Input extends Element {
  constructor(...args) {
    super("input", ...args);
  }
}
