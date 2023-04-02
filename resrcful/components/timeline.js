import { TimeDelta } from "../time/timedelta.js";
import { DateTime } from "../time/datetime.js";
import { TimeRange } from "../time/timerange.js";
import { TimeRangeCollection } from "../time/timerange_collection.js";

// TODO: move utils to util file instead of duplicating
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

function getTargetTimeRange(assignedTimeRanges) {
  assignedTimeRanges.sort((a, b) => (a.start > b.start ? 1 : -1));
  return new TimeRange(assignedTimeRanges[0].start, assignedTimeRanges.at(-1).end);
}

function cmp(a, b) {
  return a > b ? 1 : b > a ? -1 : 0;
}

function cmpKey(key) {
  return (a, b) => cmp(a[key], b[key]);
}

class TargetRow {
  constructor({ target, startDate, duration }) {
    this.element = elem("tr", { style: { height: "100%" } });
    this.subtargetControls = elem("td");
    this.header = elem("td");
    this.header.textContent = target.name;
    this.startDate = startDate;
    this.duration = duration;
    this.target = target;

    this.subtargetRows = [];
    if (target.hasSubtargets) {
      let subTargetsExpanded = false;
      const expandButton = elem("button", {
        textContent: ">",
        onclick: (ev) => {
          subTargetsExpanded = !subTargetsExpanded;

          if (subTargetsExpanded) {
            ev.target.textContent = "v";

            const subtargets = Object.values(this.target.subtargets);
            subtargets.sort(cmpKey("priority"));
            let anchor = this.element;
            for (let subtarget of subtargets) {
              const subtargetRow = new TargetRow({
                target: subtarget,
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

    this.updateDates({ startDate, duration });
  }

  updateDates({ startDate, duration }) {
    // TODO: fix bug
    // 1. Start in date view where subtarget has assigned blocks
    // 2. Collapse subtarget row
    // 3. Move to date view where subtart doesn't have assigned blocks
    // 4. Expand subtarget row, it still shows the assigned blocks from the previous date view
    Object.values(this.subtargetRows).forEach((subtargetRow) =>
      subtargetRow.updateDates({ startDate, duration })
    );

    const boundingTimeRange = new TimeRange(startDate, startDate.copy().increment(duration));
    this.startDate = startDate;
    this.duration = duration;
    this.element.innerHTML = "";
    this.element.appendChild(this.subtargetControls);
    this.element.appendChild(this.header);

    const cell = elem("td", {
      colSpan: boundingTimeRange.duration().days,
      style: { height: "100%" },
    });
    const innerContainer = elem("div", {
      style: { display: "flex", height: "100%" },
    });
    cell.appendChild(innerContainer);
    this.element.appendChild(cell);

    const assignedRanges = this.target.mergedScheduledTimeRanges(boundingTimeRange);
    if (assignedRanges.length === 0) return;

    if (this.target.hasSubtargets) {
      const targetTimeRange = getTargetTimeRange(assignedRanges);
      const marginLeftPct =
        (targetTimeRange.start.subtract(boundingTimeRange.start).milliseconds /
          boundingTimeRange.duration().milliseconds) *
        100;
      const widthPct =
        (targetTimeRange.duration().milliseconds / boundingTimeRange.duration().milliseconds) * 100;

      const color1 = "rgba(0, 0, 0, 0.8)";
      const color2 = "rgba(255, 255, 255, 0.3)";
      const block = elem("div", {
        style: {
          marginLeft: `${marginLeftPct}%`,
          width: `${widthPct}%`,
          height: "50%",
          backgroundColor: "blue",
          backgroundImage: `linear-gradient(45deg, ${color1} 0%, ${color2} 25%,  ${color1} 50%, ${color2} 75%, ${color1} 100%)`,
        },
      });
      innerContainer.appendChild(block);
      return;
    }

    const unassignedTimeRanges = new TimeRangeCollection(boundingTimeRange).subtract(
      assignedRanges
    );
    unassignedTimeRanges.forEach((timeRange) => (timeRange.unassigned = true));

    const assignedAndUnassigned = unassignedTimeRanges.concat(assignedRanges);
    // TODO: add sort function on TimeRangeCollection, consider adding check there to make sure
    // ranges don't overlap
    assignedAndUnassigned.sort((a, b) => (a.start > b.start ? 1 : -1));

    let marginLeftPct = 0;
    for (let timeRange of assignedAndUnassigned) {
      const pct =
        (timeRange.duration().milliseconds / boundingTimeRange.duration().milliseconds) * 100;
      if (timeRange.unassigned) {
        marginLeftPct += pct;
      } else {
        const block = elem("div", {
          style: {
            marginLeft: `${marginLeftPct}%`,
            width: `${pct}%`,
            backgroundColor: "blue",
          },
        });
        innerContainer.appendChild(block);
        marginLeftPct = 0;
      }
    }
  }
}

class Timeline {
  constructor({ targets, startDate, duration, headerInterval }) {
    this.startDate = startDate;
    this.duration = duration;
    this.headerInterval = headerInterval;

    this.element = elem("table", { style: { width: "100%", tableLayout: "fixed" } });
    this.headers = elem("tr");
    this.element.appendChild(this.headers);
    this._updateDateHeaders({ startDate, duration, headerInterval });

    this.targetRows = [];
    targets.sort(cmpKey("priority"));
    for (let target of targets) {
      const targetRow = new TargetRow({
        target: target,
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
      this.updateDates({ startDate: this.startDate.copy().increment(this.duration) });
    };
    const backward = document.createElement("button");
    backward.textContent = "<";
    backward.onclick = () => {
      this.updateDates({ startDate: this.startDate.copy().decrement(this.duration) });
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
    this.headers.appendChild(elem("th", { style: { width: "20px" } })); // Corner header
    this.headers.appendChild(elem("th", { style: { width: "20%" } }));

    const endDate = this.startDate.copy().increment(this.duration);
    let date = this.startDate.copy();
    while (date < endDate) {
      const header = elem("th");
      // If duration isn't evenly divisible by headerInterval, the last header will need to span
      // just the remainder.
      // TODO: this assumes one column is one day. Needs to be able to account for different column
      // units.
      header.colSpan = Math.min(this.headerInterval, (endDate - date) / 1000 / 60 / 60 / 24);
      // Can't really align center when headerInterval is more than 1.
      // The date represents the first column, not the middle one.
      header.style.textAlign = "left";
      header.textContent = `${date.getMonth()}/${date.getDayOfMonth()}`;
      this.headers.appendChild(header);
      date.increment({ days: this.headerInterval });
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
  return new DateTime().toStartOfDay();
}

export default {
  build({ targets }) {
    const startDate = getStartDate();
    const timeline = new Timeline({
      targets,
      startDate,
      duration: new TimeDelta({ days: 14 }),
      headerInterval: 1,
    });
    window.test = timeline.updateDates;
    return timeline.element;
  },
};
