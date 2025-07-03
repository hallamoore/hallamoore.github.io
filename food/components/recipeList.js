import { Element } from "../../elements/index.js";

class RecipeItem extends Element {
  constructor({ id, title }) {
    super({
      tagName: "li",
      contents: title,
      onClick: () => {
        window.history.pushState(window.history.state, "", `/food/${id}`);
      },
    });
  }
}

export default class RecipeList extends Element {
  constructor(recipes) {
    super({
      tagName: "ul",
      ariaLabel: "Recipe Search Results",
      contents: recipes.map((r) => new RecipeItem(r)),
    });
  }

  setRecipes(recipes) {
    this.setContents(...recipes.map((r) => new RecipeItem(r)));
  }
}
