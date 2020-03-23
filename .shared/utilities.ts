export function getIndexOf<T>(array: T[], comparer: (item: T) => boolean) {
  for (var i = 0; i < array.length; i += 1) {
    if (comparer(array[i])) {
      return i;
    }
  }
  return -1;
}
