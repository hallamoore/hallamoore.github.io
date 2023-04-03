import { DateTime, WeeklyDateTime } from "./time/datetime.js";
import { TimeRange, WeeklyTimeRange } from "./time/timerange.js";
import { TimeDelta } from "./time/timedelta.js";
import { TimeRangeCollection, WeeklyTimeRangeCollection } from "./time/timerange_collection.js";
import { Target } from "./target.js";
import { Employee } from "./employee.js";

class IterationDebugger {
  constructor(boundingTimeRange) {
    this.boundingTimeRange = boundingTimeRange;
    this.flattenedUnfinishedTargets = {};
    this.unfinishedSubtargets = {};
    this.activity = {};
  }

  addUnfinishedTargets(targets) {
    targets.forEach((target) => {
      this.flattenedUnfinishedTargets[target.name] = target;
    });
  }

  setUnfinishedSubtargets(target, subtargets) {
    this.unfinishedSubtargets[target.name] = subtargets;
  }

  setActivity(target, activity) {
    this.activity[target.name] = activity;
  }

  getActivity(targetName) {
    return this.activity[targetName];
  }

  getBlockedSequence(targetName) {
    const target = this.flattenedUnfinishedTargets[targetName];
    if (target.hasSubtargets) {
      let result = [];
      this.unfinishedSubtargets[targetName].forEach((subtarget) => {
        result = result.concat(this.getBlockedSequence(subtarget.name));
      });
      return result;
    }
    const { blockerKey, type } = this.getActivity(targetName);
    if (type !== "blocked") {
      return [];
    }
    return [blockerKey, ...this.getBlockedSequence(blockerKey)];
  }
}

class SchedulerDebugger {
  constructor() {
    this.flattenedTargetsByName = {};
    this.iterationsByStart = {};
  }

  setTargets(targets) {
    Object.values(targets).forEach(this._addTarget);
  }

  _addTarget = (target) => {
    this.flattenedTargetsByName[target.name] = target;
    Object.values(target.subtargets).forEach(this._addTarget);
  };

  getIterationDebugger(boundingTimeRange) {
    if (!this.iterationsByStart[boundingTimeRange.start]) {
      this.iterationsByStart[boundingTimeRange.start] = new IterationDebugger(boundingTimeRange);
    }
    return this.iterationsByStart[boundingTimeRange.start];
  }

  recordUnfinishedTargets({ boundingTimeRange, targets }) {
    this.getIterationDebugger(boundingTimeRange).addUnfinishedTargets(targets);
  }

  setUnfinishedSubtargets({ boundingTimeRange, target, subtargets }) {
    this.getIterationDebugger(boundingTimeRange).setUnfinishedSubtargets(target, subtargets);
  }

  targetFinishedAt({ boundingTimeRange, target, finishedAt }) {
    this.getIterationDebugger(boundingTimeRange).setActivity(target, {
      type: "finished",
      finishedAt,
    });
  }

  maxAssigneesReached({ boundingTimeRange, target, numEmployeesAssignedToTarget }) {
    this.getIterationDebugger(boundingTimeRange).setActivity(target, {
      type: "maxAssigneesReached",
      numEmployeesAssignedToTarget,
    });
  }

  targetProgressed({ boundingTimeRange, target, numEmployeesAssignedToTarget }) {
    this.getIterationDebugger(boundingTimeRange).setActivity(target, {
      type: "progressed",
      numEmployeesAssignedToTarget,
    });
  }

  noEmployeesAvailable({ boundingTimeRange, target }) {
    this.getIterationDebugger(boundingTimeRange).setActivity(target, {
      type: "noEmployeesAvailable",
      employeeNames: target.canBeDoneBy,
    });
  }

  recordBlockedTarget({ startDate, target, blockerKey, leadTime, blockerDate, unblockedAt }) {
    this.iterationsByStart[startDate].setActivity(target, {
      type: "blocked",
      blockerKey,
      leadTime,
      blockerDate,
      unblockedAt,
    });
  }
}

function getPrioritizedUnfinishedTargets(targets) {
  // OPT: add option to specify if we know the array is already sorted
  return targets
    .filter((target) => target.unscheduledPersonHoursRemaining() > 0)
    .sort((a, b) => (a.priority > b.priority ? 1 : -1));
}

function assignTimeRanges({
  prioritizedUnfinishedTargets,
  parentHierarchy = [],
  boundingTimeRange,
  schedulerDebugger,
}) {
  schedulerDebugger.recordUnfinishedTargets({
    boundingTimeRange,
    targets: prioritizedUnfinishedTargets,
  });

  let assignedTimeRanges = [];
  for (let target of prioritizedUnfinishedTargets) {
    if (target.isBlockedAt(boundingTimeRange.start, schedulerDebugger)) continue;

    if (target.hasSubtargets) {
      const subtargets = getPrioritizedUnfinishedTargets(Object.values(target.subtargets));
      schedulerDebugger.setUnfinishedSubtargets({ boundingTimeRange, target, subtargets });
      const subDebugInfo = {};
      const subAssignedTimeRanges = assignTimeRanges({
        prioritizedUnfinishedTargets: subtargets,
        boundingTimeRange,
        parentHierarchy: parentHierarchy.concat(target.name),
        schedulerDebugger,
      });
      assignedTimeRanges = assignedTimeRanges.concat(subAssignedTimeRanges);
      continue;
    }

    let numEmployeesAssignedToTarget = 0;
    for (let employeeName of target.canBeDoneBy) {
      const employee = employeesByName[employeeName];
      const availableRanges = employee.getUnscheduledRanges(boundingTimeRange);
      if (availableRanges.length === 0) continue;

      let finishedAt;
      for (let range of availableRanges) {
        range.targetHierarchy = parentHierarchy.concat(target.name);
        range.employeeName = employeeName;
        assignedTimeRanges.push(range);
        target._scheduledTimeRanges.push(range);
        employee.scheduledTimeRanges.push(range);
        finishedAt = range.end;
      }

      if (target.unscheduledPersonHoursRemaining() <= 0) {
        target.schedulerProperties.finishedAt = finishedAt;
        schedulerDebugger.targetFinishedAt({ boundingTimeRange, target, finishedAt });
        break;
      }

      numEmployeesAssignedToTarget++;
      if (numEmployeesAssignedToTarget >= target.maxAssigneesAtOnce) {
        schedulerDebugger.maxAssigneesReached({
          boundingTimeRange,
          target,
          numEmployeesAssignedToTarget,
        });
        break;
      }
    }

    if (numEmployeesAssignedToTarget.length > 0) {
      schedulerDebugger.targetProgressed({
        boundingTimeRange,
        target,
        numEmployeesAssignedToTarget,
      });
    } else {
      schedulerDebugger.noEmployeesAvailable({ boundingTimeRange, target });
    }
  }

  return assignedTimeRanges;
}

const employeesByName = {};

export function schedule({
  targets,
  employees,
  // if this is changed, make sure to change the startDate in Timeline too
  startDate = new DateTime().toStartOfDay(),
  iterationIncrement = new TimeDelta({ hours: 1 }),
}) {
  const schedulerDebugger = new SchedulerDebugger();

  employees = employees.map((emp) => {
    emp = new Employee(emp);
    employeesByName[emp.name] = emp;
    return emp;
  });

  Target.deleteAll();
  targets = Object.entries(targets).map(([id, t]) => new Target(id, t));

  schedulerDebugger.setTargets(targets);

  let assignedTimeRanges = [];
  let consecutiveRoundsWithoutProgress = 0;
  let prioritizedUnfinishedTargets = getPrioritizedUnfinishedTargets(targets);
  const boundingTimeRange = new TimeRange(
    startDate,
    startDate.copy().increment(iterationIncrement)
  );

  while (consecutiveRoundsWithoutProgress < 100) {
    const currAssignedTimeRanges = assignTimeRanges({
      prioritizedUnfinishedTargets,
      boundingTimeRange,
      schedulerDebugger,
    });
    assignedTimeRanges = assignedTimeRanges.concat(currAssignedTimeRanges);

    prioritizedUnfinishedTargets = getPrioritizedUnfinishedTargets(prioritizedUnfinishedTargets);
    if (prioritizedUnfinishedTargets.length === 0) {
      break;
    }

    if (currAssignedTimeRanges.length == 0) {
      consecutiveRoundsWithoutProgress++;
    } else {
      consecutiveRoundsWithoutProgress = 0;
    }

    boundingTimeRange.moveBy(iterationIncrement);
  }
  if (consecutiveRoundsWithoutProgress != 0) {
    console.warn(
      `Didn't finish scheduling, logic didn't make any progress for ${consecutiveRoundsWithoutProgress} rounds`
    );
    const firstNonProgressStart = boundingTimeRange.start
      .copy()
      .decrement(iterationIncrement.milliseconds * consecutiveRoundsWithoutProgress);
    console.log(schedulerDebugger.iterationsByStart[firstNonProgressStart]);
  }
  console.log(schedulerDebugger);

  return { targets, employees };
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null) return false;

  if (typeof a == "object" && typeof b == "object") {
    if (Object.keys(a).length != Object.keys(b).length) return false;

    return !Object.entries(a).some(([key, value], idx) => {
      return !deepEqual(value, b[key]);
    });
  }
  return false;
}

// setTimeout(() => document.getElementById("calculate")?.click(), 100);
