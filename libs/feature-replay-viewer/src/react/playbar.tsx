import "tailwindcss/tailwind.css";
import "./playbar.module.css";
import { useCallback, useRef } from "react";
import useMouse from "@react-hook/mouse-position";

/* eslint-disable-next-line */

export interface PlaybarEvent {
  color: string;
  position: number; // number between 0 and 1
}

export interface PlaybarProps {
  loadedPercentage: number;
  onClick?: (x: number) => unknown;
  events: PlaybarEvent[];
}

const percentage = (w: number) => w * 100 + "%";

type Dimensions = {
  width: number;
  height: number;
  x: number;
  y: number;
};

// Centered
function cssDimensions(s: Dimensions) {
  const { width, y, x, height } = s;
  return {
    width: percentage(width),
    height: percentage(height),
    top: percentage(y),
    left: percentage(x),
    // transform: `translate(${percentage(-width / 2)}, ${percentage(-height / 2)})`,
    transform: `translate(-50%,-50%)`,
  };
}

function LineBar(props: { x: number }) {
  const { x } = props;
  return <div className={"absolute bg-gray-700"} style={cssDimensions({ width: 0.001, height: 1, x: x, y: 0.5 })} />;
}

const eventLineWidth = 0.001;
// const eventLineWidth = 0.1;
const widthStyle = (w: number) => ({ width: percentage(w) });

function EventLine(props: PlaybarEvent) {
  const { color, position } = props;
  return (
    <div
      className={"absolute h-full z-10 w-full "}
      style={{
        width: percentage(eventLineWidth),
        left: percentage(position),
        backgroundColor: color,
        transform: `translate(-50%)`,
      }}
    />
  );
}

function Shade(props: { width: number; color: number }) {
  const { width, color } = props;
  const c = "bg-gray-" + color * 100;
  return (
    <div
      className={"absolute h-full transition-transform  ease-out w-full origin-left " + c}
      style={{ transform: `scaleX(${width})`, left: 0 }}
    />
  );
}

export function Playbar(props: PlaybarProps) {
  const { onClick, loadedPercentage, events } = props;
  const radius = 0.001;
  const heights = 0.727;
  const ref = useRef(null);
  const mouse = useMouse(ref, {});
  useCallback(() => {
    console.log(`mouse at ${mouse.x} ${mouse.y}`);
  }, [mouse.x, mouse.y]);

  const mousePercentage = mouse.x !== null ? Math.max(0, (mouse.x ?? 0) / (mouse.elementWidth ?? 1)) : null;

  const handleClick = useCallback(() => {
    if (onClick) onClick(mousePercentage ?? 0); // Should not happen to be null
    console.log(`mouse at ${mousePercentage} `);
  }, [onClick, mousePercentage]);

  let darkP, lightP;
  if (mousePercentage === null) {
    darkP = loadedPercentage;
    lightP = loadedPercentage;
  } else if (mousePercentage < loadedPercentage) {
    darkP = mousePercentage;
    lightP = loadedPercentage;
  } else {
    lightP = mousePercentage;
    darkP = loadedPercentage;
  }
  return (
    <div
      className="h-full bg-gray-300 relative cursor-pointer rounded-lg overflow-hidden"
      ref={ref}
      onClick={handleClick}
    >
      {/*loaded*/}
      {/*<div className={"absolute h-full bg-gray-500"} style={{ ...widthStyle(primaryP) }} />*/}
      <Shade width={lightP} color={4} />
      <Shade width={darkP} color={5} />
      {/*<LineBar x={loadedPercent} />*/}
      {events.map((e, id) => (
        <EventLine color={e.color} position={e.position} key={id} />
      ))}
      {/*<EventLine d={{ width: 0.001, height: heights, x: 0.3, y: 0.5 }} />*/}
      {/*<EventLine d={{ width: 0.001, height: heights, x: 0.5, y: 0.5 }} />*/}
      {/*<EventLine d={{ width: 0.001, height: heights, x: 0.8, y: 0.5 }} />*/}
    </div>
  );
}

export default Playbar;
