import { Element } from "../../element.js";
import EmployeeRow from "./employee_row.js";
import Calendar from "./calendar.js";

export default class EmployeesCalendar extends Calendar {
  setDateRange = (dateRange) => {
    Calendar.setDateRange(this, dateRange);
    this.setEmployees(...this.currentArgs);
  };

  setEmployees(employees) {
    this.currentArgs = [employees];
    this.rowsContainer.innerHTML = "";

    employees.forEach((employee, idx) => {
      employee.totalScheduledRange = () => {
        return this.dateRange;
      };
      this.rowsContainer.appendChild(
        new EmployeeRow({
          employee,
          boundingTimeRange: this.dateRange,
          zIndex: employees.length - idx,
          numCols: this.numCols,
          colDuration: this.colDuration,
        })
      );
    });
  }
}
