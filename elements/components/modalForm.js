import { Button, Div } from "../basicElements.js";
import styler from "../styler.js";

class ModalHeader extends Div {}

class ModalFooter extends Div {
  constructor({ submitButtonText, onSubmit, onCancel }) {
    super({
      contents: [
        new Button({
          contents: submitButtonText,
          onClick: onSubmit,
        }),
        new Button({
          contents: "Cancel",
          onClick: onCancel,
        }),
      ],
    });
  }
}

const modalClassName = "modal";

styler.defineClass(modalClassName, (theme) => [
  ["position", "absolute"],
  ["left", "50%"],
  ["top", "50%"],
  ["transform", "translate(-50%,-50%)"],
  ["background", theme.backgroundColor],
  ["border", theme.border],
  ["border-radius", theme.borderRadius.large],
  ["padding", theme.spacer.large],
]);

export default class ModalForm extends Div {
  constructor({ title, contents, submitButtonText, onSubmit }) {
    super({
      className: modalClassName,
      style: {
        display: "none", // TODO: use class instead
      },
    });

    this.setContents(
      new ModalHeader({
        contents: title,
      }),
      contents,
      new ModalFooter({
        submitButtonText,
        onSubmit: async () => {
          await onSubmit(this._getValues());
          this.close();
        },
        onCancel: () => this.close(),
      })
    );
  }

  open() {
    this.element.style.display = "";
  }

  close() {
    this.element.style.display = "none";
  }

  _getValues() {
    const values = {};
    for (let input of this.element.querySelectorAll("[name]")) {
      values[input.name] = input.value;
    }
    return values;
  }

  setValues(values) {
    for (let [key, value] of Object.entries(values)) {
      const input = this.element.querySelector(`[name=${key}]`);
      if (!input) {
        throw new Error(`No element with name '${key}'`);
      }
      input.value = value;
    }
  }
}
