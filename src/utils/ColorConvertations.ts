export const convertColorToRgba = (color: string, opacity: string) => {
  if (color.startsWith("rgba")) {
    return color.replace(/, [0-9.]+\)$/, `, ${opacity})`);
  }

  // create temporary div
  const temp = document.createElement("div");
  temp.style.color = color;
  document.body.appendChild(temp);

  const rgbaColor = getComputedStyle(temp).color; // get color in rgb(...)
  document.body.removeChild(temp);

  // convert rgb to rgba with opacity
  const finalColor = rgbaColor
    .replace("rgb(", "rgba(")
    .replace(")", `, ${opacity})`);
  return finalColor;
};

export const convertRgbaToHex = (rgb: string) => {
  const result = rgb.match(/\d+/g);
  if (!result) return rgb;

  const [r, g, b] = result.map(Number);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};
