import { Button, Form } from "../basicElements.js";
import LabeledInput from "./labeledInput.js";

export default class Login extends Form {
  constructor({ login } = {}) {
    const usernameInput = new LabeledInput({
      label: "Username:",
      attrs: { id: "username" },
    });

    const passwordInput = new LabeledInput({
      label: "Password:",
      attrs: { id: "password", type: "password" },
    });

    super({
      contents: [
        usernameInput,
        passwordInput,
        new Button({
          contents: "Login",
          attrs: {
            type: "button",
            onClick: () => {
              login({
                username: usernameInput.value,
                password: passwordInput.value,
              });
            },
          },
        }),
      ],
    });
  }
}
