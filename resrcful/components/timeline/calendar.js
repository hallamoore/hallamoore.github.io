import { Element } from "../../element.js";

class CalendarCol extends Element {
  static tag = "div";
  static className = "calendar-col";
}

export default class Calendar extends Element {
  static tag = "div";
  static className = "calendar";

  constructor({ headerTextContent, dateRange, colDuration, ...rest }) {
    super(rest);
    this.colDuration = colDuration;

    this.columnContainer = new Element({
      tag: "div",
      className: "calendar-cols-container",
    });
    this.appendChild(this.columnContainer);

    this.headerCol = new CalendarCol({
      textContent: headerTextContent,
    });

    this.rowsContainer = new Element({
      tag: "div",
      className: "calendar-rows-container",
    });
    this.appendChild(this.rowsContainer);

    this.setDateRange(dateRange);
  }

  setDateRange = (dateRange) => {
    this.constructor.setDateRange(this, dateRange);
  };

  static setDateRange = (instance, dateRange) => {
    instance.dateRange = dateRange;
    instance.columnContainer.innerHTML = "";

    instance.numCols = dateRange.duration() / instance.colDuration;
    // If there's not enough room to have numCols, 1fr won't be respected. Gotta add a min
    // to keep the column widths equal
    instance.columnContainer.style.gridTemplateColumns = `300px repeat(${instance.numCols}, minmax(70px, 1fr))`;
    instance.columnContainer.appendChild(instance.headerCol);

    const date = dateRange.start.copy();
    while (date < dateRange.end) {
      const col = new CalendarCol({
        textContent: `${date.getMonth()}/${date.getDayOfMonth()}`,
      });
      instance.columnContainer.appendChild(col);
      date.increment(instance.colDuration);
    }
  };
}
