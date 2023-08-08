import { Element } from "../../element.js";
import TargetRow from "./target_row.js";
import Calendar from "./calendar.js";

export default class TargetsCalendar extends Calendar {
  setDateRange = (dateRange) => {
    Calendar.setDateRange(this, dateRange);
    this.setTargets(...this.currentArgs);
  };

  setTargets(targets, { parentTarget, previousArgs } = {}) {
    this.currentArgs = [targets, { parentTarget, previousArgs }];

    this.rowsContainer.innerHTML = "";

    if (parentTarget) {
      this.rowsContainer.appendChild(
        new TargetRow({
          target: parentTarget,
          boundingTimeRange: this.dateRange,
          isBreadcrumbRow: true,
          onNavigateBack: () => {
            this.setTargets(...previousArgs);
          },
        })
      );
    }

    targets.forEach((target, idx) => {
      this.rowsContainer.appendChild(
        new TargetRow({
          target,
          boundingTimeRange: this.dateRange,
          onShowSubtargets: () => {
            this.setTargets(Object.values(target.subtargets), {
              parentTarget: target,
              previousArgs: [targets, { parentTarget, previousArgs }],
            });
          },
          zIndex: targets.length - idx,
        })
      );
    });
  }
}
