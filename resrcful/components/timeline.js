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

class TargetRow {
  constructor({ targetName, targetSchedule, gridRow, startDate, duration }) {
    this.targetSchedule = targetSchedule;
    this.gridRow = gridRow;

    this.header = document.createElement("div");
    this.header.style.gridColumn = 1;
    this.header.style.gridRow = gridRow;
    this.header.textContent = targetName;

    this._updateDateBlocks({ startDate, duration });
  }

  appendTo(node) {
    node.appendChild(this.header);
    this.dateBlocks.forEach((block) => node.appendChild(block));
  }

  _updateDateBlocks({ startDate, duration }) {
    this.dateBlocks = [];
    const endDate = increment(startDate, duration);
    let date = startDate;
    let column = 2;
    while (date < endDate) {
      if (this.targetSchedule[getDateString(date)]?.length > 0) {
        const block = document.createElement("div");
        block.style.backgroundColor = "blue";
        block.style.gridRow = this.gridRow;
        block.style.gridColumnStart = column;
        while (this.targetSchedule[getDateString(date)]?.length > 0) {
          date = increment(date, 1);
          column++;
        }
        block.style.gridColumnEnd = column;
        this.dateBlocks.push(block);
      }
      date = increment(date, 1);
      column++;
    }
  }

  updateDates({ startDate, duration }) {
    this.dateBlocks.forEach((block) => block.remove());
    this._updateDateBlocks({ startDate, duration });
    insertAfter(this.header, this.dateBlocks);
  }
}

class Timeline {
  constructor({ scheduleByTarget, startDate, duration, headerInterval }) {
    this.startDate = startDate;
    this.duration = duration;
    this.headerInterval = headerInterval;

    this.cornerHeader = document.createElement("div");
    this._updateDateHeaders({ startDate, duration, headerInterval });

    this.element = document.createElement("div");
    this.element.style.display = "grid";
    this.element.style.gridTemplateColumns = `auto repeat(${this.dateHeaders.length}, 1fr)`;
    this.element.appendChild(this.cornerHeader);
    this.dateHeaders.forEach((header) => this.element.appendChild(header));

    this.targetRows = [];

    let gridRow = 2;
    for (let [targetName, targetSchedule] of Object.entries(scheduleByTarget)) {
      const targetRow = new TargetRow({
        targetName,
        targetSchedule,
        gridRow,
        startDate,
        duration,
      });
      this.targetRows.push(targetRow);
      targetRow.appendTo(this.element);
      gridRow++;
    }

    const dateControls = document.createElement("div");
    dateControls.style.gridRow = gridRow;
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
      this.updateDates({ startDate: new Date() });
    };

    dateControls.appendChild(today);
    dateControls.appendChild(backward);
    dateControls.appendChild(forward);
    this.element.appendChild(dateControls);
  }

  _updateDateHeaders() {
    this.dateHeaders = [];
    const endDate = increment(this.startDate, this.duration);
    let date = this.startDate;
    let column = 2;
    while (date < endDate) {
      const header = document.createElement("div");
      header.style.textAlign = "center";
      header.style.gridColumn = column;
      header.textContent = `${date.getMonth() + 1}/${date.getDate()}`;
      this.dateHeaders.push(header);
      date = increment(date, this.headerInterval);
      column += this.headerInterval;
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

    this.dateHeaders.forEach((header) => header.remove());
    this._updateDateHeaders();
    insertAfter(this.cornerHeader, this.dateHeaders);
    this.targetRows.forEach((targetRow) =>
      targetRow.updateDates({ startDate, duration, headerInterval })
    );
    this.element.style.gridTemplateColumns = `auto repeat(${this.duration}, 1fr)`;
  };
}

export default {
  build(scheduleByTarget) {
    const startDate = new Date();
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
