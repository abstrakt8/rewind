import { PathControlPoint } from "./PathControlPoint";
import { PathType } from "./PathType";
import { clamp, doubleEqual, Position, Vec2 } from "@osujs/math";
import { PathApproximator } from "./PathApproximator";

function mapToVector2(p: Position[]) {
  return p.map((p) => new Vec2(p.x, p.y));
}

export class SliderPath {
  controlPoints: PathControlPoint[];

  // Cached helper data that should only be calculated when there is change in the control points.
  private _invalid: boolean;
  private _cumulativeLength: number[];
  private _calculatedPath: Position[];
  private _min: Position = { x: 0, y: 0 };
  private _max: Position = { x: 0, y: 0 };
  private readonly _expectedDistance?: number;

  constructor(controlPoints: PathControlPoint[], length?: number) {
    this.controlPoints = controlPoints;
    this._invalid = true;
    this._cumulativeLength = [];
    this._calculatedPath = [];
    this._expectedDistance = length;
  }

  get cumulativeLengths(): number[] {
    this.ensureValid();
    return this._cumulativeLength;
  }

  get calculatedPath(): Position[] {
    this.ensureValid();
    return this._calculatedPath;
  }

  makeInvalid(): void {
    this._invalid = true;
  }

  // Recalculates the helper data if needed
  ensureValid(): void {
    if (this._invalid) {
      this.calculatePath();
      this.calculateLength();
      this.calculateBoundaryBox();
      this._invalid = false;
    }
  }

  calculateSubPath(subControlPoints: Position[], type: PathType): Position[] {
    switch (type) {
      case PathType.Catmull:
        return PathApproximator.approximateCatmull(mapToVector2(subControlPoints));
      case PathType.Linear:
        return PathApproximator.approximateLinear(mapToVector2(subControlPoints));
      case PathType.PerfectCurve:
        if (subControlPoints.length !== 3) break;

        // eslint-disable-next-line no-case-declarations
        const subpath = PathApproximator.approximateCircularArc(mapToVector2(subControlPoints));
        // If for some reason a circular arc could not be fit to the 3 given points, fall back to a numerically stable
        // bezier approximation.
        if (subpath.length === 0) break;
        return subpath;
    }
    return PathApproximator.approximateBezier(mapToVector2(subControlPoints));
  }

  get boundaryBox(): [Position, Position] {
    this.ensureValid();
    return [this._min, this._max];
  }

  calculateBoundaryBox(): [Position, Position] {
    // Since it is osu!px , it should be no problem
    let minX = 3000,
      maxX = -3000,
      minY = 3000,
      maxY = -3000;
    this._calculatedPath.forEach((p) => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    });
    this._min = new Vec2(minX, minY);
    this._max = new Vec2(maxX, maxY);
    return [this._min, this._max];
  }

  calculatePath(): void {
    this._calculatedPath = [];
    const numberOfPoints = this.controlPoints.length;
    if (numberOfPoints === 0) return;

    const vertices = this.controlPoints.map((p) => p.offset);
    let start = 0;
    for (let i = 0; i < numberOfPoints; i++) {
      // Need to calculate previous segment
      if (this.controlPoints[i].type === undefined && i < numberOfPoints - 1) {
        continue;
      }

      // Current vertex ends the segment
      const segmentVertices = vertices.slice(start, i + 1);
      const segmentType = this.controlPoints[start].type ?? PathType.Linear;
      for (const t of this.calculateSubPath(segmentVertices, segmentType)) {
        const n = this._calculatedPath.length;
        if (n === 0 || !Vec2.equal(this._calculatedPath[n - 1], t)) {
          this._calculatedPath.push(t);
        }
      }
      start = i;
    }
  }

  calculateLength(): void {
    this._cumulativeLength = new Array<number>(this._calculatedPath.length);
    this._cumulativeLength[0] = 0.0;
    for (let i = 1; i < this._calculatedPath.length; i++) {
      this._cumulativeLength[i] =
        this._cumulativeLength[i - 1] + Math.fround(Vec2.distance(this._calculatedPath[i - 1], this._calculatedPath[i]));
    }
    const calculatedLength = this._cumulativeLength[this._cumulativeLength.length - 1];

    // TODO: In lazer the != operator is used, but shouldn't the approximate equal be used?
    if (this._expectedDistance !== undefined && calculatedLength !== this._expectedDistance) {
      // In osu-stable, if the last two control points of a slider are equal, extension is not performed.
      if (this.controlPoints.length >= 2 && Vec2.equal(this.controlPoints[this.controlPoints.length - 1].offset, this.controlPoints[this.controlPoints.length - 2].offset)
        && this._expectedDistance > calculatedLength) {
        this._cumulativeLength.push(calculatedLength);
        return;
      }
      // The last length is always incorrect
      this._cumulativeLength.splice(this._cumulativeLength.length - 1);

      let pathEndIndex = this._calculatedPath.length - 1;
      if (calculatedLength > this._expectedDistance) {
        while (
          this._cumulativeLength.length > 0 &&
          this._cumulativeLength[this._cumulativeLength.length - 1] >= this._expectedDistance
          ) {
          this._cumulativeLength.splice(this._cumulativeLength.length - 1);
          this._calculatedPath.splice(pathEndIndex--, 1);
        }
      }
      if (pathEndIndex <= 0) {
        // TODO: Perhaps negative path lengths should be disallowed together
        this._cumulativeLength.push(0);
        return;
      }
      // the direction of the segment to shorten or lengthen
      const dir = Vec2.sub(this._calculatedPath[pathEndIndex], this._calculatedPath[pathEndIndex - 1]).normalized();

      const f = this._expectedDistance - this._cumulativeLength[this._cumulativeLength.length - 1];
      this._calculatedPath[pathEndIndex] = Vec2.add(this._calculatedPath[pathEndIndex - 1], dir.scale(Math.fround(f)));
      this._cumulativeLength.push(this._expectedDistance);
    }
  }

  get distance(): number {
    const cumulativeLengths = this.cumulativeLengths;
    const count = cumulativeLengths.length;
    return count > 0 ? cumulativeLengths[count - 1] : 0.0;
  }

  private indexOfDistance(distance: number): number {
    // TODO: Binary search the first value that is not less than partialDistance
    const idx = this.cumulativeLengths.findIndex((value) => value >= distance);
    if (idx === undefined) {
      // Should not be possible
      throw new Error("Cumulative lengths or distance wrongly programmed");
    } else {
      return idx;
    }
  }

  /**
   * Calculates the position of the slider at the given progress.
   * @param progress a number between 0 (head) and 1 (tail/repeat)
   */
  positionAt(progress: number): Position {
    const partialDistance = this.distance * clamp(progress, 0, 1);
    return this.interpolateVertices(this.indexOfDistance(partialDistance), partialDistance);
  }

  // d: double
  private interpolateVertices(i: number, d: number): Position {
    const calculatedPath = this.calculatedPath;
    if (calculatedPath.length === 0) return Vec2.Zero;
    if (i <= 0) return calculatedPath[0];
    if (i >= calculatedPath.length) return calculatedPath[calculatedPath.length - 1];
    const p1 = calculatedPath[i - 1];
    const p2 = calculatedPath[i];
    const d1 = this.cumulativeLengths[i - 1];
    const d2 = this.cumulativeLengths[i];
    if (doubleEqual(d1, d2)) {
      return p1;
    }
    // Number between 0 and 1
    const z = (d - d1) / (d2 - d1);
    return Vec2.interpolate(p1, p2, z);
  }
}
