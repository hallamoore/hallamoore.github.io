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

    if (contents) {
      this.appendContents(contents);
    }
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
    this.appendContents(...contents.filter(Boolean));
  }

  appendContents(...contents) {
    for (let content of contents) {
      if (typeof content === "string") {
        this.element.append(content);
      } else if (Array.isArray(content)) {
        this.appendContents(...content);
      } else if (content instanceof Element) {
        this.element.appendChild(content.element);
      } else {
        this.element.appendChild(content);
      }
    }
  }
}
