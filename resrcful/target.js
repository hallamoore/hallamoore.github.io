import { TimeRangeCollection } from "./time/timerange_collection.js";
import { TimeRange } from "./time/timerange.js";

let targets = {};

export class Target {
  constructor(
    id,
    {
      name, // string
      canBeDoneBy, // array of employee names, not ids (yet)
      personHoursRemaining, // optional number
      blockedBy, // array of target names, not ids (yet)
      priority = Infinity, // number, lower numbers are higher priority
      subtargets = {}, // keys are ids, values are recursive instances of these same arguments
      maxAssigneesAtOnce = Infinity, // number, how many employees can be assigned to a target during the same time range
    }
  ) {
    if (targets.hasOwnProperty(id)) throw new Error(`Target with id '${id}' already exists`);

    targets[id] = this;

    this.name = name;
    this.priority =
      typeof priority === "string" ? (priority === "" ? Infinity : parseFloat(priority)) : priority;
    this.canBeDoneBy = canBeDoneBy;
    this._personHoursRemaining =
      typeof personHoursRemaining === "string"
        ? parseFloat(personHoursRemaining)
        : personHoursRemaining;
    this.blockedBy = blockedBy;
    this.maxAssigneesAtOnce = maxAssigneesAtOnce;
    this.hasSubtargets = false;
    this.subtargets = Object.entries(subtargets).reduce((obj, [subId, subtarget]) => {
      this.hasSubtargets = true;
      obj[subId] = new Target(`${id}.${subId}`, subtarget);
      return obj;
    }, {});
    this._scheduledTimeRanges = new TimeRangeCollection();
    this.schedulerProperties = {
      // Not a date, but an identifier specifying which scheduler iteration the target reach 0
      // unscheduledPersonHoursRemaining
      finishedAt: undefined,
    };
  }

  static deleteAll() {
    targets = {};
  }

  personHoursRemaining() {
    if (this.hasSubtargets) {
      return Object.values(this.subtargets).reduce(
        (sum, subtarget) => sum + subtarget.personHoursRemaining(),
        0
      );
    }
    return this._personHoursRemaining || 0;
  }

  scheduledTimeRanges() {
    // Returns time ranges per employee, so if three employees are working on a target over the same
    // time period, three ranges with those datetimes will be in the return value.
    if (this.hasSubtargets) {
      const result = Object.values(this.subtargets).reduce(
        (arr, subtarget) => arr.concat(subtarget.scheduledTimeRanges()),
        new TimeRangeCollection()
      );
      // TODO: move utility into TimeRangeCollection. Merge overlapping ranges
      result.sort((a, b) => (a.start > b.start ? 1 : -1));
      return result;
    }
    return this._scheduledTimeRanges;
  }

  mergedScheduledTimeRanges(boundingTimeRange) {
    // In contrast to scheduledTimeRanges(), each time period only appears once in this return value
    const bounded = this.scheduledTimeRanges().intersection(boundingTimeRange, {
      keepValues: ["employeeName"],
    });
    const results = new TimeRangeCollection();
    let last;
    for (let timeRange of bounded) {
      if (!last) {
        last = timeRange;
        last.employeeNames = [];
      }

      if (timeRange.start.getTimestamp() === last.start.getTimestamp()) {
        if (timeRange.end.getTimestamp() !== last.end.getTimestamp()) {
          throw new Error("Expected time ranges to all be scheduled with the same interval");
        }
        last.employeeNames.push(timeRange.employeeName);
      } else {
        results.push(last);
        last = timeRange;
        last.employeeNames = [timeRange.employeeName];
      }
    }
    return results;
  }

  unscheduledPersonHoursRemaining() {
    // TODO: store number and subtract from it when time ranges are added, so that we don't
    // have to recalculate each time
    return this.scheduledTimeRanges().reduce(
      (remainingHours, timeRange) => remainingHours - timeRange.duration().hours,
      this.personHoursRemaining()
    );
  }

  isBlocked(schedulerIterationId) {
    // TODO: make it clearer that this returns whether the target is blocked at the current
    // iteration of the scheduler, not whether it's blocked today.
    return this.blockedBy?.some((blockingTargetName) => {
      // TODO: store blocking target ids instead of names
      const blockingTarget = Object.values(targets).find((t) => t.name == blockingTargetName);
      return (
        blockingTarget.unscheduledPersonHoursRemaining() > 0 ||
        blockingTarget.schedulerProperties.finishedAt === schedulerIterationId
      );
    });
  }
}
