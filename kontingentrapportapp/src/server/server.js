function doGet(e) {
  return ServerLib.doGet();
}

function createNewRapport(formObject) {
  return ServerLib.createNewRapport(formObject);
}

function getLatestRapports() {
  return ServerLib.getLatestRapports();
}

function udmeld(emails) {
  return ServerLib.udmeld(emails);
}

function searchForLastMailDate(emails) {
  return ServerLib.searchForLastMailDate(emails);
}

function getStats(id) {
  return ServerLib.getStats(id);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
