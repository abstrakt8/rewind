import { PathType } from "./PathType";
import { Position } from "osu-math";

export type PathControlPoint = {
  // The type of path segment starting at this control point.
  // If null, this control point will take the type of the previous part segment.
  type?: PathType;
  offset: Position;
};
