const symbol = Symbol("Element");

export class Element {
  static [Symbol.hasInstance](instance) {
    return instance[symbol]?.constructorNames.includes(this.name);
  }

  constructor(args = {}) {
    this[symbol] = {};
    this._initFromProtoChain();

    this._setDefaultsFromStatic(args);
    const { tag, style = {}, ...rest } = args;

    const node = document.createElement(tag);

    Object.entries(rest).forEach(([key, value]) => {
      node[key] = value;
    });

    Object.entries(style).forEach(([key, value]) => {
      node.style[key] = value?.toString();
    });

    this[symbol].propertyNames.forEach((name) => {
      node[name] = this[name];
    });

    node[symbol] = this[symbol];
    return node;
  }

  _setDefaultsFromStatic(args) {
    ["tag", "className"].forEach((key) => {
      if (args[key] === undefined && this.constructor[key] !== undefined) {
        args[key] = this.constructor[key];
      }
    });
  }

  _initFromProtoChain() {
    const constructorNames = [];
    let propertyNames = [];

    let current = this;
    while (current) {
      constructorNames.push(current.constructor.name);
      if (current.constructor !== Object) {
        propertyNames = propertyNames.concat(Object.getOwnPropertyNames(current));
      }
      current = Object.getPrototypeOf(current);
    }

    this[symbol].constructorNames = constructorNames;
    this[symbol].propertyNames = propertyNames;
  }

  show() {
    if (this.style.display === "none") {
      if (this[symbol].originalDisplay == undefined) {
        throw Error("Can't use show() on element unless hide() was used while it was visible");
      }
      this.style.display = this[symbol].originalDisplay;
    }
  }

  hide() {
    if (this.style.display !== "none") {
      this[symbol].originalDisplay = this.style.display;
      this.style.display = "none";
    }
  }

  hasOverflowX() {
    return this.scrollWidth > this.clientWidth;
  }
}
