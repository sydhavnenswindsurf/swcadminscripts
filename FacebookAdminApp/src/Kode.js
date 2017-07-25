function doGet() {
    return buildGui();
}
function buildGui() {
    var html = HtmlService.createTemplateFromFile('main');
    var result = html.evaluate().setSandboxMode(HtmlService.SandboxMode.NATIVE);
    return result;
}
function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename)
        .getContent();
}
