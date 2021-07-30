// Numbers taken from https://tickstodatetime.azurewebsites.net/
const epochTicks = BigInt(621355968000000000);
const ticksPerMillisecond = BigInt(10000);
const maxDateMilliseconds = BigInt(8640000000000000); // via
// http://ecma-international.org/ecma-262/5.1/#sec-15.9.1.1

// The last number is a number less than 10000
type WindowsDate = [Date, number];

export const ticksToDate = (ticks: bigint): WindowsDate => {
  // convert the ticks into something javascript understands
  const ticksSinceEpoch = ticks - epochTicks;
  const millisecondsSinceEpoch = ticksSinceEpoch / ticksPerMillisecond;
  const subMs = Number(ticksSinceEpoch % ticksPerMillisecond);

  if (millisecondsSinceEpoch > maxDateMilliseconds) {
    throw Error(`Given ticks=${ticks} would be too large`);
  }
  return [new Date(Number(millisecondsSinceEpoch)), subMs];
};

export const dateToTicks = (wDate: WindowsDate): bigint => {
  // convert the ticks into something javascript understands
  const [date, subMs] = wDate;
  const ms = BigInt(date.getTime()) * ticksPerMillisecond;
  return ms + epochTicks + BigInt(subMs);
};
