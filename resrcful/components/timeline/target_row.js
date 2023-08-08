import { CSSValue } from "../../css_value.js";
import { Element } from "../../element.js";
import TargetBlock from "./target_block.js";

class TargetRowHeader extends Element {
  static tag = "div";
  static className = "target-row-header";

  constructor({ navDir, onNav, textContent, ...rest }) {
    super(rest);

    if (navDir === "back") {
      this.appendChild(
        new Element({
          tag: "div",
          className: "nav back",
          textContent: "◀",
          onclick: onNav,
        })
      );
    }

    this.appendChild(
      new Element({
        tag: "div",
        className: "title",
        textContent,
        title: textContent,
      })
    );

    if (navDir === "forward") {
      this.appendChild(
        new Element({
          tag: "div",
          className: "nav forward",
          textContent: "▶",
          onclick: onNav,
        })
      );
    }
  }
}

export default class TargetRow extends Element {
  static tag = "div";
  static className = "target-row";

  constructor({
    target,
    boundingTimeRange,
    onShowSubtargets,
    isBreadcrumbRow,
    onNavigateBack,
    zIndex, // note this is for TargetBlock, not TargetRow, so it doesn't go in `style`
    ...rest
  }) {
    super(rest);

    if (isBreadcrumbRow) {
      this.style.borderBottom = "solid 1px gray";
    }

    const header = new TargetRowHeader({
      textContent: target.name,
      navDir: isBreadcrumbRow ? "back" : target.hasSubtargets ? "forward" : null,
      onNav: isBreadcrumbRow ? onNavigateBack : onShowSubtargets,
    });

    this.appendChild(header);

    const totalRange = target.totalScheduledRange();
    const inRange = totalRange.intersection(boundingTimeRange);
    if (inRange) {
      // We need this wrapper because we want our empty/spacer div and the TargetBlock to be in the
      // same grid cell.
      //
      // Note 1: We could potentially use flex instead of grid on TargetRow, but we'd still need a
      // wrapper here with a flex-grow of 1 so that the spacer div and TargetBlock width
      // calculations don't need to be aware of how wide the header is.
      //
      // Note 2: We use a spacer div with a flex-shrink of 1 instead of setting margin-left on the
      // TargetBlock because we need TargetBlocks that expand on hover to be able to expand left if
      // there's not enough room to the right.
      //
      const wrapper = new Element({ tag: "div", style: { display: "flex" } });
      this.appendChild(wrapper);
      wrapper.appendChild(
        new Element({
          tag: "div",
          style: {
            width: new CSSValue(
              100 *
                (inRange.start.subtract(boundingTimeRange.start) / boundingTimeRange.duration()),
              "%"
            ),
            flexShrink: 1,
          },
        })
      );

      const employeeNames = new Set();
      target.mergedScheduledTimeRanges(boundingTimeRange).forEach((mergedRange) => {
        mergedRange.employeeNames.forEach((name) => employeeNames.add(name));
      });

      wrapper.appendChild(
        new TargetBlock({
          boundingTimeRange: inRange,
          totalRange,
          target,
          employees: [...employeeNames].map((name) => ({ name })),
          style: {
            zIndex, // required so that boxShadow isn't hidden behind next block
            width: new CSSValue(100 * (inRange.duration() / boundingTimeRange.duration()), "%"),
          },
        })
      );
    }
  }
}
