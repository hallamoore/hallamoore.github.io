import { Button, Div } from "../../elements/index.js";
import {
  ParseRecipeModal,
  RecipeList,
  RecipeModalForm,
  RecipeSearch,
} from "../components/index.js";

export default class RecipesPage extends Div {
  constructor({ foodApi }) {
    const recipeList = new RecipeList([]);

    const recipeSearch = new RecipeSearch({
      onResultsRetrieved: (recipes) => recipeList.setRecipes(recipes),
    });

    const recipeModalForm = new RecipeModalForm({
      title: "New Recipe",
      submitButtonText: "Create",
      onSubmit: foodApi.createRecipe,
    });

    const parseRecipeModal = new ParseRecipeModal({
      foodApi,
      onParsed: (values) => {
        recipeModalForm.setValues(values);
        recipeModalForm.open();
      },
    });

    const parseRecipeButton = new Button({
      contents: "New From Url",
      onClick: () => {
        parseRecipeModal.open();
      },
    });

    super({
      contents: [recipeModalForm, parseRecipeModal, parseRecipeButton, recipeSearch, recipeList],
    });

    this.foodApi = foodApi;
    this.recipeList = recipeList;
  }

  _init() {
    super._init();
    this.fetchInitialRecipes(); // don't await
  }

  async fetchInitialRecipes() {
    // TODO: loading indicator
    // TODO: cancel if a search is made before this loads
    this.recipeList.setRecipes(await this.foodApi.getRecipes());
  }
}
