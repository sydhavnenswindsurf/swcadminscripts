var COLUMN_STATUS="0";
var COLUMN_FORNAVN="3";
var COLUMN_EFTERNAVN="4";
var COLUMN_EMAIL="5";
var MEMBERID_SEED=99920000;
var DONE_STATUS = ["Afvist","Indmeldt","Færdigbehandlet"];
var SENT_STATUS = "Sendt mail";
var INDMELDT_STATUS = "Indmeldt";
var NEWMEMBERS_SHEETID=PropertiesService.getScriptProperties().getProperty("NewMemberSheetId");
var INVITATIONS_MAILTEMPLATE=PropertiesService.getScriptProperties().getProperty("InvitationsMailSkabelonId");
var CONFIRMATION_MAILTEMPLATE=PropertiesService.getScriptProperties().getProperty("ConfirmationMailTemplateId");
var _swcEmail=PropertiesService.getScriptProperties().getProperty("swcemail");

function doGet(){
  return buildGui();
}


function buildGui(){
  var html = HtmlService.createTemplateFromFile('main');
    
  var result = html.evaluate()
  .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  return result;
}


function getUbehandledeIndmeldelser(){
  var data = _getSheetData()
      .getValues()
      .filter(function(row) {
         var status = row[COLUMN_STATUS];
         return DONE_STATUS.indexOf(status)==-1;
      })
    .map(function(row){
       if(row[COLUMN_STATUS]==""){
         row[COLUMN_STATUS]="Ubehandlet";
       }
      return row;
  });

  
  var returData=data.map(function(row){
    return {
    status:row[COLUMN_STATUS],
    email:row[5],
    fornavn:row[3],
    efternavn:row[4],
    telefon:row[6],
      tidsstempel: row[9] instanceof Date? Utilities.formatDate(row[9], "GMT", "yyyy-MM-dd"):row[9],
      brugerklubudstyr:row[10],
      bemaerkninger:row[11],
      
    }});
  return returData;
}


function indmeld(email){
  var stamdata= medlemmer_common.getMedlemmerStamdata();
  if(medlemmer_common.erMedlem(email, stamdata)){
     throw email + " er allerede registreret som medlem";
  }
   
  var nytmedlem = _overfoerIndmeldelsesData(email);
  
  doSendConfirmationMail(email,nytmedlem[3],nytmedlem[4]);
  
  _setNewStatus(email, INDMELDT_STATUS);
  
  swcadmin_common.moveMail(email, "SWC Admin/Indmeldelser", "SWC Admin/Indmeldelser/Processeret");
  
  return{
    success:true,
    message:"Medlem er indmeldt, og der er sendt bekræftelses mail med information",
    newStatus:INDMELDT_STATUS
  }; 
}



function afvis(email){
  _setNewStatus(email,"Afvist");
  swcadmin_common.moveMail(email, "SWC Admin/Indmeldelser", "SWC Admin/Indmeldelser/Processeret");
  return {
    success: true,
    message: "ok fjernede " + email + " fra indmeldelseslisten",
    newStatus:"Afvist"
  };
}



function visIndmeldelsesSidebar(){

  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .showSidebar(buildGui());
}


/* private methods */
function _getSheetData(){
  var sheet= SpreadsheetApp
  .openById(NEWMEMBERS_SHEETID)
  .getSheetByName("Formularsvar 1");
  var data = sheet
      .getDataRange();
  return data;
}



function sendVelkomstMail(email){
  var data =_getSheetData().getValues().filter(function(item){return item[COLUMN_EMAIL]==email});
  if(data.length<1){
    return buildError("Der kunne ikke findes nogen indmeldelser for e-mailen: "+ email,email);
  }
  try{
    var lastIndex =data.length-1;
    
    doSendInviteMail(data[lastIndex][COLUMN_EMAIL],data[lastIndex][COLUMN_FORNAVN],data[lastIndex][COLUMN_EFTERNAVN]);
    
    
    _setNewStatus(email,SENT_STATUS + ' ('+Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd")+')');
    return {
       success: true,
       message:"Sendt invitations mail til " + email,
       newStatus:SENT_STATUS
    };
  }catch(e){
     return buildError(e,email);
  }
  
}
function _setNewStatus(email,status){
  
  var rowId =_getSheetData()
  .getValues()
  .map(function(row){return row[COLUMN_EMAIL]})
  .indexOf(email) + 1;
  
   var sheet = SpreadsheetApp
  .openById(NEWMEMBERS_SHEETID)
  .getSheetByName("Formularsvar 1");
  
  sheet.getRange(rowId,1).setValue(status);
  
 
}

function _overfoerIndmeldelsesData(email){
 
  var values= _getSheetData().getValues();
  var nytmedlem = values
  .filter(function(item){return item[COLUMN_EMAIL]==email})[0];
  
  //første: fornavn D - index 3
  //sidste: tidstempel J - index 9
  var erUdmeldt=false;
  try{
      erUdmeldt = medlemmer_common.erUdmeldt(email, stamdata);
  }catch(e){
    //Denne metode smider fejl hvis medlemment ikke findes
    Logger.log(e);
  }
  if(erUdmeldt){
    throw "indmelding af et tidligere udmeldt medlem er ikke implementeret endnu... snak med lohals@gmail.com"
    //updateStamdataForMedlem()
  }else{
  
    var stamdata =[
      nytmedlem[3],
      nytmedlem[4],
      nytmedlem[5],
      nytmedlem[6],
      nytmedlem[7],
      nytmedlem[8],
      nytmedlem[9],
      '',//udmeldelsesdato
      nytmedlem[10]==''? 'Ja':nytmedlem[10]
    ];
    medlemmer_common.addStamdataForMedlem(email,stamdata);
    
  }
  return nytmedlem;
}





function sendInviteTestMail(){
 doSendInviteMail(_swcEmail,"SWC fornavn","SWC efternavn");
   
}
function doSendInviteMail (email,fornavn,efternavn){
  swcadmin_common.sendDocument(
      INVITATIONS_MAILTEMPLATE,
      {
      email:email,
      fornavn:fornavn,
      efternavn:efternavn,
    },email,"Velkommen til SWC");

}
function sendConfirmationTestMail(){
   doSendConfirmationMail(_swcEmail,"SWC fornavn","SWC efternavn");

}
function doSendConfirmationMail (email,fornavn,efternavn){
  swcadmin_common.sendDocument(
      CONFIRMATION_MAILTEMPLATE,
      {
      email:email,
      fornavn:fornavn,
      efternavn:efternavn,
    },email,"Du er nu blevet meldt ind i SWC");

}
function buildError(message,context){
  return {
      success: false,
      message:"Error occured for "+context+": "+ message,
    };
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}



//TESTS

function testIndmeld(){
   indmeld("rlhtest@test.dk");

}