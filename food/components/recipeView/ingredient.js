import { PanelItem } from "./panel.js";

export const getIngredientDisplay = ({
  primaryQuantity,
  secondaryQuantities,
  name,
  qualifiers,
  optional,
}) => {
  const secondaryQuantitiesDisplay = secondaryQuantities ? ` (${secondaryQuantities})` : "";
  const qualifiersDisplay = qualifiers ? `, ${qualifiers}` : "";
  const optionalDisplay = optional ? " (optional)" : "";
  return `${primaryQuantity}${secondaryQuantitiesDisplay} ${name}${qualifiersDisplay}${optionalDisplay}`;
};

export default class Ingredient extends PanelItem {
  constructor(ingredient) {
    super({
      contents: getIngredientDisplay(ingredient),
    });
  }
}
