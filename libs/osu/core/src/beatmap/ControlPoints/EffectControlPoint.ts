import { ControlPoint } from "./ControlPoint";

export class EffectControlPoint extends ControlPoint {
  static TYPE = "EffectControlPoint";
  static DEFAULT = new EffectControlPoint();

  kiaiMode = false;
  omitFirstBarLine = true;

  isRedundant(existing: ControlPoint): boolean {
    if (this.omitFirstBarLine || existing.type !== EffectControlPoint.TYPE) return false;
    const e = existing as EffectControlPoint;
    return this.kiaiMode === e.kiaiMode && this.omitFirstBarLine === e.omitFirstBarLine;
  }

  get type(): string {
    return EffectControlPoint.TYPE;
  }
}
