var swcdatagmail = PropertiesService.getScriptProperties().getProperty("swcdatagmail");
var swcgmail = PropertiesService.getScriptProperties().getProperty("swcgmail");
//DOMAIN SPECIFIC HELPER FUNCTIONS
function convertToStringsDate(date){
    return Utilities.formatDate(date, "GMT+2", "yyyy/MM/dd HH:mm:ss")
  
}
  
function onlyUniqueMails(value, index, self) { 
   return getIndexOf(self,function(item){return item.getFrom()=== value.getFrom()}) === index;
}

function notOwnMailAddress(item){
  var from =item.getFrom();
  return from.indexOf(swcdatagmail)==-1 && from.indexOf(swcgmail)==-1;
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
function sendDocument(templateId,userData,toEmail,subject) {
  // Full name and email address values come from the spreadsheet form

   // Get document template, copy it as a new temp doc, and save the Doc’s id
   var copyId   = DriveApp.getFileById(templateId)
                  .makeCopy(subject+ ' mail for '+userData.email)
                  .getId();
  var copyDoc  = DocumentApp.openById(copyId);
  var copyBody = copyDoc.getBody();
// Replace place holder keys,  
  
  for(var key in userData){
       copyBody.replaceText('%'+key+'%', userData[key]);
  }
   var messageBody = copyBody.getText();
   GmailApp.sendEmail(toEmail,subject, messageBody, 
                      {
                       replyTo: "swc@swc.dk"
                     }
                    );
// Delete temp file
  DriveApp.getFileById(copyId).setTrashed(true);
}

function moveMail(mail,fromLabelName,toLabelName){
  
  if(!mail)
      throw "no mail adress has been supplied";
  
  var fromLabel= GmailApp.getUserLabelByName(fromLabelName);
  ensureLabel(toLabelName);
  var toLabel= GmailApp.getUserLabelByName(toLabelName)
  
  var targetThreads = fromLabel
  .getThreads()
  .filter(function(t){ 
      return t.getMessages()
        .filter(function(m){ 
          return m.getFrom().indexOf(mail) > -1
        }).length > 0});
  for(i in targetThreads){
    targetThreads[i].removeLabel(fromLabel);
    targetThreads[i].addLabel(toLabel);
  }
}

function ensureLabel(label){
 
  if(GmailApp.getUserLabelByName(label)==null){
     GmailApp.createLabel(label)
  }
}


//DOMAIN GUI

function includeWaiter() {
  return HtmlService.createHtmlOutputFromFile('waiter')
      .getContent();
}

function includeCommonMethods() {
  return HtmlService.createHtmlOutputFromFile('googleApi')
      .getContent();
}
function includeSwcAdminExternalJsLibs() {
  return HtmlService.createHtmlOutputFromFile('swcAdminExternalJsLibs')
      .getContent();
}

function includeBootstrap() {
  return HtmlService.createHtmlOutputFromFile('bootstrap')
      .getContent();
}
function includeBootstrapCss() {
  return HtmlService.createHtmlOutputFromFile('bootstrap_css')
      .getContent();
}
//GENERIC HELPER FUNCTIONS

function getIndexOf(array, comparer){
    
    for(var i = 0; i < array.length; i += 1) {
      if(comparer(array[i])==true){
         return i;
     }
  }
  return -1;
}

function flatten(array){
  return [].concat.apply([], array);
}


//test methods

function testMoveMail(){
   moveMail("xxx","Test/SWC Admin/Ledig hylde","Test/SWC Admin/Ledig hylde/Processeret");

}