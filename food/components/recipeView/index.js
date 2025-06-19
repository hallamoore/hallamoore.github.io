import { Div } from "../../../elements/index.js";

export default class RecipeView extends Div {
  constructor({ foodApi, recipeId }) {
    super({ contents: `recipe ${recipeId}` });
    this.fetchRecipe({ foodApi, recipeId });
  }

  async fetchRecipe({ foodApi, recipeId }) {
    const recipe = await foodApi.getRecipe({ id: recipeId, withIngredients: true });
    this.setContents(
      ...[
        "title",
        "prepTimeMins",
        "cookTimeMins",
        "inactiveTimeMins",
        "totalTimeMins",
        "yieldAmount",
        "ingredients",
        "notes",
        "nutrition",
        "originalSource",
      ].map((key) => new Div({ contents: `${key}: ${recipe[key]}` })),
      new Div({
        contents: recipe.directions
          .split("\n")
          .map((dir) => new Div({ contents: dir, style: { marginBottom: "5px" } })),
      })
    );
  }
}
