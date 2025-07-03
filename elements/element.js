const attrRenames = {
  onClick: "onclick",
};

export default class Element {
  constructor({ tagName, contents, ...attrs }) {
    this.element = document.createElement(tagName);

    for (let [key, value] of Object.entries(attrs)) {
      if (key === "style") {
        Object.assign(this.element[key], value);
      } else {
        this.element[attrRenames[key] || key] = value;
      }
    }

    this.initialContents = contents;
    this.initializing = false;
    this.initialized = false;
  }

  init() {
    if (this._ignoreNextInit) {
      this._ignoreNextInit = false;
      return this;
    }

    if (this.initialized) throw new Error("Init called more than once");

    this.initializing = true;
    this._init();
    this.initialized = true;
    this.initializing = false;

    return this;
  }

  _init() {
    if (this.initialContents) {
      this.appendContents(this.initialContents);
    }
  }

  ignoreNextInit() {
    this._ignoreNextInit = true;
    return this;
  }

  static with(initialArgs) {
    const cls = this;
    return {
      [cls.name]: function (laterArgs) {
        return new cls({ ...initialArgs, ...laterArgs });
      },
    }[cls.name];
  }

  static extendWithConstantArgs(className, constantArgs) {
    return {
      [className]: class extends Element {
        constructor(args) {
          super({ ...args, ...constantArgs });
        }
      },
    }[className]; // The intermediate object allows us to set the name on the class for better debugging
  }

  setContents(...contents) {
    this.element.replaceChildren();
    this.appendContents(...contents);
  }

  appendContents(...contents) {
    if (!this.initializing && !this.initialized) {
      throw new Error("appendContents called before initialization");
    }

    for (let content of contents.filter(Boolean)) {
      if (typeof content === "string") {
        this.element.append(content);
      } else if (Array.isArray(content)) {
        this.appendContents(...content);
      } else if (content instanceof Element) {
        this.element.appendChild(content.init().element);
      } else {
        this.element.appendChild(content);
      }
    }
  }
}
