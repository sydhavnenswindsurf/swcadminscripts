function doGet(e) {
  return HtmlService.createHtmlOutputFromFile("dist/index.html");
}
function getUdmeldelserAdresses(label) {
  return ServerLib.getUdmeldelserAdresses(label);
}
function udmeld(email) {
  return ServerLib.udmeld(email);
}
