export default class Styler {
  constructor(theme) {
    this.stylesheet = new CSSStyleSheet();
    document.adoptedStyleSheets.push(this.stylesheet);

    this.theme = theme;
    if (theme) {
      this.stylesheet.insertRule(theme.toCSSRule());
    }
  }

  // Note: we really only want to allow class selectors, because those need to be explicitly
  // assigned on the element. Complex selectors that use inheritance, tag names, etc, result
  // in implicit style applications that are hard to understand and track down. Id selectors
  // can just be defined as inline style attributes. But if multiple elements will have the
  // same style, classes (as opposed to inline style attributes) make it easier to iterate
  // on those styles within the browser tools (changing the class styles in the tool will
  // apply to all elements with the class, while changing inline styles apply only to the
  // selected element)
  defineClass(className, styles) {
    if (typeof styles === "function") {
      styles = styles(this.theme);
    }

    const innerValues = styles.map(([key, value]) => `  ${key}: ${value};`).join("\n");
    const rule = `.${className} {\n${innerValues}\n}`;
    this.stylesheet.insertRule(rule);

    return { name: className };
  }
}
