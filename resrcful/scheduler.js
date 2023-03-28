const decreasingUnits = ["Day", "Hours", "Minutes", "Seconds", "Milliseconds"];

class WeeklyDate extends Date {
  _glt(other, gtOrLt) {
    for (let unit of decreasingUnits) {
      const ours = this[`get${unit}`]();
      const theirs = other[`get${unit}`]();
      if (ours != theirs) {
        if (gtOrLt === "gt") {
          return ours > theirs;
        } else if (gtOrLt === "lt") {
          return ours < theirs;
        }
        throw new Error('gtOrLt must be "gt" or "lt"');
      }
    }
    return false;
  }

  isBefore(other) {
    return this._glt(other, "lt");
  }

  isAfter(other) {
    return this._glt(other, "gt");
  }

  equals(other) {
    return !this._glt(other, "gt") && !this._glt(other, "lt");
  }
}

function copyDate(date) {
  return new Date(date.getTime());
}

function asWeeklyDate(date) {
  return new WeeklyDate(date.getTime());
}

class Timeblock {
  constructor(start, end) {
    this.start = copyDate(start);
    this.end = copyDate(end);
  }

  durationInHours() {
    return (this.end - this.start) / 1000 / 60 / 60;
  }

  subtract(other) {
    if (this.start < other.start) {
      if (this.end < other.start) {
        return [this];
      }
      if (this.end < other.end) {
        return [new Timeblock(this.start, other.start)];
      }
      return [new Timeblock(this.start, other.start), new Timeblock(other.end, this.end)];
    }
    if (other.end < this.start) {
      return [this];
    }
    if (other.end < this.end) {
      return [new Timeblock(other.end, this.end)];
    }
    return [];
  }

  union(other) {
    if (this.start < other.start) {
      if (this.end < other.start) {
        return [this, other];
      }
      if (this.end < other.end) {
        return [new Timeblock(this.start, other.end)];
      }
      return [this];
    }
    if (other.end < this.start) {
      return [other, this];
    }
    if (other.end < this.end) {
      return [new Timeblock(other.start, this.end)];
    }
    return [other];
  }

  intersection(other) {
    if (this.end < other.start || this.start >= other.end) {
      return null;
    }
    const start = this.start > other.start ? this.start : other.start;
    const end = this.end < other.end ? this.end : other.end;
    return new Timeblock(start, end);
  }
}

function resolveWeeklyDate(weeklyDate, dateRef) {
  const result = copyDate(dateRef);
  for (let blah of ["Hours", "Minutes", "Seconds", "Milliseconds"]) {
    result[`set${blah}`](weeklyDate[`get${blah}`]());
  }
  const idk = dateRef.getDay() - weeklyDate.getDay();
  result.setDate(dateRef.getDate() - idk);
  return result;
}

function groupUnion(timeblocksA, timeblocksB) {
  let results = [];
  let indexA = 0;
  let indexB = 0;
  while (indexA < timeblocksA.length || indexB < timeblocksB.length) {
    const timeblockA = timeblocksA[indexA];
    const timeblockB = timeblocksB[indexB];
    let earliest;
    if (timeblockA && (!timeblockB || timeblockA.start < timeblockB.start)) {
      earliest = timeblockA;
      indexA++;
    } else {
      earliest = timeblockB;
      indexB++;
    }
    if (results.length === 0) {
      results.push(earliest);
      continue;
    }

    const lastPushed = results.pop();
    results = results.concat(lastPushed.union(earliest));
  }
  return results;
}

function groupSubtract(timeblocksA, timeblocksB) {
  let indexB = 0;
  let results = [];
  for (let timeblockA of timeblocksA) {
    if (indexB >= timeblocksB.length) {
      results.push(timeblockA);
      continue;
    }
    while (indexB < timeblocksB.length) {
      const timeblockB = timeblocksB[indexB];
      results = results.concat(timeblockA.subtract(timeblockB));
      if (timeblockA.end < timeblockB.end) {
        break; // continue to next timeblockA
      }
      indexB++;
      timeblockA = results.pop();
    }
  }
  return results;
}

class WeeklyTimeblock extends Timeblock {
  // time and day of week matters, but this class is date-agnostic
  constructor(start, end) {
    super(start, end);
    this.start = asWeeklyDate(start);
    this.end = asWeeklyDate(end);
  }

  endsBefore(date) {
    return this.end.isBefore(date);
  }

  startsAfter(date) {
    return this.start.isAfter(date);
  }

  toTimeblock(dateRef) {
    const start = resolveWeeklyDate(this.start, dateRef);
    const end = resolveWeeklyDate(this.end, dateRef);
    return new Timeblock(start, end);
  }

  intersection(other) {
    if (
      this.endsBefore(other.start) ||
      this.startsAfter(other.end) ||
      this.start.equals(other.end)
    ) {
      return null;
    }
    const thisAsTimeblock = this.toTimeblock(other.start);
    const start = thisAsTimeblock.start > other.start ? thisAsTimeblock.start : other.start;
    const end = thisAsTimeblock.end < other.end ? thisAsTimeblock.end : other.end;
    return new Timeblock(start, end);
  }
}

function getNextWeekBoundary(date) {
  const nextWeekBoundary = copyDate(date);
  nextWeekBoundary.setHours(24);
  nextWeekBoundary.setMinutes(0);
  nextWeekBoundary.setSeconds(0);
  nextWeekBoundary.setMilliseconds(0);
  const diff = 7 - nextWeekBoundary.getDay();
  nextWeekBoundary.setDate(nextWeekBoundary.getDate() + diff);
  return nextWeekBoundary;
}

function getPreviousWeekBoundary(date) {
  const prevWeekBoundary = copyDate(date);
  prevWeekBoundary.setHours(0);
  prevWeekBoundary.setMinutes(0);
  prevWeekBoundary.setSeconds(0);
  prevWeekBoundary.setMilliseconds(0);
  prevWeekBoundary.setDate(prevWeekBoundary.getDate() - prevWeekBoundary.getDay());
  return prevWeekBoundary;
}

function buildEmployeeWeeklyWorkBlocks(employee) {
  const result = [];
  const weekStart = getNextWeekBoundary(new Date());
  for (let i = 0; i < 7; i++) {
    if (employee.hoursPerDay[i] <= 0) continue;
    const start = asWeeklyDate(weekStart);
    start.setDate(start.getDate() + i);
    const end = asWeeklyDate(start);
    end.setHours(employee.hoursPerDay[i]);
    result.push(new WeeklyTimeblock(start, end));
  }
  return result;
}

function dateStrToDate(dateStr) {
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

function getEmployeeExceptionWorkBlocks(employee) {
  const results = [];
  Object.entries(employee.hoursExceptions).forEach(([dateStr, numHours]) => {
    if (numHours > 24) throw new Error("Can't work more than 24 hours in one day");
    if (numHours < 0) throw new Error("Can't work less than 0 hours in one day");
    if (numHours > 0) {
      const start = dateStrToDate(dateStr);
      const end = copyDate(start);
      end.setHours(numHours);
      const addedWork = new Timeblock(start, end);
      addedWork.isAddedWork = true;
      results.push(addedWork);
    }
    if (numHours < 24) {
      const start = dateStrToDate(dateStr);
      start.setHours(numHours);
      const end = copyDate(start);
      end.setHours(24);
      const removedWork = new Timeblock(start, end);
      removedWork.isRemovedWork = true;
      results.push(removedWork);
    }
  });
  results.sort((a, b) => (a.start > b.start ? 1 : -1));
  return results;
}

function getTimeblocksInRange(orderedTimeblocks, start, end, { timeblocksAreWeekly = false } = {}) {
  if (timeblocksAreWeekly) {
    // not only are the timeblocks weekly, but the array represents one week from sun midnight utc to next sun midnight utc
    const a = getPreviousWeekBoundary(start);
    const b = getNextWeekBoundary(end);
    const weekDiff = (b - a) / 1000 / 60 / 60 / 24 / 7;
    for (let i = 0; i < weekDiff - 1; i++) {
      orderedTimeblocks = orderedTimeblocks.concat(orderedTimeblocks);
    }
  }

  const results = [];
  const tb = new Timeblock(start, end);
  for (let block of orderedTimeblocks) {
    const next = block.intersection(tb);
    if (!next && results.length > 0) {
      break;
    }
    if (next) {
      results.push(next);
    }
  }
  return results;
}

function getEmployeeWorkBlocks(employee, start, end) {
  const usualWorkingHours = buildEmployeeWeeklyWorkBlocks(employee); // TODO: build once, not every time
  const usualWorkingHoursInRange = getTimeblocksInRange(usualWorkingHours, start, end, {
    timeblocksAreWeekly: true,
  });
  const exceptionBlocks = getEmployeeExceptionWorkBlocks(employee);

  let toAdd = [];
  let toRemove = [];
  exceptionBlocks.forEach((timeblock) => {
    if (timeblock.isAddedWork) {
      toAdd.push(timeblock);
    }
    if (timeblock.isRemovedWork) {
      toRemove.push(timeblock);
    }
  });

  toAdd = getTimeblocksInRange(toAdd, start, end);
  toRemove = getTimeblocksInRange(toRemove, start, end);

  let workingHours = groupUnion(usualWorkingHoursInRange, toAdd);
  workingHours = groupSubtract(workingHours, toRemove);
  return workingHours;
}

// Can't use a single character like "." because it's very possible for that to be a real-use
// character in the target names
const subtargetSeparator = "|subtargetSeparator|";

function assignTimeblocks({
  timeblocksByEmployee,
  prioritizedUnfinishedTargets,
  personHoursRemaining,
}) {
  const assignedTargets = [];
  const finishingInTimeFrame = [];
  for (let target of prioritizedUnfinishedTargets) {
    const blocked = target.blockedBy?.some((blockingTargetName) => {
      return (
        getPersonHoursRemaining(personHoursRemaining[blockingTargetName]) > 0 ||
        finishingInTimeFrame.includes(blockingTargetName)
      );
    });
    if (blocked) continue;
    // scheduleByTarget[target.name][getDateString(date)] = [];

    const subtargets = Object.values(target.subtargets || {});
    if (subtargets.length > 0) {
      let prioritizedUnfinishedSubtargets = subtargets
        .filter(
          // TODO: a subtarget can also have subtargets, need to add a personHoursRemaining property
          // on parent that's calculated from its subtargets
          (subtarget) =>
            getPersonHoursRemaining(personHoursRemaining[target.name][subtarget.name]) > 0
        )
        .sort((a, b) => (a.priority > b.priority ? 1 : -1));

      const assignedSubtargets = assignTimeblocks({
        timeblocksByEmployee,
        prioritizedUnfinishedTargets: prioritizedUnfinishedSubtargets,
        personHoursRemaining: personHoursRemaining[target.name],
      });
      assignedSubtargets.forEach((subtarget) => {
        assignedTargets.push(`${target.name}${subtargetSeparator}${subtarget}`);
      });
      continue;
    }

    for (let employeeName of target.canBeDoneBy) {
      if (!(employeeName in timeblocksByEmployee)) continue;

      const timeblock = timeblocksByEmployee[employeeName];
      timeblock.target = target.name;
      personHoursRemaining[target.name] -= timeblock.durationInHours();
      delete timeblocksByEmployee[employeeName];
      // scheduleByTarget[target.name][getDateString(date)].push(employeeName);
      assignedTargets.push(target.name);

      if (getPersonHoursRemaining(personHoursRemaining[target.name]) <= 0) {
        finishingInTimeFrame.push(target.name);
        break;
      }
    }
  }
  return assignedTargets;
}

// target = {
//   name: "Something",
//   priority: 3,
//   canBeDoneBy: ["Someone"],
//   personHoursRemaining: 100,
//   blockedBy: ["Another target"],
//   subtargets: {[id]: target},
// };

function getDateString(date) {
  return date.toISOString().split("T")[0];
}

function buildPersonHoursRemaining(targets) {
  const result = {};
  Object.values(targets).forEach((target) => {
    if (Object.keys(target.subtargets || {}).length > 0) {
      result[target.name] = buildPersonHoursRemaining(target.subtargets);
    } else {
      result[target.name] = parseFloat(target.personHoursRemaining);
    }
  });
  return result;
}

function getPersonHoursRemaining(personHoursRemaining) {
  if (typeof personHoursRemaining == "number") {
    return personHoursRemaining;
  }
  if (typeof personHoursRemaining != "object") {
    throw new Error(`Unexpected type for personHoursRemaining: ${typeof personHoursRemaining}`);
  }
  return Object.values(personHoursRemaining).reduce(
    (sum, item) => sum + getPersonHoursRemaining(item),
    0
  );
}

export function schedule({ targets, employees, startDate = new Date() }) {
  // workspace so that we don't modify the values on the actual targets
  const personHoursRemaining = buildPersonHoursRemaining(targets);
  const scheduleByTarget = {};
  targets.forEach((target) => {
    scheduleByTarget[target.name] = {};
  });
  //
  // const scheduleByEmployee = {};
  // employees.forEach((employee) => {
  //   scheduleByEmployee[employee.name] = {};
  // });

  let prioritizedUnfinishedTargets = [...targets].sort((a, b) =>
    a.priority > b.priority ? 1 : -1
  );

  // if this is changed, make sure to change the startDate in Timeline too
  let date = startDate;
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  let consecutiveRoundsWithoutProgress = 0;
  while (consecutiveRoundsWithoutProgress < 10) {
    const end = copyDate(date);
    end.setDate(end.getDate() + 1);

    const timeblocksByEmployee = {};
    employees.forEach((employee) => {
      const timeblocks = getEmployeeWorkBlocks(employee, date, end);
      if (timeblocks.length > 1) {
        throw new Error("Code doesn't support multiple time blocks per employee in one iteration");
      }
      if (timeblocks.length === 1) {
        timeblocksByEmployee[employee.name] = timeblocks[0];
      }
    });

    const assignedTargets = assignTimeblocks({
      timeblocksByEmployee,
      prioritizedUnfinishedTargets,
      personHoursRemaining,
    });

    assignedTargets.forEach((targetName) => {
      let schedule = scheduleByTarget;
      for (let part of targetName.split(subtargetSeparator)) {
        if (!schedule[part]) {
          schedule[part] = {};
        }
        schedule = schedule[part];
      }
      schedule[getDateString(date)] = ["someone"];
    });

    prioritizedUnfinishedTargets = prioritizedUnfinishedTargets.filter(
      (target) => getPersonHoursRemaining(personHoursRemaining[target.name]) > 0
    );
    if (prioritizedUnfinishedTargets.length === 0) {
      break;
    }

    if (assignedTargets.length == 0) {
      consecutiveRoundsWithoutProgress++;
    } else {
      consecutiveRoundsWithoutProgress = 0;
    }

    date.setDate(date.getDate() + 1);
  }

  return [scheduleByTarget, {}];
  // return [scheduleByTarget, scheduleByEmployee];
}

// employee = {
//   name: "Someone",
//   hoursPerDay: [0, 8, 8, 8, 8, 8, 0],
//   hoursExceptions: {'2023-04-15': 0}
// }

function employeeHoursForDate(employee, date) {
  return employee.hoursExceptions[getDateString(date)] ?? employee.hoursPerDay[date.getDay()];
}

// console.log(
//   schedule({
//     targets: [
//       {
//         name: "Target A",
//         priority: 3,
//         canBeDoneBy: ["Employee A"],
//         personHoursRemaining: 35,
//       },
//       {
//         name: "Target B",
//         priority: 0,
//         canBeDoneBy: ["Employee A"],
//         personHoursRemaining: 35,
//       },
//     ],
//     employees: [
//       {
//         name: "Employee A",
//         hoursPerDay: [0, 8, 8, 8, 8, 8, 0],
//         hoursExceptions: { "2023-04-15": 0 },
//       },
//       {
//         name: "Employee B",
//         hoursPerDay: [0, 8, 8, 8, 8, 8, 0],
//         hoursExceptions: { "2023-04-15": 0 },
//       },
//     ],
//   })
// );

// setTimeout(() => document.getElementById("calculate")?.click(), 100);
