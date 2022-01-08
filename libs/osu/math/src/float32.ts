export function float32(a: number) {
  return Math.fround(a);
}

export function float32_mul(a: number, b: number) {
  return float32(float32(a) * float32(b));
}

export function float32_div(a: number, b: number) {
  return float32(float32(a) / float32(b));
}

export function float32_sqrt(a: number) {
  return float32(Math.sqrt(float32(a)));
}
