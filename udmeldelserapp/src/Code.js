var udmeldelserLabelKey= "MAIL_FOLDER_UDMELDELSER";
var medlemmerSheet=PropertiesService.getUserProperties().getProperty("MedlemmerSheetId");
var medlemmerSheetName="Medlemsliste";
var MAIL_COLUMN_ID="4";
var UDMELDELSESDATE_COLUMN_ID="9";
var PROCESSEDLABEL = "Processeret";

function getMailLabelName(){
   //return "Test/SWC Admin/Udmeldelser";//PropertiesService.getScriptProperties().getProperty(udmeldelserLabelKey);
   return PropertiesService.getScriptProperties().getProperty(udmeldelserLabelKey);
}

function doGet() {
  var html= HtmlService.createTemplateFromFile('main');
  var label= getMailLabelName();

  var mailLabelExists= GmailApp.getUserLabelByName(label)!=null;

  html.data = {
    mailLabelExists:mailLabelExists,
    mailLabel:label,
    listOfMails: mailLabelExists?getUdmeldelserAdresses(label):[],
  };
  return html.evaluate()
  .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

function onlyUniqueMails(value, index, self) { 
   return swcadmin_common.getIndexOf(self,function(item){return item.getFrom()=== value.getFrom()}) === index;
}

function getUdmeldelserAdresses(label){
  
  var udmeldelseMails = flatten(GmailApp
  .getUserLabelByName(label)
  .getThreads()
  .map(function(thread){
    return thread.getMessages()
    .filter(notOwnMailAddress);
  }));
  var filteredAndParsed= udmeldelseMails
  .filter(onlyUniqueMails)
  .map(function(message){ return parseMailFromData(message.getFrom());});
  var flattened = flatten(filteredAndParsed);
 
  return flattened;
}

function medlemExists(email){
  var sheet=  SpreadsheetApp.openById(medlemmerSheet).getSheetByName(medlemmerSheetName);
  var lastRow = sheet.getLastRow();
   
  var emails= sheet.getRange(2, MAIL_COLUMN_ID, lastRow, 1).getValues();
  
  var result=  emails.filter(function (row){return row[0].toLowerCase() ===email.toLowerCase()}).length>0;
  return result;
}

function udmeld(email){ 
   var udmeldt= false;
   var notFound= false;
   if(!medlemExists(email)){
      notFound=true;      
    }else{
      medlemmer_common.setUdmeldtStatus(email);
      swcadmin_common.moveMail(email,
               getMailLabelName(),
               getMailLabelName()+"/"+PROCESSEDLABEL);
      udmeldt= true;
    }
  return {
    email: email,
    notFound: notFound,
    udmeldt: udmeldt
  };
}



//DOMAIN SPECIFIC HELPER FUNCTIONS

function notOwnMailAddress(item){
  var from =item.getFrom();
  return from.indexOf("sydhavnenswindsurfdata@gmail.com")==-1 && from.indexOf("sydhavnenswindsurf@gmail.com")==-1;
}
function parseMailFromData(mailFrom){
 var name = "";
        var email = "";
        var matches = mailFrom.match (/\s*"?([^"]*)"?\s+<(.+)>/);
        if (matches)
        {
          name = matches[1];
          email = matches[2];
        }
        else
        {
          email = mailFrom;
        }
  
  return {
    name:name,
    email:email
  };
}



//GENERIC HELPER FUNCTIONS


function flatten(array){
  return [].concat.apply([], array);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}



//Tests

function testUdmeld(){
 
}

