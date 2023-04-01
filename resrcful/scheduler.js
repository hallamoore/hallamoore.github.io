import { DateTime, WeeklyDateTime } from "./time/datetime.js";
import { TimeRange, WeeklyTimeRange } from "./time/timerange.js";
import { TimeRangeCollection, WeeklyTimeRangeCollection } from "./time/timerange_collection.js";
import { Target } from "./target.js";
import { Employee } from "./employee.js";

function getPrioritizedUnfinishedTargets(targets) {
  // OPT: add option to specify if we know the array is already sorted
  return targets
    .filter((target) => target.unscheduledPersonHoursRemaining() > 0)
    .sort((a, b) => (a.priority > b.priority ? 1 : -1));
}

function assignTimeRanges({
  prioritizedUnfinishedTargets,
  targetsByName,
  parentHierarchy = [],
  schedulerIterationId,
  boundingTimeRange,
}) {
  let assignedTimeRanges = [];
  for (let target of prioritizedUnfinishedTargets) {
    if (target.isBlocked(schedulerIterationId)) continue;

    if (target.hasSubtargets) {
      const subAssignedTimeRanges = assignTimeRanges({
        prioritizedUnfinishedTargets: getPrioritizedUnfinishedTargets(
          Object.values(target.subtargets)
        ),
        targetsByName,
        schedulerIterationId,
        boundingTimeRange,
        parentHierarchy: parentHierarchy.concat(target.name),
      });
      assignedTimeRanges = assignedTimeRanges.concat(subAssignedTimeRanges);
      continue;
    }

    for (let employeeName of target.canBeDoneBy) {
      const employee = employeesByName[employeeName];
      const availableRanges = employee.getUnscheduledRanges(boundingTimeRange);
      if (availableRanges.length === 0) continue;

      for (let range of availableRanges) {
        range.targetHierarchy = parentHierarchy.concat(target.name);
        assignedTimeRanges.push(range);
        target._scheduledTimeRanges.push(range);
        employee._scheduledTimeRanges.push(range);
      }

      if (target.unscheduledPersonHoursRemaining() <= 0) {
        target.schedulerProperties.finishedAt = schedulerIterationId;
        break;
      }
    }
  }

  return assignedTimeRanges;
}

const employeesByName = {};
const targetsByName = {};

export function schedule({
  targets,
  employees,
  // if this is changed, make sure to change the startDate in Timeline too
  startDate = new DateTime().toStartOfDay(),
}) {
  employees = employees.map((emp) => {
    emp = new Employee(emp);
    employeesByName[emp.name] = emp;
    return emp;
  });

  Target.deleteAll();
  targets = Object.entries(targets).map(([id, t]) => {
    t = new Target(id, t);
    targetsByName[t.name] = t;
    return t;
  });

  let assignedTimeRanges = [];
  let consecutiveRoundsWithoutProgress = 0;
  let schedulerIterationId = 0;
  let prioritizedUnfinishedTargets = getPrioritizedUnfinishedTargets(targets);
  const boundingTimeRange = new TimeRange(startDate, startDate.copy().increment({ days: 1 }));

  while (consecutiveRoundsWithoutProgress < 10) {
    const currAssignedTimeRanges = assignTimeRanges({
      prioritizedUnfinishedTargets,
      targetsByName,
      schedulerIterationId,
      boundingTimeRange,
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

    boundingTimeRange.moveBy({ days: 1 });
    schedulerIterationId++;
  }

  return { targets };
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
