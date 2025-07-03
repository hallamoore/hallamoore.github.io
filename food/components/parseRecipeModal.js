import { LabeledInput, ModalForm } from "../../elements/index.js";

export default class ParseRecipeModal extends ModalForm {
  constructor({ foodApi, onParsed }) {
    super({
      title: "New recipe from url",
      contents: [new LabeledInput({ label: "Url", attrs: { name: "url" } })],
      submitButtonText: "Import",
      onSubmit: async ({ url }) => {
        const { ingredients, directions, notes, ...parsed } = await foodApi.parseRecipeFromUrl({
          url,
        });
        onParsed({
          ...parsed,
          ingredients: ingredients.join("\n"),
          directions: directions,
          notes: notes,
        });
      },
    });
  }
}
