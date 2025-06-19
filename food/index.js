import NotFound from "../elements/notFound.js";
import Login from "../elements/login.js";
import Router from "../router/index.js";

import RecipeView from "./components/recipeView/index.js";
import runTests from "./tests/index.js";
import buildApi from "../api/index.js";
import RecipesPage from "./pages/recipesPage.js";

const sessionCookieName = "foodSession";

const foodApi = buildApi({
  gAppDeploymentId: "AKfycbx9H-h3G6a11-aoPjlNTa-alpVmG9SPuGlHeLTARDuQSBDmKkqOpfSg2ZoxVaULtxQdXA",
  sessionCookieName,
  cacheName: "foodApi", // TODO: remove when done developing, or implement way to refresh stale data
});

const router = new Router({
  prefix: "/food",
  notFoundComponent: NotFound,
  requireAuth: true,
  sessionCookieName,
  loginComponent: Login.with({ login: foodApi.login }),
});

router.addRoute("/", RecipesPage.with({ foodApi }));
router.addRoute("/logout", () => foodApi.logout());
router.addRoute("/{recipeId}", RecipeView.with({ foodApi }));
router.addRoute("/test", () => {
  runTests();
  return null;
});

router.attach();
