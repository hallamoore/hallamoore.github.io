import Panel, { PanelItem } from "./panel.js";

export const getTimeDisplay = (mins) => {
  const hours = Math.floor(mins / 60);
  const hoursUnit = hours === 1 ? "hr" : "hrs";
  const hoursDisplay = hours ? `${hours} ${hoursUnit}` : "";

  const remainingMins = mins % 60;
  const minsUnit = remainingMins === 1 ? "min" : "mins";
  const minsDisplay = remainingMins ? `${remainingMins} ${minsUnit}` : "";

  const spacer = hoursDisplay && minsDisplay ? " " : "";

  return `${hoursDisplay}${spacer}${minsDisplay}`;
};

export default class Timings extends Panel {
  constructor({ prepTimeMins, cookTimeMins, inactiveTimeMins, totalTimeMins }) {
    const contents = [
      prepTimeMins && new PanelItem({ contents: `Prep: ${getTimeDisplay(prepTimeMins)}` }),
      cookTimeMins && new PanelItem({ contents: `Cook: ${getTimeDisplay(cookTimeMins)}` }),
      inactiveTimeMins &&
        new PanelItem({ contents: `Inactive: ${getTimeDisplay(inactiveTimeMins)}` }),
      totalTimeMins && new PanelItem({ contents: `Total: ${getTimeDisplay(totalTimeMins)}` }),
    ].filter(Boolean);

    super({ title: "Timings", contents });
  }
}
