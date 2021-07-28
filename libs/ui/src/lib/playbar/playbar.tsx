import "./playbar.module.css";
import { useCallback, useRef } from "react";
import useMouse from "@react-hook/mouse-position";

/* eslint-disable-next-line */
export interface PlaybarProps {
  onClick?: (x: number) => unknown;
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

function EventLine(props: { d: Dimensions }) {
  const { d } = props;
  return <div className={"absolute bg-red-600 rounded z-10"} style={cssDimensions(d)} />;
}

const widthStyle = (w: number) => ({ width: percentage(w) });

export function Playbar(props: PlaybarProps) {
  const { onClick } = props;
  const loadedPercent = 0.31432345;
  const radius = 0.001;
  const heights = 0.727;
  const ref = useRef(null);
  const mouse = useMouse(ref, {
    enterDelay: 100,
    leaveDelay: 100,
  });

  useCallback(() => {
    console.log(`mouse at ${mouse.x} ${mouse.y}`);
  }, [mouse.x, mouse.y]);

  const mousePercentage = Math.max(0, (mouse.x ?? 0) / (mouse.elementWidth ?? 1));

  const handleClick = useCallback(() => {
    if (onClick) onClick(mousePercentage);
    console.log(`mouse at ${mousePercentage} `);
  }, [onClick, mousePercentage]);

  let primaryP, secondaryP;
  if (mousePercentage > loadedPercent) {
    secondaryP = mousePercentage;
    primaryP = loadedPercent;
  } else {
    secondaryP = loadedPercent;
    primaryP = mousePercentage;
  }
  return (
    <div className="h-8 bg-gray-300 relative cursor-pointer rounded-lg overflow-hidden" ref={ref} onClick={handleClick}>
      {/*loaded*/}
      <div className={"absolute h-full bg-gray-400"} style={{ ...widthStyle(secondaryP) }} />
      <div className={"absolute h-full bg-gray-500"} style={{ ...widthStyle(primaryP) }} />
      {/*<LineBar x={loadedPercent} />*/}
      <EventLine d={{ width: 0.001, height: heights, x: 0.3, y: 0.5 }} />
      <EventLine d={{ width: 0.001, height: heights, x: 0.5, y: 0.5 }} />
      <EventLine d={{ width: 0.001, height: heights, x: 0.8, y: 0.5 }} />
    </div>
  );
}

export default Playbar;
