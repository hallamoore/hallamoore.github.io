import Theme from "../styler/theme.js";
import Styler from "../styler/index.js";

const theme = new Theme({
  backgroundColor: "white",
  borderColor: "black",
  borderRadius: "5px",
  borderWidth: "1px",
  spacer: "10px",
});

theme.define({
  border: `${theme.borderWidth} solid ${theme.borderColor}`,
});

theme.borderRadius.defineRelativeCalcs({
  large: "+ 5px",
});

theme.spacer.defineRelativeCalcs({
  large: "+ 5px",
});

export default new Styler(theme);
