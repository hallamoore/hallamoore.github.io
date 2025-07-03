import { Button, Div, Input } from "../../elements/index.js";

export default class RecipeSearch extends Div {
  constructor({ onResultsRetrieved }) {
    super();

    this.onResultsRetrieved = onResultsRetrieved;

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

    this.setContents(recipeSearchInput, recipeSearchButton);

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
