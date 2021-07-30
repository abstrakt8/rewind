// This correspond to exact 1600 years
// 1601-01-01 00:00:00.000 basically
const magicConstant = BigInt("504911232000000000");
export const legacyReplayFileName = (beatmapMD5Hash: string, scoreTimeStamp: bigint): string => {
  const magicTicks = scoreTimeStamp - magicConstant;
  return `${beatmapMD5Hash}-${magicTicks}.osr`;
};
