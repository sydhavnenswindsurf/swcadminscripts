function doGet(e) {
  return HtmlService.createHtmlOutputFromFile("dist/index.html");
}
function getUdmeldelserAdresses(label) {
  return ServerLib.getUdmeldelserAdresses(label);
}
