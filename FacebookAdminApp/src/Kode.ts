// @ts-ignore
function doGet(): any{
    return buildGui();
}
function buildGui(): any { 
     var html = HtmlService.createTemplateFromFile('main');
    var result = html.evaluate().setSandboxMode(HtmlService.SandboxMode.NATIVE); 
    return result;

}  

// @ts-ignore
function include(filename: any): any{
      return HtmlService.createHtmlOutputFromFile(filename)
        .getContent(); 
}
