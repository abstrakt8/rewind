import addZero from "add-zero";

// courtesy to parse-ms
export function parseMs(milliseconds: number) {
  const roundTowardsZero = milliseconds > 0 ? Math.floor : Math.ceil;

  return {
    days: roundTowardsZero(milliseconds / 86400000),
    hours: roundTowardsZero(milliseconds / 3600000) % 24,
    minutes: roundTowardsZero(milliseconds / 60000) % 60,
    seconds: roundTowardsZero(milliseconds / 1000) % 60,
    milliseconds: roundTowardsZero(milliseconds) % 1000,
    microseconds: roundTowardsZero(milliseconds * 1000) % 1000,
    nanoseconds: roundTowardsZero(milliseconds * 1e6) % 1000,
  };
}
export function formatReplayTime(timeInMs: number, withMs?: boolean) {
  // new Date(timeInMs) actually considers timezone
  const { hours, seconds, minutes, milliseconds } = parseMs(timeInMs);
  let s = hours > 0 ? `${hours}:` : "";
  s = s + (hours > 0 ? addZero(minutes) : minutes) + ":";
  s = s + addZero(seconds);
  return withMs ? s + "." + addZero(milliseconds, 3) : s;
}
