import { LabeledInput, ModalForm, Textarea } from "../../elements/index.js";

import { getIngredientDisplay } from "./recipeView/ingredient.js";
import { getTimeDisplay } from "./recipeView/timings.js";

const transformDBRecipe = ({
  id,
  prepTimeMins,
  cookTimeMins,
  inactiveTimeMins,
  totalTimeMins,
  ingredients,
  ...recipe
}) => {
  if (prepTimeMins) recipe.prepTime = getTimeDisplay(prepTimeMins);
  if (cookTimeMins) recipe.cookTime = getTimeDisplay(cookTimeMins);
  if (inactiveTimeMins) recipe.inactiveTime = getTimeDisplay(inactiveTimeMins);
  if (totalTimeMins) recipe.totalTime = getTimeDisplay(totalTimeMins);
  recipe.ingredients = ingredients.map(getIngredientDisplay).join("\n");
  return recipe;
};

export default class RecipeModalForm extends ModalForm {
  constructor({ title, submitButtonText, onSubmit }) {
    super({
      title,
      contents: [
        new LabeledInput({ label: "Title", name: "title" }),
        new LabeledInput({ label: "Original Source", name: "originalSource" }),
        new LabeledInput({ label: "Prep Time", name: "prepTime" }),
        new LabeledInput({ label: "Cook Time", name: "cookTime" }),
        new LabeledInput({ label: "Inactive Time", name: "inactiveTime" }),
        new LabeledInput({ label: "Total Time", name: "totalTime" }),
        new LabeledInput({ label: "Yield", name: "yieldAmount" }),
        new Textarea({ name: "ingredients" }),
        new Textarea({ name: "directions" }),
        new Textarea({ name: "notes" }),
        new Textarea({ name: "nutrition" }),
      ],
      submitButtonText,
      onSubmit,
    });
  }

  setValues(recipe) {
    if (recipe.id) {
      recipe = transformDBRecipe(recipe);
    }
    super.setValues(recipe);
  }
}
