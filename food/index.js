import NotFound from "../elements/notFound.js";
import Login from "../elements/login.js";
import Router from "../router/index.js";

import RecipeView from "./components/recipeView.js";
import runTests from "./tests/index.js";
import buildApi from "../api/index.js";
import RecipesPage from "./pages/recipesPage.js";

const sessionCookieName = "foodSession";

const foodApi = buildApi({
  gAppDeploymentId: "AKfycbyD5w2aS-1ZWkywcLI30uY5q0-g841y57ZEWQlM6Yrhplj0iDj0vDmCKDyFdQ0V7k7AHQ",
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
