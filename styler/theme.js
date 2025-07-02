const camelToKebabCase = (str) => {
  return str.replaceAll(/([A-Z])/g, (_, group) => `-${group.toLowerCase()}`);
};

export default class Theme {
  constructor(vars, prefixes = []) {
    this._prefixes = prefixes;
    this._vars = {};

    this.define(vars);

    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop in target) return target[prop];
        if (prop in target._vars) return target._vars[prop];

        throw new Error(`Var not defined on theme: ${[...prefixes, prop].join(".")}`);
      },
    });
  }

  define(vars) {
    for (let [key, value] of Object.entries(vars)) {
      this._vars[key] = new ThemeVar([...this._prefixes, key], value);
    }
  }

  _getDefs() {
    return Object.values(this._vars).flatMap((v) => v._getDefs());
  }

  toCSSRule() {
    const innerValues = this._getDefs()
      .map((def) => `  ${def}`)
      .join("\n");
    return `:root {\n${innerValues}\n}`;
  }
}

// ThemeVar extends Theme so that it can have sub vars, e.g. theme.spacer.large
class ThemeVar extends Theme {
  constructor(nameParts, initialValue) {
    super({}, nameParts);

    const cssVarName = `--${nameParts.map(camelToKebabCase).join("-")}`;
    // CSS string to define the var's initial value
    this._varDef = `${cssVarName}: ${initialValue};`;
    // CSS string to reference the var's current value
    this._varRef = `var(${cssVarName})`;
  }

  [Symbol.toPrimitive]() {
    return this._varRef;
  }

  _getDefs() {
    return [this._varDef, ...super._getDefs()];
  }

  defineRelativeCalcs(vars) {
    this.define(
      Object.fromEntries(
        Object.entries(vars).map(([key, relativeAdjustment]) => {
          return [key, `calc(${this} ${relativeAdjustment})`];
        })
      )
    );
  }
}
