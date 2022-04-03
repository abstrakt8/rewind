/**
 * Utility function to split the given string `str` into *at most two* parts, but only at the first occurrence of the
 * given delimiter. For example "a:b:c" splitting with delimiter=":" will result into ["a", "b:c"].
 *
 * @param str the string to split
 * @param delimiter the delimiter
 */
export function splitByFirstOccurrence(str: string, delimiter: string) {
  const [first, ...rest] = str.split(delimiter);
  if (rest.length === 0) return [first];
  return [first, rest.join(delimiter)];
}
