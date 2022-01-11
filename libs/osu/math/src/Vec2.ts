import { float32, float32_div, float32_mul } from "./float32";


// The general type for {x, y} coordinates.
export type Position = { x: number; y: number };

// TODO: Using 32-bit float as return result everywhere?
// For example Vector2.Length is returned as float
export class Vec2 {
  x: number;
  y: number;

  static Zero = new Vec2(0, 0);

  constructor(x: number, y: number) {
    this.x = float32(x);
    this.y = float32(y);
  }

  // This should be preferred since it avoids using sqrt
  // TODO: however this might be TOO precise that we will have matching issue with osu!lazer
  static withinDistance(a: Position, b: Position, d: number): boolean {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 <= d ** 2;
  }

  // returns float
  static distance(a: Position, b: Position): number {
    return Math.fround(Math.sqrt(Vec2.distanceSquared(a, b)));
  }

  static distanceSquared(a: Position, b: Position): number {
    const dx = a.x - b.x,
      dy = a.y - b.y;
    return dx ** 2 + dy ** 2;
  }

  static equal(a: Position, b: Position): boolean {
    // I commented out my original solution and replaced it with osu!framework variant (which is very strict)
    // return floatEqual(a.x, b.x) && floatEqual(a.y, b.y);
    return a.x === b.x && a.y === b.y;
  }

  static add(a: Position, b: Position): Vec2 {
    return new Vec2(float32(a.x) + float32(b.x), float32(a.y) + float32(b.y));
  }

  static dot(a: Position, b: Position): number {
    return Math.fround(a.x * b.x + a.y * b.y);
  }

  static sub(a: Position, b: Position): Vec2 {
    return new Vec2(float32(a.x) - float32(b.x), float32(a.y) - float32(b.y));
  }

  // c: float
  static scale(a: Position, c: number): Vec2 {
    return new Vec2(float32_mul(a.x, c), float32_mul(a.y, c));
  }

  // c: float
  static divide(a: Position, c: number): Vec2 {
    return new Vec2(float32_div(a.x, c), float32_div(a.y, c));
  }

  // Order is important
  static interpolate(a: Position, b: Position, p: number): Vec2 {
    return Vec2.add(a, Vec2.sub(b, a).scale(p));
  }

  add(b: Position): Vec2 {
    return Vec2.add(this, b);
  }

  sub(b: Position): Vec2 {
    return Vec2.sub(this, b);
  }

  divide(c: number): Vec2 {
    return Vec2.divide(this, c);
  }

  scale(c: number): Vec2 {
    return Vec2.scale(this, c);
  }

  lengthSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  length(): number {
    return float32(Math.sqrt(this.x ** 2 + this.y ** 2));
  }

  equals(b: Position): boolean {
    return Vec2.equal(this, b);
  }

  normalized(): Vec2 {
    const num = this.length();
    this.x = float32_div(this.x, num);
    this.y = float32_div(this.y, num);
    return this;
  }
}
