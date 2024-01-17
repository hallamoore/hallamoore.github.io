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

    const recipeModalForm = new RecipeModalForm();

    const parseRecipeModal = new ParseRecipeModal({
      foodApi,
      onParsed: (values) => {
        recipeModalForm.setValues(values);
        recipeModalForm.open();
      },
    });

    const parseRecipeButton = new Button({
      contents: "New From Url",
      attrs: {
        onClick: () => {
          parseRecipeModal.open();
        },
      },
    });

    super({
      contents: [recipeModalForm, parseRecipeModal, parseRecipeButton, recipeSearch, recipeList],
    });
  }
}
