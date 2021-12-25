/**
 * Intended for small number of elements.
 *
 * This has a O(n) run time, but should be faster than a O(log n) heap implementation due to constant values for small
 * values of n.
 * @param queue will be mutated
 * @param element
 * @param maxSize
 */
export function insertDecreasing(queue: number[], element: number, maxSize: number) {
  const n = queue.length;
  let i, j;
  for (i = 0; i < n; i++) {
    if (queue[i] < element) {
      break;
    }
  }

  if (i === n) {
    if (n < maxSize) {
      queue.push(element);
    }
    return;
  }

  if (n < maxSize) queue.push(queue[n - 1]);
  // Shift the elements after i to the right
  for (j = n - 1; j > i; j--) queue[j] = queue[j - 1];
  // "Insert" it here
  queue[i] = element;
  return queue;
}
