export function splitByFirstOccurrence(str: string, delimiter: string) {
  const [first, ...rest] = str.split(delimiter);
  if (rest.length === 0) return [first];
  return [first, rest.join(delimiter)];
}
