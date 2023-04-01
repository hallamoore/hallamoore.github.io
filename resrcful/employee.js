import { DateTime, WeeklyDateTime } from "./time/datetime.js";
import { TimeRange, WeeklyTimeRange } from "./time/timerange.js";
import { TimeRangeCollection, WeeklyTimeRangeCollection } from "./time/timerange_collection.js";

export class Employee {
  // employee = {
  //   name: "Someone",
  //   hoursPerDay: [0, 8, 8, 8, 8, 8, 0],
  //   hoursExceptions: {'2023-04-15': 0}
  // }
  constructor({
    name, // string
    hoursPerDay, // array of numbers, first index represents Sunday
    hoursExceptions, // keys are of the form 'YYYY-MM-DD', values are a number indicating how many hours will be worked that day
  }) {
    this.name = name;
    this._scheduledTimeRanges = new TimeRangeCollection();

    // Convert hoursPerDay into workingHours format
    const weekStart = new DateTime().getEndOfWeek();
    this.workingHours = hoursPerDay.reduce((arr, hours, idx) => {
      if (hours <= 0) return arr;
      arr.push(
        new WeeklyTimeRange(
          new WeeklyDateTime(weekStart).increment({ days: idx }),
          new WeeklyDateTime(weekStart).increment({ days: idx, hours })
        )
      );
      return arr;
    }, new WeeklyTimeRangeCollection());

    // Conver hoursExceptions into range format
    const additiveExceptions = new TimeRangeCollection();
    const subtractiveExceptions = new TimeRangeCollection();
    Object.entries(hoursExceptions).forEach(([dateStr, numHours]) => {
      if (numHours > 24) throw new Error("Can't work more than 24 hours in one day");
      if (numHours < 0) throw new Error("Can't work less than 0 hours in one day");
      if (numHours > 0) {
        const start = DateTime.fromDateStr(dateStr);
        const end = start.copy().setHours(numHours);
        additiveExceptions.push(new TimeRange(start, end));
      }
      if (numHours < 24) {
        const start = DateTime.fromDateStr(dateStr).setHours(numHours);
        const end = start.copy().setHours(24);
        subtractiveExceptions.push(new TimeRange(start, end));
      }
    });
    additiveExceptions.sort((a, b) => (a.start > b.start ? 1 : -1));
    subtractiveExceptions.sort((a, b) => (a.start > b.start ? 1 : -1));

    this.workingHoursExceptions = {
      additiveExceptions,
      subtractiveExceptions,
    };
  }

  getUnscheduledRanges(boundingTimeRange) {
    const { additiveExceptions, subtractiveExceptions } = this.workingHoursExceptions;
    const alreadyScheduled = this._scheduledTimeRanges.intersection(boundingTimeRange);

    return this.workingHours
      .intersection(boundingTimeRange)
      .union(additiveExceptions.intersection(boundingTimeRange))
      .subtract(subtractiveExceptions.intersection(boundingTimeRange))
      .subtract(alreadyScheduled);
  }
}
