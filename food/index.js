import { Login, NotFound } from "../elements/index.js";
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

router.renderComponentOnRoute("/", RecipesPage.with({ foodApi }));
router.renderComponentOnRoute("/{recipeId}", RecipeView.with({ foodApi }));
router.onRoute("/logout", () => foodApi.logout());
router.onRoute("/test", runTests);

router.attach();
