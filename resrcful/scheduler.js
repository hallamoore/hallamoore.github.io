// target = {
//   name: "Something",
//   priority: 3,
//   canBeDoneBy: ["Someone"],
//   personHoursRemaining: 100,
//   blockedBy: ["Another target"]
// };

function getDateString(date) {
  return date.toISOString().split("T")[0];
}

export function schedule({ targets, employees, startDate = new Date() }) {
  const personHoursRemaining = {}; // workspace so that we don't modify the values on the actual targets
  const scheduleByTarget = {};
  targets.forEach((target) => {
    scheduleByTarget[target.name] = {};
    personHoursRemaining[target.name] = target.personHoursRemaining;
  });

  const scheduleByEmployee = {};
  employees.forEach((employee) => {
    scheduleByEmployee[employee.name] = {};
  });

  let prioritizedUnfinishedTargets = [...targets].sort((a, b) =>
    a.priority > b.priority ? 1 : -1
  );

  let date = startDate;
  let consecutiveRoundsWithoutProgress = 0;
  while (consecutiveRoundsWithoutProgress < 10) {
    let progressed = false;
    // console.log(getDateString(date), employeeHoursForDate(employees[0], date));
    const availableEmployees = employees.filter(
      (employee) => employeeHoursForDate(employee, date) > 0
    );

    for (let target of prioritizedUnfinishedTargets) {
      const blocked = target.blockedBy?.some(
        (blockingTargetName) => personHoursRemaining[blockingTargetName] > 0
      );
      if (blocked) continue;
      scheduleByTarget[target.name][getDateString(date)] = [];

      for (let employeeName of target.canBeDoneBy) {
        const availableEmployeeIndex = availableEmployees.findIndex(
          (employee) => employee.name == employeeName
        );
        if (availableEmployeeIndex < 0) {
          continue;
        }
        progressed = true;
        const employee = availableEmployees[availableEmployeeIndex];
        scheduleByEmployee[employee.name][getDateString(date)] = target.name;
        scheduleByTarget[target.name][getDateString(date)].push(employee.name);

        availableEmployees.splice(availableEmployeeIndex, 1);
        personHoursRemaining[target.name] -= employeeHoursForDate(employee, date);

        if (personHoursRemaining[target.name] <= 0) {
          break;
        }
      }
    }

    prioritizedUnfinishedTargets = prioritizedUnfinishedTargets.filter(
      (target) => personHoursRemaining[target.name] > 0
    );
    if (prioritizedUnfinishedTargets.length === 0) {
      break;
    }

    if (!progressed) {
      consecutiveRoundsWithoutProgress++;
    } else {
      consecutiveRoundsWithoutProgress = 0;
    }

    date.setDate(date.getDate() + 1);
  }

  return [scheduleByTarget, scheduleByEmployee];
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
