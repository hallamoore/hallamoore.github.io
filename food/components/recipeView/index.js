import { Button, Div, Element } from "../../../elements/index.js";
import RecipeModalForm from "../recipeModalForm.js";

import Ingredient from "./ingredient.js";
import Timings from "./timings.js";
import Panel, { PanelItem } from "./panel.js";

const splitAndMapToPanelItem = (input) =>
  input.split("\n").map((item) => new PanelItem({ contents: item }));

const Title = ({ title }) =>
  new Element({
    tagName: "h1",
    contents: title,
    style: { margin: "10px", textAlign: "center" },
  });

const YieldAmount = ({ yieldAmount }) =>
  new Panel({ title: "Yield", contents: new PanelItem({ contents: yieldAmount }) });

const Ingredients = ({ ingredients }) =>
  new Panel({
    title: "Ingredients",
    contents: ingredients.map((ingredient) => new Ingredient(ingredient)),
  });

const Directions = ({ directions }) =>
  new Panel({
    title: "Directions",
    contents: splitAndMapToPanelItem(directions),
  });

const Notes = ({ notes }) =>
  new Panel({
    title: "Notes",
    contents: splitAndMapToPanelItem(notes),
  });

const Nutrition = ({ nutrition }) =>
  nutrition &&
  new Panel({
    title: "Nutrition",
    contents: splitAndMapToPanelItem(nutrition),
  });

const Source = ({ originalSource }) =>
  originalSource &&
  new Panel({
    title: "Source",
    contents: [
      "Recipe may have been personally modified, but started from:",
      new Element({ tagName: "br" }),
      new Element({
        tagName: "a",
        contents: originalSource,
        href: originalSource,
      }),
    ],
  });

export default class RecipeView extends Div {
  constructor({ foodApi, recipeId }) {
    super({ contents: `Loading recipe ${recipeId}...` });

    this.recipeModalForm = new RecipeModalForm({
      title: "Edit Recipe",
      submitButtonText: "Save",
      onSubmit: (values) => foodApi.editRecipe({ id: recipeId, ...values }),
    });

    this.fetchRecipe({ foodApi, recipeId });
  }

  async fetchRecipe({ foodApi, recipeId }) {
    const recipe = await foodApi.getRecipe({ id: recipeId, withIngredients: true });
    this.recipeModalForm.setValues(recipe);

    this.setContents(
      Title(recipe),
      this.recipeModalForm,
      new Button({
        contents: "Edit",
        onClick: () => {
          this.recipeModalForm.open();
        },
      }),
      new Timings(recipe),
      YieldAmount(recipe),
      Ingredients(recipe),
      Directions(recipe),
      Notes(recipe),
      Nutrition(recipe),
      Source(recipe)
    );
  }
}
