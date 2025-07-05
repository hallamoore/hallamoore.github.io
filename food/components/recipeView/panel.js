import { Div, Element } from "../../../elements/index.js";
import styler from "../../styler.js";

const panelItemCls = styler.defineClass("panel-item", (theme) => [
  ["margin", `${theme.spacer} 0px`],
]);

export const PanelItem = Div.extend({ className: panelItemCls.name });

const panelCls = styler.defineClass("panel", (theme) => [
  ["box-shadow", theme.boxShadow],
  ["margin", `${theme.spacer.large} ${theme.spacer}`],
  ["border-radius", theme.borderRadius],
  ["padding", theme.spacer],
]);

export default class Panel extends Div {
  constructor({ title, contents }) {
    super({
      className: panelCls.name,
      contents: [
        new Element({
          tagName: "h3",
          contents: title,
          style: { marginTop: 0, marginBottom: "5px" },
        }),
        ...(Array.isArray(contents) ? contents : [contents]),
      ],
    });
  }
}
