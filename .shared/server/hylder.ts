const HYLDESHEET_ID = PropertiesService.getScriptProperties().getProperty(
  "HylderSheetId"
);
const HYLDESHEET_NAME = "Hylder";
export function getHyldeDataValues() {
  var sheet = getHyldeSheet();
  var lastRow = sheet.getLastRow();
  return sheet
    .getRange(2, 1, lastRow, 5)
    .getValues()
    .filter(function(row) {
      return row[1] !== "";
    });
}
function getHyldeSheet() {
  return SpreadsheetApp.openById(HYLDESHEET_ID).getSheetByName(HYLDESHEET_NAME);
}
