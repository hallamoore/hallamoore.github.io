import { DateTime, WeeklyDateTime } from "./time/datetime.js";
import { TimeRange, WeeklyTimeRange } from "./time/timerange.js";
import { TimeDelta } from "./time/timedelta.js";
import { TimeRangeCollection, WeeklyTimeRangeCollection } from "./time/timerange_collection.js";
import { Target } from "./target.js";
import { Employee } from "./employee.js";

const max = (...items) => items.reduce((acc, item) => (acc < item ? item : acc), -Infinity);

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

  getBlockedSequence(targetName, callers = []) {
    const target = this.flattenedUnfinishedTargets[targetName];
    if (!target) {
      console.log(targetName, callers);
    }
    if (target.hasSubtargets) {
      let result = [];
      this.unfinishedSubtargets[targetName].forEach((subtarget) => {
        result = result.concat(this.getBlockedSequence(subtarget.name, [...callers, targetName]));
      });
      return result;
    }
    const { blockerKey, type } = this.getActivity(targetName);
    if (type !== "blocked") {
      return [];
    }
    return [blockerKey, ...this.getBlockedSequence(blockerKey, [...callers, targetName])];
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

const sum = (items) => items.reduce((result, next) => result + next, 0);

const getTargetKey = (target) => `target:${target.name}`;
const employeeKey = (employee) => `employee:${employee.name}`;

function getPrioritizedUnfinishedTargets(targets) {
  // OPT: add option to specify if we know the array is already sorted
  targets = targets
    .filter((target) => {
      return !target.getFinishedAt();
    })
    .sort((a, b) => (a.priority > b.priority ? 1 : -1));

  let index = 0;
  while (index < targets.length) {
    const target = targets[index];
    if (target.hasSubtargets) {
      const subtargets = getPrioritizedUnfinishedTargets(Object.values(target.subtargets));
      targets.splice(index + 1, 0, ...subtargets);
    }
    index++;
  }

  return targets;
}

function removeFinishedTargets(targets, assignedTimeRanges) {
  return targets.filter((target) => {
    let assignedHours = 0;
    if (assignedTimeRanges[getTargetKey(target)]) {
      assignedHours = sum(
        assignedTimeRanges[getTargetKey(target)].ranges.map((range) => range.duration().hours)
      );
    }
    return (target._personHoursRemaining || 0) - assignedHours > 0;
  });
}

function assignTimeRanges({
  prioritizedUnfinishedTargets,
  parentHierarchy = [],
  boundingTimeRange,
  schedulerDebugger,
  assignedTimeRanges,
}) {
  schedulerDebugger.recordUnfinishedTargets({
    boundingTimeRange,
    targets: prioritizedUnfinishedTargets,
  });

  let madeProgress = false;

  for (let target of prioritizedUnfinishedTargets) {
    if (target.isBlockedAt(boundingTimeRange.start, schedulerDebugger)) continue;

    const targetKey = getTargetKey(target);

    for (let employeeName of target.canBeDoneBy) {
      const employee = employeesByName[employeeName];
      const availableRanges = employee.getUnscheduledRanges(boundingTimeRange).filter(
        (range) =>
          // TODO: optimize
          !assignedTimeRanges[employeeKey(employee)]?.ranges.some(
            (r) => r.start._jsDate.getTime() == range.start._jsDate.getTime()
          )
      );
      if (availableRanges.length === 0) continue;

      let finishedAt;
      for (let range of availableRanges) {
        range.targetHierarchy = parentHierarchy.concat(target.name);
        range.employeeName = employeeName;
        if (!assignedTimeRanges[employeeKey(employee)]) {
          assignedTimeRanges[employeeKey(employee)] = { employee, ranges: [] };
        }
        if (!assignedTimeRanges[targetKey]) {
          assignedTimeRanges[targetKey] = { target, ranges: [] };
        }

        if (target.maxAssigneesAtOnce) {
          const concurrentCount = assignedTimeRanges[targetKey].ranges.filter((r) => {
            return r.start._jsDate.getTime() === range.start._jsDate.getTime();
          }).length;

          if (concurrentCount >= target.maxAssigneesAtOnce) {
            break;
          }
        }

        assignedTimeRanges[employeeKey(employee)].ranges.push(range);
        assignedTimeRanges[targetKey].ranges.push(range);
        finishedAt = range.end;
        madeProgress = true;
      }

      const assignedHours = sum(
        assignedTimeRanges[targetKey].ranges.map((range) => range.duration().hours)
      );
      if ((target._personHoursRemaining || 0) - assignedHours <= 0) {
        // target.schedulerProperties.finishedAt = finishedAt;
        target.schedulerProperties.finishedAt = max(
          ...assignedTimeRanges[targetKey].ranges.map((r) => r.end)
        );
        schedulerDebugger.targetFinishedAt({ boundingTimeRange, target, finishedAt });
        break;
      }
    }
  }

  return madeProgress;
}

const employeesByName = {};

export function schedule({
  targets,
  employees,
  // if this is changed, make sure to change the startDate in Timeline too
  startDate = new DateTime().toStartOfDay(),
  iterationIncrement = new TimeDelta({ hours: 1 }),
}) {
  startDate = new DateTime(startDate);

  const schedulerDebugger = new SchedulerDebugger();

  employees = employees.map((emp) => {
    emp = new Employee(emp);
    employeesByName[emp.name] = emp;
    return emp;
  });

  Target.deleteAll();
  targets = Object.entries(targets).map(([id, t]) => new Target(id, t));

  schedulerDebugger.setTargets(targets);

  let assignedTimeRanges = {};
  let consecutiveRoundsWithoutProgress = 0;
  let prioritizedUnfinishedTargets = getPrioritizedUnfinishedTargets(targets);
  const boundingTimeRange = new TimeRange(
    startDate,
    startDate.copy().increment(iterationIncrement)
  );

  while (consecutiveRoundsWithoutProgress < 100) {
    const madeProgress = assignTimeRanges({
      prioritizedUnfinishedTargets,
      boundingTimeRange,
      schedulerDebugger,
      assignedTimeRanges,
    });

    prioritizedUnfinishedTargets = removeFinishedTargets(
      prioritizedUnfinishedTargets,
      assignedTimeRanges
    );
    if (prioritizedUnfinishedTargets.length === 0) {
      break;
    }

    if (madeProgress) {
      consecutiveRoundsWithoutProgress = 0;
    } else {
      consecutiveRoundsWithoutProgress++;
    }

    boundingTimeRange.moveBy(iterationIncrement);
  }

  Object.values(assignedTimeRanges).forEach(({ employee, target, ranges }) => {
    ranges.forEach((range) => {
      if (employee) {
        employee.scheduledTimeRanges.push(range);
      }
      if (target) {
        target._scheduledTimeRanges.push(range);
      }
    });
  });

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
