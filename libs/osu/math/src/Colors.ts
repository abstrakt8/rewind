export type RGB = [number, number, number];

export const rgbToInt = (rgb: number[]): number => {
  if (rgb.length < 3) throw Error("Not at least three values provided");
  let val = 0;
  for (let i = 0; i < 3; i++) {
    val = val * 256 + rgb[i];
  }
  return val;
};
