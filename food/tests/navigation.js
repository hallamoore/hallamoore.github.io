describe("Navigation", () => {
  describe("Search Page -> View Search Result -> Back to Search Page", () => {
    it("Still shows the search results", async ({ ui }) => {
      await ui.loadUrl("/food");

      ui.query({ label: "Search" }).type("my query");

      ui.query({ text: "Search" }).click();

      const searchResults = ui
        .query({ label: "Recipe Search Results" })
        .query({ role: "listitem" })
        .all();

      assert.equal(searchResults.length, 2);
      assert.equal(searchResults[0].innerText, "some my query recipe");
      assert.equal(searchResults[1].innerText, "another my query recipe");

      searchResults[0].click();

      ui.query({ text: "recipe 1" }).ensureExists();

      ui.back();

      await ui.waitUntil(ui.query({ text: "some my query recipe" }).ensureExists);
    });
  });

  describe("Search 1 -> Search 2 -> Back to Search 1", () => {
    it("Can use forward history to get to Search 2 again", async ({ ui }) => {
      await ui.loadUrl("/food");

      ui.query({ label: "Search" }).type("abc");
      ui.query({ text: "Search" }).click();

      await ui.waitUntil(ui.query({ text: "some abc recipe" }).ensureExists);

      ui.query({ label: "Search" }).type("123");
      ui.query({ text: "Search" }).click();

      await ui.waitUntil(ui.query({ text: "some abc123 recipe" }).ensureExists);

      ui.back();
      await ui.waitUntil(ui.query({ text: "some abc recipe" }).ensureExists);

      ui.forward();
      await ui.waitUntil(ui.query({ text: "some abc123 recipe" }).ensureExists);
    });
  });
});
