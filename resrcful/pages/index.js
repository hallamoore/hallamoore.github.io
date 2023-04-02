"use strict";
import { getCookie } from "../cookies.js";
import { Redirect } from "../router.js";
import Timeline from "../components/timeline.js";
import { schedule } from "../scheduler.js";

function elem(tag, args = {}) {
  const node = document.createElement(tag);
  Object.entries(args).forEach(([key, value]) => {
    if (key === "style") return;
    node[key] = value;
  });
  if (args.style) {
    Object.entries(args.style).forEach(([key, value]) => {
      node.style[key] = value;
    });
  }
  return node;
}

const remote = {
  async get() {
    const params = new URLSearchParams();
    const resp = await fetch(
      "https://script.google.com/macros/s/AKfycbzbR2Yzje3mVygJnsMm0Mr8D2bSnYXGOwZFZnjhFfg8HcjMj8yBpFZq-S_giOTtg57M/exec",
      {
        method: "POST",
        body: JSON.stringify({ session: getCookie("resrcfulSession"), action: "loadData" }),
      }
    );
    return await resp.json();
  },

  async set(data) {
    const params = new URLSearchParams();
    await fetch(
      "https://script.google.com/macros/s/AKfycbzbR2Yzje3mVygJnsMm0Mr8D2bSnYXGOwZFZnjhFfg8HcjMj8yBpFZq-S_giOTtg57M/exec",
      {
        method: "POST",
        body: JSON.stringify({
          session: getCookie("resrcfulSession"),
          action: "saveData",
          actionArgs: [JSON.stringify(data)],
        }),
      }
    );
  },
};

const local = {
  get() {
    return JSON.parse(localStorage.getItem("resrcful"));
  },

  set(data) {
    localStorage.setItem("resrcful", JSON.stringify(data));
  },
};

const DEBUG = false;

class IDKState {
  constructor() {
    this.listeners = {
      insert: {},
      update: {},
      delete: {},
    };
  }
  async load() {
    if (this.data) return this.data;

    this.data = await (DEBUG ? local : remote).get();
    if (!this.data) {
      this.data = {};
    }
    if (!this.data.targets) {
      this.data.targets = {};
    }
    if (!this.data.employees) {
      this.data.employees = {};
    }
  }

  async _save() {
    local.set(this.data);
    remote.set(this.data);
  }

  _traverseKeyPath(keyPath) {
    const keyParts = keyPath.split(".");
    const finalKey = keyParts.pop();
    let obj = this.data;
    keyParts.forEach((key) => (obj = obj[key]));
    return [obj, finalKey];
  }

  getValue(keyPath) {
    const [obj, finalKey] = this._traverseKeyPath(keyPath);
    return obj[finalKey];
  }

  _getListeners(obj, keyParts) {
    if (!obj) return [];
    if (keyParts.length == 0) {
      // TODO: use symbol
      return obj.listeners || [];
    }
    let results = this._getListeners(obj[keyParts[0]], keyParts.slice(1));
    results = results.concat(this._getListeners(obj["*"], keyParts.slice(1)));
    return results;
  }

  _callListeners(event, keyPath, value) {
    this._getListeners(this.listeners[event], keyPath.split(".")).forEach((listener) => {
      listener(value);
    });
  }

  async insertValue(keyPath, value) {
    // same as update atm, but I think listeners will want to
    // differentiate, so maybe add check to both insert and update
    // confirming that existing values are as expected
    const [obj, finalKey] = this._traverseKeyPath(keyPath);
    obj[finalKey] = value;
    await this._save();
    this._callListeners("insert", keyPath, value);
  }

  async updateValue(keyPath, value) {
    const [obj, finalKey] = this._traverseKeyPath(keyPath);
    obj[finalKey] = value;
    await this._save();
    this._callListeners("update", keyPath, value);
  }

  async deleteValue(keyPath) {
    const [obj, finalKey] = this._traverseKeyPath(keyPath);
    delete obj[finalKey];
    await this._save();
    this._callListeners("delete", keyPath, finalKey);
  }

  subscribe(event, keyPath, listener) {
    const keyParts = keyPath.split(".");
    let obj = this.listeners[event];
    keyParts.forEach((key) => {
      if (!obj[key]) {
        obj[key] = {};
      }
      obj = obj[key];
    });
    // TODO: use a symbol in case `listeners` is an actual key
    if (!obj.listeners) {
      obj.listeners = [];
    }
    obj.listeners.push(listener);
  }
}

const state = new IDKState();

function trackState(elem, dest, src, { transform = (x) => x || "" } = {}) {
  elem[dest] = transform(state.getValue(src));
  state.subscribe("update", src, (value) => {
    elem[dest] = transform(value);
  });
}

function statefulInput({ stateKey, loadTransform = (x) => x || "", saveTransform = (x) => x }) {
  const node = elem("input");
  trackState(node, "value", stateKey, { transform: loadTransform });
  node.onchange = () => state.updateValue(stateKey, saveTransform(node.value));
  return node;
}

function statefulArrayInput({ stateKey }) {
  return statefulInput({
    stateKey,
    loadTransform: (x) => x?.join(", ") || "",
    saveTransform: (x) => (x.trim() === "" ? [] : x.split(",").map((s) => s.trim())),
  });
}

class InnerGrid {
  constructor({ stateKey, Item, marginLeft }) {
    this.stateKey = stateKey;
    this.Item = Item;
    this.marginLeft = marginLeft;

    this.loading = elem("div", { textContent: "loading" });

    this.items = {};
    state.subscribe("insert", `${stateKey}.*`, this.addItem);
    state.subscribe("delete", `${stateKey}.*`, this.removeItem);
    this.loadItems();
  }

  async loadItems() {
    await state.load();
    this.loading.remove();
    this.loading = null;
    const items = state.getValue(this.stateKey) || [];
    Object.values(items).forEach((item) => this.addItem(item));
  }

  addItem = (item) => {
    this.items[item.id] = new this.Item(item, {
      stateKey: this.stateKey,
      marginLeft: this.marginLeft,
    });
    if (this.parent) {
      this.items[item.id].appendTo(this.parent);
    }
    if (this.anchor) {
      this.items[item.id].insertAfter(this.anchor);
      this.anchor = this.items[item.id];
    }
  };

  removeItem = (itemId) => {
    this.items[itemId].remove();
    delete this.items[itemId];
  };

  appendTo(node) {
    this.parent = node;
    if (this.loading) {
      node.appendChild(this.loading);
    } else {
      Object.values(this.items).appendTo(node);
    }
  }

  insertAfter(anchor) {
    this.anchor = anchor;
    if (this.loading) {
      // Don't set the this.anchor to the loading element. The loading element gets removed
      // before the items are added to the DOM, so there would be nowhere to anchor to.
      return this.anchor.after(this.loading);
    }

    for (let item of Object.values(this.items)) {
      item.insertAfter(this.anchor);
      this.anchor = item;
    }
  }

  remove() {
    Object.values(this.items).forEach((item) => item.remove());
  }
}

class Grid {
  constructor({ headers, stateKey, Item }) {
    this.element = elem("table");

    this.headers = elem("tr");
    headers.forEach((header) => this.headers.appendChild(elem("th", { textContent: header })));
    this.element.appendChild(this.headers);

    new InnerGrid({ stateKey, Item }).appendTo(this.element);
  }
}

class Item {
  constructor(item, { stateKey, statePrefix = `${stateKey}.${item.id}`, fields, marginLeft } = {}) {
    this.element = elem("tr");

    const basicField = (key) => statefulInput({ stateKey: `${statePrefix}.${key}` });
    const arrayField = (key) => statefulArrayInput({ stateKey: `${statePrefix}.${key}` });

    const deleteBtn = elem("button", { textContent: "delete" });
    deleteBtn.onclick = () => state.deleteValue(statePrefix);

    this.fields = fields.map(({ key, type }) => {
      if (type === "basic") {
        return basicField(key);
      }
      if (type === "array") {
        return arrayField(key);
      }
      throw new Error(`Unsupported field type: ${type}`);
    });
    this.fields.push(deleteBtn);

    this.fields[0].style.marginLeft = marginLeft;
    this.fields.forEach((field) => {
      const cell = elem("td");
      cell.appendChild(field);
      this.element.appendChild(cell);
    });
  }

  appendTo(node) {
    node.appendChild(this.element);
  }

  insertAfter(node) {
    if (node.anchor) {
      return this.insertAfter(node.anchor);
    }
    node.after(this.element);
  }

  remove() {
    this.element.remove();
  }
}

class NewItem {
  constructor({ stateKey, displayName, btnStyle, defaults }) {
    this.stateKey = stateKey;
    this.displayName = displayName;
    this.defaults = defaults;

    this.element = elem("tr");
    const cell = elem("td");
    const button = elem("button", {
      textContent: `Create New ${displayName}`,
      onclick: this.createItem,
      style: btnStyle,
    });
    cell.appendChild(button);
    this.element.appendChild(cell);
  }

  createItem = () => {
    const id = Math.max(0, ...Object.keys(state.getValue(this.stateKey) || {})) + 1;
    state.insertValue(`${this.stateKey}.${id}`, {
      id,
      name: `New ${this.displayName}`,
      ...this.defaults,
    });
  };
}

class TargetList extends Grid {
  constructor() {
    super({
      headers: [
        "Name",
        "Priority",
        "Can Be Done By",
        "Person Hours Remaining",
        "Blocked By",
        "Delete",
      ],
      stateKey: "targets",
      Item: Target,
    });
  }
}

function addPx(pxStr = "0px", increment) {
  return `${parseInt(pxStr.split("px")[0]) + increment}px`;
}

class Target extends Item {
  constructor(target, { stateKey, marginLeft, ...opts }) {
    super(target, {
      stateKey,
      fields: [
        { key: "name", type: "basic" },
        { key: "priority", type: "basic" },
        { key: "canBeDoneBy", type: "array" },
        { key: "personHoursRemaining", type: "basic" },
        { key: "blockedBy", type: "array" },
      ],
      ...opts,
    });
    let subTargetsExpanded = false;
    const btn = elem("button", {
      textContent: ">",
      style: { marginLeft },
      onclick: (ev) => {
        subTargetsExpanded = !subTargetsExpanded;

        if (subTargetsExpanded) {
          ev.target.textContent = "v";

          const subStateKey = `${stateKey}.${target.id}.subtargets`;
          if (!state.getValue(subStateKey)) {
            state.insertValue(subStateKey, {});
          }

          if (!this.newSubtarget) {
            this.newSubtarget = new NewTarget({
              stateKey: subStateKey,
              displayName: "Sub-Target",
              btnStyle: { marginLeft: addPx(marginLeft, 30) },
            }).element;
          }
          this.element.after(this.newSubtarget);

          if (!this.subTargetInnerGrid) {
            this.subTargetInnerGrid = new InnerGrid({
              stateKey: subStateKey,
              Item: Target,
              marginLeft: addPx(marginLeft, 30),
            });
          }
          this.subTargetInnerGrid.insertAfter(this.element);
        } else {
          ev.target.textContent = ">";
          this.newSubtarget.remove();
          this.subTargetInnerGrid.remove();
        }
      },
    });

    this.element.children[0].prepend(btn);
  }

  get anchor() {
    return this.newSubtarget || this.element;
  }

  remove() {
    super.remove();
    this.subTargetInnerGrid?.remove();
    this.newSubtarget?.remove();
  }
}

class NewTarget extends NewItem {
  constructor({ stateKey = "targets", displayName = "Target", ...rest } = {}) {
    super({ stateKey, displayName, ...rest });
  }
}

class TargetWrapper {
  constructor() {
    this.element = elem("div");
    this.element.appendChild(new TargetList().element);
    this.element.appendChild(new NewTarget().element);
  }
}

class EmployeeList extends Grid {
  constructor() {
    super({
      headers: ["Name", "Usual Hours Per Day", "Hours Exceptions", "Delete"],
      stateKey: "employees",
      Item: Employee,
    });
  }
}

class Employee extends Item {
  constructor(employee, opts) {
    super(employee, {
      fields: [
        { key: "name", type: "basic" },
        { key: "hoursPerDay", type: "basic" },
        { key: "hoursExceptions", type: "basic" },
      ],
      ...opts,
    });
  }
}

class NewEmployee extends NewItem {
  constructor(args = {}) {
    super({
      stateKey: "employees",
      displayName: "Employee",
      defaults: { hoursPerDay: "0,8,8,8,8,8,0", hoursExceptions: "{}" },
      ...args,
    });
  }
}

class EmployeeWrapper {
  constructor() {
    this.element = elem("div");
    this.element.appendChild(new EmployeeList().element);
    this.element.appendChild(new NewEmployee().element);
  }
}

class TimelineWrapper {
  constructor() {
    this.element = elem("div");
    this.loading = elem("div", { textContent: "loading" });
    const calculate = elem("button", { textContent: "Calculate", id: "calculate" });
    calculate.onclick = () => {
      if (this.timeline) this.timeline.remove();
      this.element.appendChild(this.loading);
      const employees = Object.values(state.data.employees).map((employee) => {
        return {
          ...employee,
          hoursPerDay: employee.hoursPerDay.split(",").map((s) => parseInt(s)),
          hoursExceptions: JSON.parse(employee.hoursExceptions),
        };
      });
      const results = schedule({ targets: state.data.targets, employees });
      console.log(results);
      this.loading.remove();
      this.timeline = Timeline.build(results);
      this.element.appendChild(this.timeline);
    };
    this.element.appendChild(calculate);
  }
}

class IndexWrapper {
  constructor() {
    this.element = elem("div");
    [
      elem("h2", { textContent: "Targets" }),
      new TargetWrapper().element,
      elem("h2", { textContent: "Employees" }),
      new EmployeeWrapper().element,
      elem("h2", { textContent: "Schedule" }),
      new TimelineWrapper().element,
    ].forEach((elem) => this.element.appendChild(elem));
  }
}

export default {
  build() {
    if (!getCookie("resrcfulSession")) {
      return new Redirect("/login");
    }
    return new IndexWrapper().element;
  },
};
