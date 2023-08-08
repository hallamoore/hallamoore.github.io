import { Element } from "../../element.js";
import { DateTime } from "../../time/datetime.js";
import { TimeRange } from "../../time/timerange.js";

export default class DateSwitcher extends Element {
  static tag = "div";
  static className = "date-switcher";

  constructor({ dateRange, onChange, ...rest }) {
    super(rest);

    this.appendChild(
      new Element({
        tag: "button",
        textContent: "Today",
        style: { margin: "2px", marginRight: "10px", cursor: "pointer" },
        onclick: () => {
          const start = new DateTime().toStartOfDay();
          dateRange = new TimeRange(start, start.copy().increment(dateRange.duration()));
          onChange(dateRange);
        },
      })
    );
    this.appendChild(
      new Element({
        tag: "button",
        textContent: "<",
        style: { fontSize: "18px", margin: "2px", cursor: "pointer" },
        onclick: () => onChange(dateRange.moveBy(-dateRange.duration())),
      })
    );
    this.appendChild(
      new Element({
        tag: "button",
        textContent: ">",
        style: { fontSize: "18px", margin: "2px", cursor: "pointer" },
        onclick: () => onChange(dateRange.moveBy(dateRange.duration())),
      })
    );
  }
}
