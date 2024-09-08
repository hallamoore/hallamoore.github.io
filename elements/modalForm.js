import { Button, Div } from "./index.js";

class ModalHeader extends Div {}

class ModalFooter extends Div {
  constructor({ submitButtonText, onSubmit, onCancel }) {
    super({
      contents: [
        new Button({
          contents: submitButtonText,
          attrs: {
            onClick: onSubmit,
          },
        }),
        new Button({
          contents: "Cancel",
          attrs: {
            onClick: onCancel,
          },
        }),
      ],
    });
  }
}

export default class ModalForm extends Div {
  constructor({ title, contents, submitButtonText, onSubmit }) {
    super({
      attrs: {
        style: {
          display: "none", // TODO: use class instead
        },
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
