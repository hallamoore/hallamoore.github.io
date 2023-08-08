import { Element } from "../../element.js";

export default class TabSwitcher extends Element {
  static tag = "div";

  constructor({ tabs, ...rest }) {
    super(rest);

    tabs.forEach(({ name, element, selected }) => {
      const tab = new Element({
        tag: "button",
        textContent: name,
        className: "tab",
        disabled: selected,
        associatedElement: element,
        onclick: (ev) => {
          this.selectedTab.disabled = false;
          this.selectedTab.associatedElement.hide();

          ev.target.disabled = true;
          ev.target.associatedElement.show();
          this.selectedTab = ev.target;
        },
      });
      if (selected) {
        this.selectedTab = tab;
      }
      this.appendChild(tab);
    });
  }
}
