import { Vec2 } from "@rewind/osu/math";
import { floatEqual } from "@rewind/osu/math";

// TODO: Move to osu-math
// https://github.com/ppy/osu-framework/blob/f9d44b1414e30ad507894ef7eaaf5d1b0118be82/osu.Framework/Utils/PathApproximator.cs

const bezierTolerance = 0.25;
const circularArcTolerance = 0.1;
// The amount of pieces to calculate for each control point quadruplet.
const catmullDetail = 50;

interface CircularArcProperties {
  thetaStart: number;
  thetaRange: number;
  direction: number;
  radius: number;
  center: Vec2;
}

const toFloat = (x: number) => Math.fround(x);

/**
 * Helper methods to approximate a path by interpolating a sequence of control points.
 */
export class PathApproximator {
  /**
   * Creates a piecewise-linear approximation of a bezier curve, by adaptively repeatedly subdividing
   * the control points until their approximation error vanishes below a given threshold.
   * @returns A list of vectors representing the piecewise-linear approximation.
   */
  static approximateBezier(controlPoints: Vec2[], p = 0): Vec2[] {
    const output: Vec2[] = [];
    const n = controlPoints.length - 1;

    if (n < 0) {
      return output;
    }
    // Both Stacks<>
    const toFlatten: Vec2[][] = [];
    const freeBuffers: Vec2[][] = [];

    // Creates a copy of controlPoints
    const points = [...controlPoints];

    if (p > 0 && p < n) {
      for (let i = 0; i < n - p; i++) {
        const subBezier: Vec2[] = new Array(p + 1);
        subBezier[0] = points[i];
        for (let j = 0; j < p - 1; j++) {
          subBezier[j + 1] = points[i + 1];
          for (let k = 1; k < p - j; k++) {
            const l = Math.min(k, n - p - i);
            points[i + k] = points[i + k]
              .scale(l)
              .add(points[i + k + 1])
              .scale(1 / (l + 1));
          }
        }
        subBezier[p] = points[i + 1];
        toFlatten.push(subBezier);
      }

      // TODO: Is this same as  points[(n-p)..]) as in C# ?
      toFlatten.push(points.slice(n - p, points.length));
      // TODO: Is this as in the osu!lazer code?
      // Reverse the stack so elements can be accessed in order
      toFlatten.reverse();
    } else {
      // B-spline subdivisions unnecessary, degenerate to single bezier
      p = n;
      toFlatten.push(points);
    }
    const subdivisionBuffer1: Vec2[] = new Array(p + 1);
    const subdivisionBuffer2: Vec2[] = new Array(p * 2 + 1);
    const leftChild: Vec2[] = subdivisionBuffer2;

    // let leftChild = subdivisionBuffer2;

    while (toFlatten.length > 0) {
      // Can't be undefined dude
      const parent: Vec2[] = toFlatten.pop() as Vec2[];

      if (PathApproximator._bezierIsFlatEnough(parent)) {
        // If the control points we currently operate on are sufficiently "flat", we use
        // an extension to De Casteljau's algorithm to obtain a piecewise-linear approximation
        // of the bezier curve represented by our control points, consisting of the same amount
        // of points as there are control points.
        PathApproximator._bezierApproximate(parent, output, subdivisionBuffer1, subdivisionBuffer2, p + 1);

        freeBuffers.push(parent);
        continue;
      }

      // If we do not yet have a sufficiently "flat" (in other words, detailed) approximation we keep
      // subdividing the curve we are currently operating on.
      const rightChild: Vec2[] = freeBuffers.pop() ?? new Array(p + 1);

      PathApproximator._bezierSubdivide(parent, leftChild, rightChild, subdivisionBuffer1, p + 1);

      // We re-use the buffer of the parent for one of the children, so that we save one allocation per iteration.
      for (let i = 0; i < p + 1; ++i) {
        parent[i] = leftChild[i];
      }

      toFlatten.push(rightChild);
      toFlatten.push(parent);
    }

    output.push(controlPoints[n]);

    return output;
  }

  /**
   * Creates a piecewise-linear approximation of a Catmull-Rom spline.
   * @returns A list of vectors representing the piecewise-linear approximation.
   */
  static approximateCatmull(controlPoints: Vec2[]): Vec2[] {
    const result = [];
    const controlPointsLength = controlPoints.length;

    for (let i = 0; i < controlPointsLength - 1; i++) {
      const v1 = i > 0 ? controlPoints[i - 1] : controlPoints[i];
      const v2 = controlPoints[i];
      const v3 = i < controlPointsLength - 1 ? controlPoints[i + 1] : v2.add(v2).sub(v1);
      const v4 = i < controlPointsLength - 2 ? controlPoints[i + 2] : v3.add(v3).sub(v2);

      for (let c = 0; c < catmullDetail; c++) {
        result.push(PathApproximator._catmullFindPoint(v1, v2, v3, v4, Math.fround(c / catmullDetail)));
        result.push(PathApproximator._catmullFindPoint(v1, v2, v3, v4, Math.fround((c + 1) / catmullDetail)));
      }
    }

    return result;
  }

  // TODO: Use Math.fround maybe
  static circularArcProperties(controlPoints: Vec2[]): CircularArcProperties | undefined {
    const a = controlPoints[0];
    const b = controlPoints[1];
    const c = controlPoints[2];
    if (floatEqual(0, (b.y - a.y) * (c.x - a.x) - (b.x - a.x) * (c.y - a.y))) return undefined; // = invalid

    const d = toFloat(2 * (a.x * b.sub(c).y + b.x * c.sub(a).y + c.x * a.sub(b).y));
    const aSq = toFloat(a.lengthSquared());
    const bSq = toFloat(b.lengthSquared());
    const cSq = toFloat(c.lengthSquared());

    const center = new Vec2(
      toFloat(aSq * b.sub(c).y + bSq * c.sub(a).y + cSq * a.sub(b).y),
      toFloat(aSq * c.sub(b).x + bSq * a.sub(c).x + cSq * b.sub(a).x),
    ).divide(d);

    const dA = a.sub(center);
    const dC = c.sub(center);

    const r = toFloat(dA.length());
    const thetaStart = Math.atan2(dA.y, dA.x);
    let thetaEnd = Math.atan2(dC.y, dC.x);
    while (thetaEnd < thetaStart) thetaEnd += 2 * Math.PI;

    let dir = 1;
    let thetaRange = thetaEnd - thetaStart;
    let orthoAtoC = c.sub(a);
    orthoAtoC = new Vec2(orthoAtoC.y, -orthoAtoC.x);

    if (Vec2.dot(orthoAtoC, b.sub(a)) < 0) {
      dir = -dir;
      thetaRange = 2 * Math.PI - thetaRange;
    }
    return { thetaStart, thetaRange, direction: dir, radius: r, center };
  }

  /**
   * Creates a piecewise-linear approximation of a circular arc curve.
   * @returns A list of vectors representing the piecewise-linear approximation.
   */
  static approximateCircularArc(controlPoints: Vec2[]): Vec2[] {
    const properties = PathApproximator.circularArcProperties(controlPoints);
    if (!properties) {
      return PathApproximator.approximateBezier(controlPoints);
    }

    const { radius, center, thetaRange, thetaStart, direction } = properties;
    const amountPoints =
      2 * radius <= circularArcTolerance
        ? 2
        : Math.max(2, Math.ceil(thetaRange / (2 * Math.acos(1 - circularArcTolerance / radius))));

    // We select the amount of points for the approximation by requiring the discrete curvature
    // to be smaller than the provided tolerance. The exact angle required to meet the tolerance
    // is: 2 * Math.Acos(1 - TOLERANCE / r)
    // The special case is required for extremely short sliders where the radius is smaller than
    // the tolerance. This is a pathological rather than a realistic case.

    const output = [];

    for (let i = 0; i < amountPoints; ++i) {
      const fract = i / (amountPoints - 1);
      const theta = thetaStart + direction * fract * thetaRange;

      const o = new Vec2(toFloat(Math.cos(theta)), toFloat(Math.sin(theta))).scale(radius);

      output.push(center.add(o));
    }

    return output;
  }

  /**
   * Creates a piecewise-linear approximation of a linear curve.
   * Basically, returns the input.
   * @returns A list of vectors representing the piecewise-linear approximation.
   */
  static approximateLinear(controlPoints: Vec2[]): Vec2[] {
    return [...controlPoints];
  }

  /**
   * Creates a piecewise-linear approximation of a lagrange polynomial.
   * @returns A list of vectors representing the piecewise-linear approximation.
   */
  static approximateLagrangePolynomial(controlPoints: Vec2[]): Vec2[] {
    // TODO: add some smarter logic here, chebyshev nodes?
    const numSteps = 51;

    const result = [];

    const weights = PathApproximator._barycentricWeights(controlPoints);

    let minX = controlPoints[0].x;
    let maxX = controlPoints[0].x;

    for (let i = 1; i < controlPoints.length; i++) {
      minX = Math.min(minX, controlPoints[i].x);
      maxX = Math.max(maxX, controlPoints[i].x);
    }

    const dx = maxX - minX;

    for (let i = 0; i < numSteps; i++) {
      const x = minX + (dx / (numSteps - 1)) * i;
      const y = Math.fround(PathApproximator._barycentricLagrange(controlPoints, weights, x));

      result.push(new Vec2(x, y));
    }

    return result;
  }

  /**
   * Calculates the Barycentric weights for a Lagrange polynomial for a given set of coordinates.
   * Can be used as a helper function to compute a Lagrange polynomial repeatedly.
   * @param points An array of coordinates. No two x should be the same.
   */
  static _barycentricWeights(points: Vec2[]): number[] {
    const n = points.length;
    const w = [];

    for (let i = 0; i < n; i++) {
      w[i] = 1;

      for (let j = 0; j < n; j++) {
        if (i !== j) {
          w[i] *= points[i].x - points[j].x;
        }
      }

      w[i] = 1.0 / w[i];
    }

    return w;
  }

  /**
   * Calculates the Lagrange basis polynomial for a given set of x coordinates based on previously computed barycentric
   * weights.
   * @param points An array of coordinates. No two x should be the same.
   * @param weights An array of precomputed barycentric weights.
   * @param time The x coordinate to calculate the basis polynomial for.
   */
  static _barycentricLagrange(points: Vec2[], weights: number[], time: number) {
    if (points === null || points.length === 0) {
      throw new Error("points must contain at least one point");
    }

    if (points.length !== weights.length) {
      throw new Error("points must contain exactly as many items as {nameof(weights)}");
    }

    let numerator = 0;
    let denominator = 0;

    for (let i = 0, len = points.length; i < len; i++) {
      // while this is not great with branch prediction, it prevents NaN at control point X coordinates
      if (time === points[i].x) {
        return points[i].y;
      }

      const li = weights[i] / (time - points[i].x);

      numerator += li * points[i].y;
      denominator += li;
    }

    return numerator / denominator;
  }

  /**
   * Make sure the 2nd order derivative (approximated using finite elements) is within tolerable bounds.
   * NOTE: The 2nd order derivative of a 2d curve represents its curvature, so intuitively this function
   *       checks (as the name suggests) whether our approximation is _locally_ "flat". More curvy parts
   *       need to have a denser approximation to be more "flat".
   * @param controlPoints The control points to check for flatness.
   * @returns Whether the control points are flat enough.
   */
  static _bezierIsFlatEnough(controlPoints: Vec2[]): boolean {
    for (let i = 1; i < controlPoints.length - 1; i++) {
      const tmp = controlPoints[i - 1].sub(controlPoints[i].scale(2)).add(controlPoints[i + 1]);

      if (tmp.lengthSquared() > bezierTolerance ** 2 * 4) {
        return false;
      }
    }

    return true;
  }

  /**
   * Subdivides n control points representing a bezier curve into 2 sets of n control points, each
   * describing a bezier curve equivalent to a half of the original curve. Effectively this splits
   * the original curve into 2 curves which result in the original curve when pieced back together.
   * @param controlPoints The control points to split.
   * @param l Output: The control points corresponding to the left half of the curve.
   * @param r Output: The control points corresponding to the right half of the curve.
   * @param subdivisionBuffer The first buffer containing the current subdivision state.
   * @param count The number of control points in the original list.
   */
  static _bezierSubdivide(controlPoints: Vec2[], l: Vec2[], r: Vec2[], subdivisionBuffer: Vec2[], count: number): void {
    const midpoints = subdivisionBuffer;

    for (let i = 0; i < count; ++i) {
      midpoints[i] = controlPoints[i];
    }

    for (let i = 0; i < count; ++i) {
      l[i] = midpoints[0];
      r[count - i - 1] = midpoints[count - i - 1];

      for (let j = 0; j < count - i - 1; j++) {
        midpoints[j] = midpoints[j].add(midpoints[j + 1]);
        midpoints[j] = midpoints[j].divide(2);
      }
    }
  }

  /**
   * This uses <a href="https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm De Casteljau's algorithm</a> to obtain
   * an optimal piecewise-linear approximation of the bezier curve with the same amount of points as there are control
   * points.
   * @param controlPoints The control points describing the bezier curve to be approximated.
   * @param output The points representing the resulting piecewise-linear approximation.
   * @param count The number of control points in the original list.
   * @param subdivisionBuffer1 The first buffer containing the current subdivision state.
   * @param subdivisionBuffer2 The second buffer containing the current subdivision state.
   */
  static _bezierApproximate(
    controlPoints: Vec2[],
    output: Vec2[],
    subdivisionBuffer1: Vec2[],
    subdivisionBuffer2: Vec2[],
    count: number,
  ): void {
    const l = subdivisionBuffer2;
    const r = subdivisionBuffer1;

    PathApproximator._bezierSubdivide(controlPoints, l, r, subdivisionBuffer1, count);

    for (let i = 0; i < count - 1; ++i) {
      l[count + i] = r[i + 1];
    }

    output.push(controlPoints[0]);

    for (let i = 1; i < count - 1; ++i) {
      const index = 2 * i;
      let p = l[index - 1].add(l[index].scale(2)).add(l[index + 1]);
      p = p.scale(Math.fround(0.25));

      output.push(p);
    }
  }

  /**
   * Finds a point on the spline at the position of a parameter.
   * @param vec1 The first vector.
   * @param vec2 The second vector.
   * @param vec3 The third vector.
   * @param vec4 The fourth vector.
   * @param t The parameter at which to find the point on the spline, in the range [0, 1].
   * @returns The point on the spline at t.
   */
  static _catmullFindPoint(vec1: Vec2, vec2: Vec2, vec3: Vec2, vec4: Vec2, t: number): Vec2 {
    const t2 = Math.fround(t * t);
    const t3 = Math.fround(t * t2);

    return new Vec2(
      Math.fround(
        0.5 *
          (2 * vec2.x +
            (-vec1.x + vec3.x) * t +
            (2 * vec1.x - 5 * vec2.x + 4 * vec3.x - vec4.x) * t2 +
            (-vec1.x + 3 * vec2.x - 3 * vec3.x + vec4.x) * t3),
      ),
      Math.fround(
        0.5 *
          (2 * vec2.y +
            (-vec1.y + vec3.y) * t +
            (2 * vec1.y - 5 * vec2.y + 4 * vec3.y - vec4.y) * t2 +
            (-vec1.y + 3 * vec2.y - 3 * vec3.y + vec4.y) * t3),
      ),
    );
  }
}
