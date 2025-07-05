import Element from "./element.js";

const buildBasicElementClass = (tagName) => {
  const className = tagName[0].toUpperCase() + tagName.slice(1);
  return Element.extend(className, { tagName });
};

export const Button = buildBasicElementClass("button");
export const Div = buildBasicElementClass("div");
export const Form = buildBasicElementClass("form");
export const Input = buildBasicElementClass("input");
export const Label = buildBasicElementClass("label");
export const Textarea = buildBasicElementClass("textarea");
