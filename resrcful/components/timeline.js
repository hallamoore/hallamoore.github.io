const example = {
  "Target A": {
    "2023-03-25": [],
    "2023-03-26": [],
    "2023-03-27": [],
    "2023-03-28": [],
    "2023-03-29": [],
    "2023-03-30": [],
    "2023-03-31": [],
    "2023-04-01": [],
    "2023-04-02": [],
    "2023-04-03": ["Employee A"],
    "2023-04-04": ["Employee A"],
    "2023-04-05": ["Employee A"],
    "2023-04-06": ["Employee A"],
    "2023-04-07": ["Employee A"],
  },
  "Target B": {
    "2023-03-25": [],
    "2023-03-26": [],
    "2023-03-27": ["Employee A"],
    "2023-03-28": ["Employee A"],
    "2023-03-29": ["Employee A"],
    "2023-03-30": ["Employee A"],
    "2023-03-31": ["Employee A"],
  },
};

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

function getDateString(date) {
  return date.toISOString().split("T")[0];
}

function copyDate(date) {
  return new Date(date.getTime());
}

function insertAfter(anchor, nodesToinsert) {
  let previousNode = anchor;
  for (let node of nodesToinsert) {
    previousNode.after(node);
    previousNode = node;
  }
}

function increment(date, num) {
  date = copyDate(date);
  date.setDate(date.getDate() + num);
  return date;
}

function getDateRange(targetSchedule) {
  if (!Object.keys(targetSchedule)[0]?.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)) {
    const startDates = [];
    const endDates = [];
    Object.values(targetSchedule).forEach((subtargetSchedule) => {
      const [start, end] = getDateRange(subtargetSchedule);
      startDates.push(start);
      endDates.push(end);
    });
    return [new Date(Math.min(...startDates)), new Date(Math.max(...endDates))];
  }
  const dateStrs = Object.keys(targetSchedule);
  dateStrs.sort();

  const end = dateStrToDate(dateStrs.at(-1));
  end.setHours(24);
  return [dateStrToDate(dateStrs[0]), end];
}

// TODO: move utils to util file instead of duplicating
function dateStrToDate(dateStr) {
  // gets midnight of date in local timezone, rather than midnight utc like Date.parse does.
  const [year, month, day] = dateStr.split("-");
  const d = new Date();
  d.setFullYear(year);
  d.setMonth(month - 1);
  d.setDate(day);
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}

class TargetRow {
  constructor({ targetName, targetSchedule, startDate, duration }) {
    this.targetSchedule = targetSchedule;

    this.element = elem("tr");
    this.subtargetControls = elem("td");
    this.header = elem("td");
    this.header.textContent = targetName;

    this.subtargetRows = [];
    // If the keys aren't like YYYY-MM-DD, then they're subtarget names.
    if (!Object.keys(targetSchedule)[0]?.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)) {
      let subTargetsExpanded = false;
      const expandButton = elem("button", {
        textContent: ">",
        onclick: (ev) => {
          subTargetsExpanded = !subTargetsExpanded;

          if (subTargetsExpanded) {
            ev.target.textContent = "v";

            let anchor = this.element;
            for (let [subtargetName, subtargetSchedule] of Object.entries(targetSchedule)) {
              const subtargetRow = new TargetRow({
                targetName: subtargetName,
                targetSchedule: subtargetSchedule,
                startDate,
                duration,
              });
              this.subtargetRows.push(subtargetRow);
              anchor.after(subtargetRow.element);
              anchor = subtargetRow.element;
            }
          } else {
            ev.target.textContent = ">";
            this.subtargetRows.forEach((subtargetRow) => subtargetRow.element.remove());
            this.subtargetRows = [];
          }
        },
      });
      this.subtargetControls.append(expandButton);
    }

    this._updateDateBlocks({ startDate, duration });
  }

  _updateDateBlocks({ startDate, duration }) {
    this.element.innerHTML = "";
    this.element.appendChild(this.subtargetControls);
    this.element.appendChild(this.header);

    const endDate = increment(startDate, duration);
    let date = startDate;
    let emptyBlockColSpan = 0;

    // If the keys aren't like YYYY-MM-DD, then they're subtarget names.
    if (!Object.keys(this.targetSchedule)[0]?.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)) {
      const [subStart, subEnd] = getDateRange(this.targetSchedule);
      let colSpan = 0;
      // TODO: these assume column duration is always one day
      if (subStart < startDate) {
        if (subEnd > startDate) {
          if (subEnd < endDate) {
            colSpan = (subEnd - startDate) / 1000 / 60 / 60 / 24;
          } else {
            colSpan = (endDate - startDate) / 1000 / 60 / 60 / 24;
          }
        }
      } else {
        if (subStart < endDate) {
          emptyBlockColSpan = (subStart - startDate) / 1000 / 60 / 60 / 24;
          if (subEnd < endDate) {
            colSpan = (subEnd - subStart) / 1000 / 60 / 60 / 24;
          } else {
            colSpan = (endDate - subStart) / 1000 / 60 / 60 / 24;
          }
        }
      }

      if (emptyBlockColSpan > 0) {
        const emptyBlock = elem("td");
        emptyBlock.colSpan = emptyBlockColSpan;
        this.element.appendChild(emptyBlock);
      }
      if (colSpan > 0) {
        const block = elem("td", { innerHTML: "<hr/>" });
        block.colSpan = colSpan;
        this.element.appendChild(block);
      }

      this.subtargetRows.forEach((subtargetRow) =>
        subtargetRow._updateDateBlocks({ startDate, duration })
      );
      return;
    }

    while (date <= endDate) {
      if (this.targetSchedule[getDateString(date)]?.length > 0) {
        if (emptyBlockColSpan > 0) {
          const emptyBlock = elem("td");
          emptyBlock.colSpan = emptyBlockColSpan;
          this.element.appendChild(emptyBlock);
          emptyBlockColSpan = 0;
        }
        const block = elem("td");
        block.style.backgroundColor = "blue";
        let colspan = 0;
        while (this.targetSchedule[getDateString(date)]?.length > 0) {
          date = increment(date, 1);
          colspan++;
        }
        block.colSpan = colspan;
        this.element.appendChild(block);
      } else {
        emptyBlockColSpan += 1;
        date = increment(date, 1);
      }
    }
  }

  updateDates({ startDate, duration }) {
    this._updateDateBlocks({ startDate, duration });
  }
}

class Timeline {
  constructor({ scheduleByTarget, startDate, duration, headerInterval }) {
    this.startDate = startDate;
    this.duration = duration;
    this.headerInterval = headerInterval;

    this.element = elem("table", { style: { width: "100%" } });
    this.headers = elem("tr");
    this.element.appendChild(this.headers);
    this._updateDateHeaders({ startDate, duration, headerInterval });

    this.targetRows = [];

    for (let [targetName, targetSchedule] of Object.entries(scheduleByTarget)) {
      const targetRow = new TargetRow({
        targetName,
        targetSchedule,
        startDate,
        duration,
      });
      this.targetRows.push(targetRow);
      this.element.appendChild(targetRow.element);
    }

    const dateControls = document.createElement("div");
    const forward = document.createElement("button");
    forward.textContent = ">";
    forward.onclick = () => {
      this.updateDates({ startDate: increment(this.startDate, this.duration) });
    };
    const backward = document.createElement("button");
    backward.textContent = "<";
    backward.onclick = () => {
      this.updateDates({ startDate: increment(this.startDate, -this.duration) });
    };
    const today = document.createElement("button");
    today.textContent = "Today";
    today.onclick = () => {
      // TODO: snap to beginning of relevant time period. E.g. if we're showing a week, startDate
      // should be the Sunday of that week.
      this.updateDates({ startDate: getStartDate() });
    };

    dateControls.appendChild(today);
    dateControls.appendChild(backward);
    dateControls.appendChild(forward);
    this.element.appendChild(dateControls);
  }

  _updateDateHeaders() {
    this.headers.innerHTML = "";
    this.headers.appendChild(elem("th")); // Corner header
    this.headers.appendChild(elem("th"));

    const endDate = increment(this.startDate, this.duration);
    let date = this.startDate;
    while (date < endDate) {
      const header = elem("th");
      // If duration isn't evenly divisible by headerInterval, the last header will need to span
      // just the remainder.
      // TODO: this assumes one column is one day. Needs to be able to account for different column
      // units.
      header.colSpan = Math.min(this.headerInterval, (endDate - date) / 1000 / 60 / 60 / 24);
      // Can't really align center when headerInterval is more than 1.
      // The date represents the first column, not the middle one.
      // header.style.textAlign = "center";
      header.textContent = `${date.getMonth() + 1}/${date.getDate()}`;
      this.headers.appendChild(header);
      date = increment(date, this.headerInterval);
    }
  }

  updateDates = ({
    startDate = this.startDate,
    duration = this.duration,
    headerInterval = this.headerInterval,
  }) => {
    this.startDate = startDate;
    this.duration = duration;
    this.headerInterval = headerInterval;

    this._updateDateHeaders();
    this.targetRows.forEach((targetRow) =>
      targetRow.updateDates({ startDate, duration, headerInterval })
    );
  };
}

function getStartDate() {
  // if this is changed, make sure to change how the start date in schedule() is constructed too
  const startDate = new Date();
  startDate.setHours(0);
  startDate.setMinutes(0);
  startDate.setSeconds(0);
  startDate.setMilliseconds(0);
  return startDate;
}

export default {
  build(scheduleByTarget) {
    const startDate = getStartDate();
    const timeline = new Timeline({
      scheduleByTarget,
      startDate,
      duration: 14,
      headerInterval: 1,
    });
    window.test = timeline.updateDates;
    return timeline.element;
  },
};
