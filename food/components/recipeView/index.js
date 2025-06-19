import { Div, Element } from "../../../elements/index.js";
import Ingredient from "./ingredient.js";
import Timings from "./timings.js";
import Panel, { PanelItem } from "./panel.js";

const splitAndMapToPanelItem = (input) =>
  input.split("\n").map((item) => new PanelItem({ contents: item }));

const Title = ({ title }) =>
  new Element({
    tagName: "h1",
    contents: title,
    attrs: { style: { margin: "10px", textAlign: "center" } },
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
        attrs: { href: originalSource },
      }),
    ],
  });

export default class RecipeView extends Div {
  constructor({ foodApi, recipeId }) {
    super({ contents: `recipe ${recipeId}` });
    this.fetchRecipe({ foodApi, recipeId });
  }

  async fetchRecipe({ foodApi, recipeId }) {
    const recipe = await foodApi.getRecipe({ id: recipeId, withIngredients: true });

    this.setContents(
      Title(recipe),
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
