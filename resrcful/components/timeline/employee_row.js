import { CSSValue } from "../../css_value.js";
import { Element } from "../../element.js";
import EmployeeBlock from "./target_block.js";

export default class EmployeeRow extends Element {
  static tag = "div";
  static className = "target-row";

  constructor({
    employee,
    boundingTimeRange,
    onShowSubemployees,
    onNavigateBack,
    zIndex, // note this is for EmployeeBlock, not EmployeeRow, so it doesn't go in `style`
    numCols,
    colDuration,
    ...rest
  }) {
    super(rest);

    this.appendChild(new Element({ tag: "div", textContent: employee.name }));

    // We need this wrapper because we want our empty/spacer div and the EmployeeBlock to be in the
    // same grid cell.
    //
    // Note 1: We could potentially use flex instead of grid on EmployeeRow, but we'd still need a
    // wrapper here with a flex-grow of 1 so that the spacer div and EmployeeBlock width
    // calculations don't need to be aware of how wide the header is.
    //
    // Note 2: We use a spacer div with a flex-shrink of 1 instead of setting margin-left on the
    // EmployeeBlock because we need EmployeeBlocks that expand on hover to be able to expand left if
    // there's not enough room to the right.
    //
    const wrapper = new Element({ tag: "div", style: { display: "flex" } });
    this.appendChild(wrapper);

    const {
      results: ranges,
      fullFirstRange,
      fullLastRange,
    } = employee.getBoundedMergedScheduledTimeRanges(boundingTimeRange);
    let last = boundingTimeRange.start;

    ranges.forEach((range, idx) => {
      wrapper.appendChild(
        new Element({
          tag: "div",
          style: {
            width: new CSSValue(
              100 * (range.start.subtract(last) / boundingTimeRange.duration()),
              "%"
            ),
            flexShrink: 1,
          },
        })
      );

      const totalRange =
        idx === 0 ? fullFirstRange : idx === ranges.length - 1 ? fullLastRange : range;

      wrapper.appendChild(
        new EmployeeBlock({
          totalRange,
          target: employee,
          employees: [{ name: range.targetHierarchy.at(-1) }],
          style: {
            zIndex, // required so that boxShadow isn't hidden behind next block
            width: new CSSValue(100 * (range.duration() / boundingTimeRange.duration()), "%"),
          },
        })
      );

      last = range.end;
    });
  }
}
