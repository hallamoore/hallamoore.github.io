import { Button, Div, Input } from "../../elements/index.js";

export default class RecipeSearch extends Div {
  constructor({ onResultsRetrieved }) {
    const recipeSearchInput = new Input({
      ariaLabel: "Search",
    });

    const recipeSearchButton = new Button({
      contents: "Search",
      onClick: () => {
        const searchQuery = recipeSearchInput.value;
        window.router.pushQueryParam("q", searchQuery);
        this.search(searchQuery);
      },
    });

    super({ contents: [recipeSearchInput, recipeSearchButton] });

    this.onResultsRetrieved = onResultsRetrieved;

    const searchQuery = window.router.getQueryParam("q");
    if (searchQuery) {
      recipeSearchInput.value = searchQuery;
      this.search(searchQuery);
    }
  }

  search(searchQuery) {
    // TODO: send actual search request
    const recipes = [
      { id: 1, title: `some ${searchQuery} recipe` },
      { id: 2, title: `another ${searchQuery} recipe` },
    ];
    this.onResultsRetrieved(recipes);
  }
}
