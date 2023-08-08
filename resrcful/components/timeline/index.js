import schedulerResult from "../../test/data/scheduler_result_1.js";
import { DateTime } from "../../time/datetime.js";
import { TimeDelta } from "../../time/timedelta.js";
import { TimeRange } from "../../time/timerange.js";
import { Target } from "../../target.js";
import { Employee } from "../../employee.js";
import { Element } from "../../element.js";
import Calendar from "./calendar.js";
import TargetsCalendar from "./targets_calendar.js";
import EmployeesCalendar from "./employees_calendar.js";
import DateSwitcher from "./date_switcher.js";
import TabSwitcher from "./tab_switcher.js";

function getStartDate() {
  // if this is changed, make sure to change how the start date in schedule() is constructed too
  return new DateTime().toStartOfDay();
}

export default class Timeline extends Element {
  static tag = "div";
  static className = "timeline";

  constructor({ schedule = schedulerResult, ...rest } = {}) {
    super(rest);

    // const startDate = new DateTime("Fri Apr 07 2023 00:00:00 GMT-0400 (Eastern Daylight Time)");
    const startDate = getStartDate();
    const endDate = startDate.copy().increment({ days: 14 });
    const colDuration = new TimeDelta({ days: 1 });
    const dateRange = new TimeRange(startDate, endDate);

    const targetsCal = new TargetsCalendar({
      headerTextContent: "Target",
      dateRange,
      colDuration,
    });

    const employeesCal = new EmployeesCalendar({
      headerTextContent: "Employee",
      dateRange,
      colDuration,
    });
    employeesCal.hide();

    const navigation = new Element({ tag: "div", className: "navigation" });
    this.appendChild(navigation);

    const tabSwitcher = new TabSwitcher({
      tabs: [
        { name: "Targets", element: targetsCal, selected: true },
        { name: "Employees", element: employeesCal },
      ],
      style: { flexGrow: 1 },
    });
    navigation.appendChild(tabSwitcher);

    navigation.appendChild(
      new DateSwitcher({
        dateRange: new TimeRange(startDate, endDate),
        onChange: (dateRange) => {
          targetsCal.setDateRange(dateRange);
          employeesCal.setDateRange(dateRange);
        },
      })
    );

    let { targets, employees } = schedule;
    targets = Object.entries(targets).map(([id, t]) => Target.fromSerialized(id, t));
    targetsCal.setTargets(targets);
    this.appendChild(targetsCal);

    employees = Object.values(employees).map((e) => Employee.fromSerialized(e));
    employeesCal.setEmployees(employees);
    this.appendChild(employeesCal);
  }
}
