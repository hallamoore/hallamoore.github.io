import Element from "./element.js";

const implicitRoles = {
  listitem: ["li"]
};

export default class ElementQuery {
  constructor(root, queryData) {
    this.root = root;
    this.queryData = queryData;

    for (let action of ["type", "click"]) {
      this[action] = args => {
        this.ensureExists();
        this.elemResult[action](args);
      };
    }

    this.ensureExists.description = `Querying for ${JSON.stringify(
      this.queryData
    )}`;
  }

  ensureExists = () => {
    if (!this.elemResult) {
      this.elemResult = this.findOne();
      if (!this.elemResult) {
        throw new Error(
          `Could not find element with query ${JSON.stringify(this.queryData)}`
        );
      }
    }
  };

  findOne() {
    const keys = new Set(Object.keys(this.queryData));
    if (keys.size === 1 && keys.has("label")) {
      return this.findByLabel(this.queryData.label);
    }
    if (keys.size === 1 && keys.has("text")) {
      return this.findByText(this.queryData.text);
    }
    throw new Error(
      `Unsupported query keys combination: ${JSON.stringify([...keys])}`
    );
  }

  findByLabel(label) {
    const elem = this.root.querySelector(`[aria-label="${label}"]`);
    return elem ? new Element(elem) : null;
  }

  findByText(text, { root = this.root } = {}) {
    for (let child of root.children) {
      const elem = this.findByText(text, { root: child });
      if (elem) {
        return elem;
      }
    }
    if (root.innerText === text) {
      return new Element(root);
    }
    return null;
  }

  findAllByRole(role) {
    // Grab elems with the role explicitly set
    let elems = [...this.root.querySelectorAll(`[role="${role}"]`)];
    // Grab elems without an explicit role but that implicitly match the role
    for (let baseSelector of implicitRoles[role] || []) {
      elems = elems.concat(
        ...this.root.querySelectorAll(`${baseSelector}:not([role])`)
      );
    }
    return elems.map(elem => new Element(elem));
  }

  query(q) {
    this.ensureExists();
    return new ElementQuery(this.elemResult.htmlElement, q);
  }

  all() {
    const keys = new Set(Object.keys(this.queryData));
    if (keys.size === 1 && keys.has("role")) {
      return this.findAllByRole(this.queryData.role);
    }
    throw new Error(
      `Unsupported keys combination for "all" query: ${JSON.stringify([
        ...keys
      ])}`
    );
  }
}
