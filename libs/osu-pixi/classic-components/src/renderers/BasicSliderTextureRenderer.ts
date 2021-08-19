import * as PIXI from "pixi.js";
import { MeshMaterial, RenderTexture, Shader } from "pixi.js";
import { Bounds } from "@pixi/display";
import { Position, Vec2 } from "@rewind/osu/math";

// TODO: maybe change to -1 like in osu!lazer
// McOsu uses 0.5
const MESH_CENTER_HEIGHT = -0.1;
const SLIDER_BODY_UNIT_CIRCLE_SUBDIVISIONS = 42;

const vertexShader = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;


// Uniforms inserted by pixi.js
uniform mat3 translationMatrix;
uniform mat3 projectionMatrix;

varying vec2 v_uv;

void main()
{
  v_uv = uv;
  gl_Position = vec4((projectionMatrix * translationMatrix * vec3(position.xy, 0.0)).xy, position.z, 1.0);
}
`;
const fragmentShader = `
precision mediump float;

uniform float bodyColorSaturation;
uniform float bodyAlphaMultiplier;
uniform float borderSizeMultiplier;
uniform vec3 colBorder;
uniform vec3 colBody;

varying vec2 v_uv;

const float defaultTransitionSize = 0.011;
const float defaultBorderSize = 0.11;
const float outerShadowSize = 0.08;

vec4 getInnerBodyColor(in vec4 bodyColor)
{
    float brightnessMultiplier = 0.25;
    bodyColor.r = min(1.0, bodyColor.r * (1.0 + 0.5 * brightnessMultiplier) + brightnessMultiplier);
    bodyColor.g = min(1.0, bodyColor.g * (1.0 + 0.5 * brightnessMultiplier) + brightnessMultiplier);
    bodyColor.b = min(1.0, bodyColor.b * (1.0 + 0.5 * brightnessMultiplier) + brightnessMultiplier);
    return vec4(bodyColor);
}

vec4 getOuterBodyColor(in vec4 bodyColor)
{
    float darknessMultiplier = 0.1;
    bodyColor.r = min(1.0, bodyColor.r / (1.0 + darknessMultiplier));
    bodyColor.g = min(1.0, bodyColor.g / (1.0 + darknessMultiplier));
    bodyColor.b = min(1.0, bodyColor.b / (1.0 + darknessMultiplier));
    return vec4(bodyColor);
}

void main()
{
    float borderSize = defaultBorderSize*borderSizeMultiplier;
    const float transitionSize = defaultTransitionSize;

    // output var
    vec4 outColor = vec4(0.0);

    // dynamic color calculations
    vec4 borderColor = vec4(colBorder.x, colBorder.y, colBorder.z, 1.0);
    vec4 bodyColor = vec4(colBody.x, colBody.y, colBody.z, 0.7*bodyAlphaMultiplier);
    vec4 outerShadowColor = vec4(0, 0, 0, 0.25);
    vec4 innerBodyColor = getInnerBodyColor(bodyColor);
    vec4 outerBodyColor = getOuterBodyColor(bodyColor);

    innerBodyColor.rgb *= bodyColorSaturation;
    outerBodyColor.rgb *= bodyColorSaturation;

    // a bit of a hack, but better than rough edges
    if (borderSizeMultiplier < 0.01)
    borderColor = outerShadowColor;

    // conditional variant

    if (v_uv.x < outerShadowSize - transitionSize) // just shadow
    {
        float delta = v_uv.x / (outerShadowSize - transitionSize);
        outColor = mix(vec4(0), outerShadowColor, delta);
    }
    if (v_uv.x > outerShadowSize - transitionSize && v_uv.x < outerShadowSize + transitionSize) // shadow + border
    {
        float delta = (v_uv.x - outerShadowSize + transitionSize) / (2.0*transitionSize);
        outColor = mix(outerShadowColor, borderColor, delta);
    }
    if (v_uv.x > outerShadowSize + transitionSize && v_uv.x < outerShadowSize + borderSize - transitionSize) // just border
    {
        outColor = borderColor;
    }
    if (v_uv.x > outerShadowSize + borderSize - transitionSize && v_uv.x < outerShadowSize + borderSize + transitionSize) // border + outer body
    {
        float delta = (v_uv.x - outerShadowSize - borderSize + transitionSize) / (2.0*transitionSize);
        outColor = mix(borderColor, outerBodyColor, delta);
    }
    if (v_uv.x > outerShadowSize + borderSize + transitionSize) // outer body + inner body
    {
        float size = outerShadowSize + borderSize + transitionSize;
        float delta = ((v_uv.x - size) / (1.0-size));
        outColor = mix(outerBodyColor, innerBodyColor, delta);
    }

    gl_FragColor = outColor;
}
`;

// because Math.sin and Math.cos are slow ... probably
function getUnitCircle(numberOfDivisions: number): Position[] {
  const unitCircle = [];
  for (let i = 0; i < numberOfDivisions; i++) {
    const phase = (i * Math.PI * 2) / numberOfDivisions;
    const pointOnCircle = { x: Math.sin(phase), y: Math.cos(phase) };
    unitCircle.push(pointOnCircle);
  }
  return unitCircle;
}

function getUnitCircleScaled(numberOfDivisions: number, radius: number) {
  const unitCircle = getUnitCircle(numberOfDivisions);
  return unitCircle.map((u: Position) => Vec2.scale(u, radius));
}

// Actually ~65536
// But maybe I did some Math wrong...
const MAX_NUMBER_OF_VERTICES = 60000;

function numberOfVertices(numberOfPoints: number) {
  // Cap + Joins
  return numberOfPoints * (SLIDER_BODY_UNIT_CIRCLE_SUBDIVISIONS + 1) + (numberOfPoints - 1) * 6;
}

export function getSliderGeometry(points: Position[], radius: number): PIXI.Geometry {
  const coneNumberOfDivisions = SLIDER_BODY_UNIT_CIRCLE_SUBDIVISIONS;
  const numberOfVerticesEachCapJoin = coneNumberOfDivisions + 1;
  const numberOfVerticesEachSegment = 6;
  const meshCenterHeight = MESH_CENTER_HEIGHT;

  const positionNumComponents = 3;
  const uvNumComponents = 2;

  const numberOfCaps = 2;
  const numberOfJoins = points.length - 2;
  const numberOfSegments = points.length - 1;

  const offsetCaps = 0;
  const offsetJoins = numberOfCaps * numberOfVerticesEachCapJoin;
  const offsetSegments = offsetJoins + numberOfJoins * numberOfVerticesEachCapJoin;
  const total = offsetSegments + 6 * numberOfSegments;

  // We use TypedArrays because we can then change them (see threejsfundamentals.org on BufferedGeometry)
  // x,y,z
  const attrVertices = new Float32Array(positionNumComponents * total);
  // u,v
  const attrTextureCoords = new Float32Array(uvNumComponents * total);

  // for (let i = 0; i < total; i++) { attrVertices.set([0, 0, 0], i * 3); attrTextureCoords.set([0, 0], i * 2); }

  const getCapsOffset = (i: number) => offsetCaps + i * numberOfVerticesEachCapJoin;
  const getOffsetJoins = (i: number) => offsetJoins + i * numberOfVerticesEachCapJoin;
  const getOffsetSegments = (i: number) => offsetSegments + i * 6;

  const indices: number[] = [];

  const unitCircleScaled = getUnitCircleScaled(coneNumberOfDivisions, radius);

  function addLineCap(position: Position, offset: number) {
    // Tip of the cone
    attrVertices.set([position.x, position.y, meshCenterHeight], offset * positionNumComponents);
    attrTextureCoords.set([1, 0], offset * uvNumComponents);
    // Other points at the bottom
    for (let i = 0; i < coneNumberOfDivisions; i++) {
      const p = Vec2.add(position, unitCircleScaled[i]);
      // console.log(p, unitCircleScaled[i]);
      attrVertices.set([p.x, p.y, 0], (offset + 1 + i) * positionNumComponents);
      attrTextureCoords.set([0, 0], (offset + 1 + i) * uvNumComponents);
    }
    // Now add indices to draw this mesh. It's always a triangle from the top of the cone to a small segment along
    // the circle. This also handles the wrapping case (actually just the last one).
    for (let i = 0; i < coneNumberOfDivisions; i++) {
      // indices.push(offset, offset + 1 + i, offset + 1 + (i + 1) % coneNumberOfDivisions);
      indices.push(offset, offset + 1 + ((i + 1) % coneNumberOfDivisions), offset + 1 + i);
    }
  }

  const nPoints = points.length;

  // Beginning Cap
  addLineCap(points[0], getCapsOffset(0));
  // End Cap
  addLineCap(points[nPoints - 1], getCapsOffset(1));
  // Draw the joints
  for (let i = 1; i < nPoints - 1; i++) {
    addLineCap(points[i], getOffsetJoins(i - 1));
  }

  // Draw the segments (card pyramid bottom)
  // type is triangles, build a rectangle out of 6 vertices
  //
  // 1   3   5
  // *---*---*
  // |  /|  /|
  // | / | / |     // the line 3-4 is the center of the slider (with a raised z-coordinate for blending)
  // |/  |/  |
  // *---*---*
  // 2   4   6
  //
  // Imagine 1 2 3 4 as the one card and 3 4 5 6 as the other card in a mini card pyramid.
  // The slider goes from 4 (start) to 3 (end)

  const quadsIndices = [1, 2, 3, 3, 2, 4, 3, 4, 5, 5, 4, 6];

  function addQuads(lineStartPoint: Position, lineEndPoint: Position, offset: number) {
    const lineDirectionNormalized = Vec2.sub(lineEndPoint, lineStartPoint).normalized();
    const lineOrthogonalDirection = new Vec2(-lineDirectionNormalized.y, lineDirectionNormalized.x);
    const orthoScaled = lineOrthogonalDirection.scale(radius);

    // In McOsu we have .add and .sub swapped and it didn't get rendered due to culling.

    // Point 1 (=screenLineLeftEndPoint)
    const p1 = Vec2.add(lineEndPoint, orthoScaled);
    attrVertices.set([p1.x, p1.y, 0], (offset + 0) * positionNumComponents);
    attrTextureCoords.set([0, 0], (offset + 0) * uvNumComponents);

    // Point 2 (=screenLineLeftStartPoint)
    const p2 = Vec2.add(lineStartPoint, orthoScaled);
    attrVertices.set([p2.x, p2.y, 0], (offset + 1) * positionNumComponents);
    attrTextureCoords.set([0, 0], (offset + 1) * uvNumComponents);

    // Point 3 (=screenLineEndPoint)
    const p3 = lineEndPoint;
    attrVertices.set([p3.x, p3.y, meshCenterHeight], (offset + 2) * positionNumComponents);
    attrTextureCoords.set([1, 0], (offset + 2) * uvNumComponents);

    // Point 4 (=screenLineStartPoint)
    const p4 = lineStartPoint;
    attrVertices.set([p4.x, p4.y, meshCenterHeight], (offset + 3) * positionNumComponents);
    attrTextureCoords.set([1, 0], (offset + 3) * uvNumComponents);

    // Point 5 (=screenLineRightEndPoint)
    const p5 = Vec2.sub(lineEndPoint, orthoScaled);
    attrVertices.set([p5.x, p5.y, 0], (offset + 4) * positionNumComponents);
    attrTextureCoords.set([0, 0], (offset + 4) * uvNumComponents);

    // Point 6 (=screenLineRightStartPoint)
    const p6 = Vec2.sub(lineStartPoint, orthoScaled);
    attrVertices.set([p6.x, p6.y, 0], (offset + 5) * positionNumComponents);
    attrTextureCoords.set([0, 0], (offset + 5) * uvNumComponents);

    const a = quadsIndices.map((x) => offset + (x - 1));
    indices.push(...a);
  }

  for (let i = 1; i < nPoints; i++) {
    addQuads(points[i - 1], points[i], getOffsetSegments(i - 1));
  }

  const geometry = new PIXI.Geometry();

  geometry.addAttribute("position", PIXI.Buffer.from(attrVertices), positionNumComponents);
  geometry.addAttribute("uv", PIXI.Buffer.from(attrTextureCoords), uvNumComponents);
  geometry.addIndex(indices);

  // I don't think changing the attributes of a geometry in PIXI.js is possible.
  // If we need a new geometry, we should generate a new one.

  // Some notes for when I used to render a slider with Three.JS:
  // Important for some optimization (giving a hint to the GPU on how it should organize the data).
  // positionAttribute.setUsage(DynamicDrawUsage);
  // Later we can update the positions and just update:
  // attrVertices.set([3,4,5], 1);
  // positionAttribute.needsUpdate = true;
  // The only thing we are sending again to the GPU is the `positionAttribute`... I THINK

  return geometry;
}

const defaultUniforms = {
  bodyColorSaturation: 1.0,
  bodyAlphaMultiplier: 1.0,
  borderSizeMultiplier: 1.0,
  colBorder: [1, 1, 1],
  colBody: [0, 0, 0],
};

type Color = [number, number, number];
type SliderTextureParams = {
  resolution: number;

  // the points of the slider path (if you use snaking, then give a subset of points with interpolated endings ofc)
  path: Position[];
  // basically determined by CircleSize
  radius: number;

  // Colors should be given between 0 and 256.
  borderColor?: Color;
  bodyColor?: Color;
};

// [0, 255] -> [0, 1] mapping
const rgbNormalized = (color: Color) => color.map((c) => c / 256.0);

export const getBoundsFromSliderPath = (points: Position[], radius: number): Bounds => {
  const bounds = new Bounds();
  points.forEach((p) => bounds.addPoint(p));
  bounds.minX -= radius;
  bounds.minY -= radius;
  bounds.maxX += radius;
  bounds.maxY += radius;
  return bounds;
};

// Does no caching, just returns a Texture as requested.
// Shader is only initialized once, since we can just change the uniforms for changing slider border color.
/**
 * In case of very large sliders such as the one in The Sun The Moon The Star (~10:40) that has over 100k vertices
 * we need to make multiple render calls because the index buffer is a uint16 array (due to compatibility reasons)
 * and we can thus not refer to indices larger than ~65k.
 *
 * https://stackoverflow.com/questions/4998278/is-there-a-limit-of-vertices-in-webgl
 */
export class BasicSliderTextureRenderer {
  shader: PIXI.Shader;
  renderer: PIXI.Renderer;

  constructor(renderer: PIXI.Renderer) {
    this.renderer = renderer;
    this.shader = Shader.from(vertexShader, fragmentShader, defaultUniforms);
  }

  render(params: SliderTextureParams): RenderTexture {
    const { bodyColor, borderColor, resolution, path, radius } = params;

    if (borderColor) this.shader.uniforms.colBorder = rgbNormalized(borderColor);
    if (bodyColor) this.shader.uniforms.colBody = rgbNormalized(bodyColor);

    const bounds = getBoundsFromSliderPath(path, radius);
    const { minX, maxX, minY, maxY } = bounds;

    const width = maxX - minX;
    const height = maxY - minY;

    // TODO: do some pooling here
    const renderTexture = RenderTexture.create({ width, height, resolution });
    renderTexture.framebuffer.enableDepth();

    const boundaryBoxCenter = new Vec2((maxX + minX) / 2, (maxY + minY) / 2);
    // The reason why we shift the points is that a frame buffer of size [w, h] will only render the points with the
    // coordinates in Rectangle{(-w/2,-h/2), (+w/2,+h/2)}. Currently some points may be outside this rectangle,
    // that's why we have to shift them to the center.
    const points = path.map((p) => Vec2.sub(p, boundaryBoxCenter));

    const renderSubPath = (points: Vec2[]) => {
      const geometry = getSliderGeometry(points, radius);
      const sliderMesh = new PIXI.Mesh(geometry, this.shader as MeshMaterial);
      sliderMesh.state.depthTest = true;
      sliderMesh.state.blend = false;
      // Or maybe even use Transform here
      this.renderer.render(sliderMesh, { renderTexture, clear: false });
    };

    // The reason we have to render the whole slider in multiple sub-paths is described above.
    // Usually this will only happen for long sliders (in terms of vertices).
    let subPoints = [];
    for (let i = 0; i < points.length; i++) {
      if (numberOfVertices(subPoints.length + 1) > MAX_NUMBER_OF_VERTICES) {
        renderSubPath(subPoints);
        subPoints = [];
      }
      subPoints.push(points[i]);
    }
    if (subPoints.length > 0) {
      renderSubPath(subPoints);
    }

    // TODO: Do we need to cleanup? disableDepth?

    return renderTexture;
  }
}
