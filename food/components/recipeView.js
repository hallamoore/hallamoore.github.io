import { Div } from "../../elements/index.js";

export default class RecipeView extends Div {
  constructor({ recipeId }) {
    super({ contents: `recipe ${recipeId}` });
  }
}
