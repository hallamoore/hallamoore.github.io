import { Div, Element } from "../../../elements/index.js";
import Styler from "../../../styler/index.js";

const styler = Styler();

const panelItemClassName = "panel-item";
styler.defineClass(panelItemClassName, [["margin", "10px 0px"]]);

export class PanelItem extends Div {
  constructor({ contents }) {
    super({ attrs: { className: panelItemClassName }, contents });
  }
}

const panelClassName = "panel";

styler.defineClass(panelClassName, [
  ["box-shadow", "-1px 1px 5px gray"],
  ["margin", "15px 10px"],
  ["border-radius", "5px"],
  ["padding", "10px"],
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
