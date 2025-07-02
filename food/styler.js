import Theme from "../styler/theme.js";
import Styler from "../styler/index.js";

const theme = new Theme({
  borderRadius: "5px",
  boxShadow: "-1px 1px 5px gray",
  spacer: "10px",
});

theme.spacer.defineRelativeCalcs({
  large: "+ 5px",
});

export default new Styler(theme);
