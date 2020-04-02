export function convertToStringsDate(date: Date) {
  return Utilities.formatDate(date, "GMT+2", "yyyy/MM/dd HH:mm:ss");
}
