var MANUEL_REGISTRATION_FOLDER ="SWC Admin/Manuel kontigent registrering";
function doGet() {
  
 
  if(GmailApp.getUserLabelByName(MANUEL_REGISTRATION_FOLDER)==null){
    var html =  HtmlService.createTemplateFromFile('error');
    html.data= MANUEL_REGISTRATION_FOLDER;
    return html.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
  }
     
  var mails = getMails(MANUEL_REGISTRATION_FOLDER);
      
  var html= HtmlService.createTemplateFromFile('main');
    
    html.data = {
    manuelMailLabel:MANUEL_REGISTRATION_FOLDER,
    paidEmails: mails
  };
  return html.evaluate()
  .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}


function getMails(label){
   
   var mails = flatten(GmailApp.getUserLabelByName(label)
                  .getThreads()
                      .map(function(t){
                        return t.getMessages()
                          .filter(notOwnMailAddress)
                      })
                      )
   .filter(onlyUniqueMails)
   .map(function(m){return m.getFrom()});  
   var result= mails.map(parseMailFromData);
   return result;
}




//DOMAIN SPECIFIC HELPER FUNCTIONS

function onlyUniqueMails(value, index, self) { 
   return getIndexOf(self,function(item){return item.getFrom()=== value.getFrom()}) === index;
}

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

function getIndexOf(array, comparer){
    for(var i = 0; i < array.length; i += 1) {
      if(comparer(array[i])==true){
         return i;
     }
  }
}

function flatten(array){
  return [].concat.apply([], array);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}
