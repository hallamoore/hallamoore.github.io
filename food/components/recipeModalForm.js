import { Input, ModalForm, Textarea } from "../../elements/index.js";

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
        new Input({ label: "Title", attrs: { name: "title" } }),
        new Input({ label: "Original Source", attrs: { name: "originalSource" } }),
        new Input({ label: "Prep Time", attrs: { name: "prepTime" } }),
        new Input({ label: "Cook Time", attrs: { name: "cookTime" } }),
        new Input({ label: "Inactive Time", attrs: { name: "inactiveTime" } }),
        new Input({ label: "Total Time", attrs: { name: "totalTime" } }),
        new Input({ label: "Yield", attrs: { name: "yieldAmount" } }),
        new Textarea({ attrs: { name: "ingredients" } }),
        new Textarea({ attrs: { name: "directions" } }),
        new Textarea({ attrs: { name: "notes" } }),
        new Textarea({ attrs: { name: "nutrition" } }),
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
