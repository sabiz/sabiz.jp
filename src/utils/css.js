
export const getCssVariable = (name) => {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
