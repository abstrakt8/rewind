import { floatEqual } from "./utils";

// The general type for {x, y} coordinates.
export type Position = { x: number; y: number };

export class Vec2 {
  x: number;
  y: number;

  static Zero = new Vec2(0, 0);

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static distance(a: Position, b: Position): number {
    return Math.sqrt(Vec2.distanceSquared(a, b));
  }

  static distanceSquared(a: Position, b: Position): number {
    const dx = a.x - b.x,
      dy = a.y - b.y;
    return dx ** 2 + dy ** 2;
  }

  static equal(a: Position, b: Position): boolean {
    return floatEqual(a.x, b.x) && floatEqual(a.y, b.y);
  }

  static add(a: Position, b: Position): Vec2 {
    return new Vec2(a.x + b.x, a.y + b.y);
  }

  static dot(a: Position, b: Position): number {
    return a.x * b.x + a.y * b.y;
  }

  static sub(a: Position, b: Position): Vec2 {
    return new Vec2(a.x - b.x, a.y - b.y);
  }

  static scale(a: Position, c: number): Vec2 {
    return new Vec2(a.x * c, a.y * c);
  }

  static divide(a: Position, c: number): Vec2 {
    return new Vec2(a.x / c, a.y / c);
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
    return this.x ** 2 + this.y ** 2;
  }

  length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  equals(b: Position): boolean {
    return Vec2.equal(this, b);
  }

  normalized(): Vec2 {
    return this.divide(this.length());
  }
}
