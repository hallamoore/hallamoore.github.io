import { Div, Element } from "../../../elements/index.js";
import styler from "../../styler.js";

const panelItemClassName = "panel-item";
styler.defineClass(panelItemClassName, (theme) => [["margin", `${theme.spacer} 0px`]]);

export class PanelItem extends Div {
  constructor({ contents }) {
    super({ attrs: { className: panelItemClassName }, contents });
  }
}

const panelClassName = "panel";

styler.defineClass(panelClassName, (theme) => [
  ["box-shadow", theme.boxShadow],
  ["margin", `${theme.spacer.large} ${theme.spacer}`],
  ["border-radius", theme.borderRadius],
  ["padding", theme.spacer],
]);

export default class Panel extends Div {
  constructor({ title, contents }) {
    super({
      attrs: { className: panelClassName },
      contents: [
        new Element({
          tagName: "h3",
          contents: title,
          attrs: { style: { marginTop: 0, marginBottom: "5px" } },
        }),
        ...(Array.isArray(contents) ? contents : [contents]),
      ],
    });
  }
}
