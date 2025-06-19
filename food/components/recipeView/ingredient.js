import { PanelItem } from "./panel.js";

export default class Ingredient extends PanelItem {
  constructor({ primaryQuantity, secondaryQuantities, name, qualifiers, optional }) {
    const secondaryQuantitiesDisplay = secondaryQuantities ? ` (${secondaryQuantities})` : "";
    const qualifiersDisplay = qualifiers ? `, ${qualifiers}` : "";
    const optionalDisplay = optional ? " (optional)" : "";
    super({
      contents: `${primaryQuantity}${secondaryQuantitiesDisplay} ${name}${qualifiersDisplay}${optionalDisplay}`,
    });
  }
}
