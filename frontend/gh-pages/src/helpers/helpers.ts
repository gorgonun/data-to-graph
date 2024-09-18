export function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function kebabCaseToText(text: string) {
  return text.split("-").join(" ");
}

export function kebabToMenuCase(text: string) {
  return text.split("-").map(capitalizeFirstLetter).join(" ");
}
