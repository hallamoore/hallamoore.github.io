import { Input, ModalForm, Textarea } from "../../elements/index.js";

export default class RecipeModalForm extends ModalForm {
  constructor() {
    super({
      title: "New recipe",
      contents: [
        new Input({ label: "Original Source", attrs: { name: "originalSource" } }),
        new Input({ label: "Prep Time", attrs: { name: "prepTime" } }),
        new Input({ label: "Cook Time", attrs: { name: "cookTime" } }),
        new Input({ label: "Total Time", attrs: { name: "totalTime" } }),
        new Input({ label: "Yield", attrs: { name: "yieldAmount" } }),
        new Textarea({ attrs: { name: "ingredients" } }),
        new Textarea({ attrs: { name: "directions" } }),
        new Textarea({ attrs: { name: "notes" } }),
      ],
      submitButtonText: "Create",
      onSubmit: () => {
        // TODO: create recipe on backend
      },
    });
  }
}
