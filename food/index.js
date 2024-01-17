import NotFound from "../elements/notFound.js";
import Login from "../elements/login.js";
import Router from "../router/index.js";

import RecipeView from "./components/recipeView.js";
import runTests from "./tests/index.js";
import buildApi from "../api/index.js";
import RecipesPage from "./pages/recipesPage.js";

const sessionCookieName = "foodSession";

const foodApi = buildApi({
  gAppDeploymentId: "AKfycbyPkou8FQ1NT6n7Huu5c8oxRvoPb4tGlufgQw_6Z8ha9u-AmFU2e774Kn6VI3WrrBfU1Q",
  dev: true,
  sessionCookieName,
});

const router = new Router({
  prefix: "/food",
  notFoundComponent: NotFound,
  requireAuth: true,
  sessionCookieName,
  loginComponent: Login.with({ login: foodApi.login }),
});

router.addRoute("/", RecipesPage.with({ foodApi }));
router.addRoute("/{recipeId}", RecipeView);
router.addRoute("/test", () => {
  runTests();
  return null;
});

router.attach();
