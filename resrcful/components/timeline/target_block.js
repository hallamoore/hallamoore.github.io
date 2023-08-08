import { CSSValue } from "../../css_value.js";
import { Element } from "../../element.js";
import Employees from "./employees.js";

class Date extends Element {
  static tag = "div";
  static className = "date-range";

  constructor({ start, end, ...rest }) {
    super({
      textContent: `${start.getMonth()}/${start.getDayOfMonth()} - ${end.getMonth()}/${end.getDayOfMonth()}`,
      ...rest,
    });
  }
}

export default class TargetBlock extends Element {
  static tag = "div";
  static className = "target-block";

  constructor({ totalRange: { start, end }, employees, style, ...rest }) {
    super({
      style: {
        backgroundColor: "salmon",
        ...style,
      },
      ...rest,
    });
    this.employees = new Employees({ employees });

    this.expandIcon = new Element({
      tag: "div",
      textContent: "↦",
      style: {
        fontSize: "20px",
      },
    });
    this.appendChild(this.expandIcon);

    this.date = new Date({ start, end });

    this.appendChild(this.employees);
    this.appendChild(this.date);

    new ResizeObserver(this.onResize).observe(this);

    this.originalWidth = this.style.width;
    this.state = "original";
    this.expandedBy = new CSSValue(0, "px");
    this.addEventListener("mouseenter", () => {
      if (this.origStateIsCollapsed) {
        this.state = "expanding";
        this.expandIcon.hide();
        this.employees.show();
        this.employees.fitToMinWidth();
        this.date.show();
        this.lastTimestamp = null;
        requestAnimationFrame(this.increaseWidth);
      }
    });

    this.addEventListener("mouseleave", () => {
      if (this.origStateIsCollapsed) {
        this.state = "collapsing";
        this.lastTimestamp = null;
        requestAnimationFrame(this.decreaseWidth);
      }
    });
  }

  hasOverflowX() {
    // this.employees is a flex item with a flex-grow of 1. It doesn't technically push its parent
    // (TargetBlock) into overflow, but can have overflow itself. Semantically, TargetBlock doesn't
    // have enough width for all of its contents if this.employees doesn't.
    return super.hasOverflowX() || this.employees.hasOverflowX();
  }

  noOpUnless(state, fn) {
    return (...args) => {
      return this.state === state ? fn(...args) : null;
    };
  }

  getDelta(timestamp) {
    return 0.75 * (this.lastTimestamp ? timestamp - this.lastTimestamp : 0);
  }

  increaseWidth = this.noOpUnless("expanding", (timestamp) => {
    if (!this.hasOverflowX()) {
      this.state = "expanded";
      return;
    }
    this.expandedBy.value += this.getDelta(timestamp);
    this.style.width = this.expandedBy.add(this.originalWidth).toString();
    this.lastTimestamp = timestamp;
    requestAnimationFrame(this.increaseWidth);
  });

  decreaseWidth = this.noOpUnless("collapsing", (timestamp) => {
    if (this.expandedBy == 0) {
      this.state = "original";
      this.expandIcon.show();
      this.employees.hide();
      this.date.hide();
      return;
    }
    this.expandedBy.value -= Math.min(this.getDelta(timestamp), this.expandedBy.value);
    this.style.width = this.expandedBy.add(this.originalWidth).toString();
    this.lastTimestamp = timestamp;
    requestAnimationFrame(this.decreaseWidth);
  });

  onResize = this.noOpUnless("original", () => {
    this.expandIcon.hide();
    this.employees.show();
    this.employees.fitToMinWidth();
    this.date.show();
    if (this.hasOverflowX()) {
      this.origStateIsCollapsed = true;
      this.expandIcon.show();
      this.employees.hide();
      this.date.hide();
    } else {
      this.origStateIsCollapsed = false;
      this.employees.fitToWidth();
    }
  });
}
