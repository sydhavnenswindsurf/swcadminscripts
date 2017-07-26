import * as lodash from 'lodash';
declare let LodashGS:any;
let _:lodash.PH=LodashGS.load();
var COLUMN_STATUS = "0";
var COLUMN_FORNAVN = "3";
var COLUMN_EFTERNAVN = "4";
var COLUMN_EMAIL = "5";
var DONE_STATUS = ["Afvist", "Indmeldt", "Færdigbehandlet"];
var SENT_STATUS = "Sendt mail";
var INDMELDT_STATUS = "Indmeldt";
var NEWMEMBERS_SHEETID = PropertiesService.getScriptProperties().getProperty("NewMemberSheetId");
var INVITATIONS_MAILTEMPLATE = PropertiesService.getScriptProperties().getProperty("InvitationsMailSkabelonId");
var CONFIRMATION_MAILTEMPLATE = PropertiesService.getScriptProperties().getProperty("ConfirmationMailTemplateId");
var _swcEmail = PropertiesService.getScriptProperties().getProperty("swcemail");

function doGet(): any{
   return buildGui();

}
function buildGui(): any { 
    var html = HtmlService.createTemplateFromFile('main');
    var result = html.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME); 
    return result;
 
}
function getUbehandledeIndmeldelser(): any{
     var data = _getSheetData()
        .getValues()
        .filter( (row)=> {
        var status = row[COLUMN_STATUS];
        return DONE_STATUS.indexOf(status) === -1;
    })
        .map((row)=> {
        if (row[COLUMN_STATUS] === "") {
            row[COLUMN_STATUS] = "Ubehandlet";
        }
        return row; 
    });


    var returData = data.map((row,index)=> {
        return {
            status: row[COLUMN_STATUS],
            email: row[5],
            fornavn: row[3],
            efternavn: row[4],
            telefon: row[6],
            tidsstempel: row[9] instanceof Date ? Utilities.formatDate(row[9], "GMT", "yyyy-MM-dd") : row[9],
            brugerklubudstyr: row[10],
            bemaerkninger: row[11],
            sidsteMail: index===0?"Seneste mailsvar":"henter..."
        };
    });
    return returData;

}
function getLatestMails(emails:string[]):Array<any>{

    return emails.map((email)=>{
        var latestMail = getLatestMail(email);
        Utilities.sleep(200);
        return latestMail;
    });

}
function getLatestMail(email:string):any{

    Logger.log(HtmlService.getUserAgent()); 


    var latestThread = _.chain(GmailApp.search("from:"+email))
        .orderBy((t:GoogleAppsScript.Gmail.GmailThread)=> t.getLastMessageDate(),"desc")
        .first()
        .value();
        
    if(latestThread==null)
        return {email:email};
    
    var latestMesssage = _.chain(latestThread.getMessages())
        .filter((mes)=>mes.getFrom().toLowerCase().indexOf(email.toLowerCase())!==-1)
        .orderBy((mes)=>mes.getDate(),"desc")        
        .first()
        .value();

    return {
            email:email,
            lastMailDate:Utilities.formatDate(latestMesssage.getDate(), "GMT", "yyyy-MM-dd"),
            mailContent: latestMesssage.getPlainBody(),
            mailId:latestMesssage.getId()
        };
}

function indmeld(email: any): any{
   
    var stamdata = medlemmer_common.getMedlemmerStamdata();
    if (medlemmer_common.erMedlem(email, stamdata)) {
        throw email + " er allerede registreret som medlem";
    }
    var nytmedlem = _overfoerIndmeldelsesData(email);
    doSendConfirmationMail(email, nytmedlem[3], nytmedlem[4]);
    _setNewStatus(email, INDMELDT_STATUS);
    swcadmin_common.moveMail(email, "SWC Admin/Indmeldelser", "SWC Admin/Indmeldelser/Processeret");
    return {
        success: true,
        message: "Medlem er indmeldt, og der er sendt bekræftelses mail med information",
        newStatus: INDMELDT_STATUS
    };
}
function afvis(email: any): any{
    _setNewStatus(email, "Afvist");
    swcadmin_common.moveMail(email, "SWC Admin/Indmeldelser", "SWC Admin/Indmeldelser/Processeret");
    return {
        success: true,
        message: "ok fjernede " + email + " fra indmeldelseslisten",
        newStatus: "Afvist"
    };
} 
 
 function _getSheetData(): any{
     var sheet = SpreadsheetApp
        .openById(NEWMEMBERS_SHEETID)
        .getSheetByName("Formularsvar 1");
    var data = sheet
        .getDataRange();
    return data;

 }
function sendVelkomstMail(email: any): any {
   var data = _getSheetData().getValues().filter((item) => { return item[COLUMN_EMAIL] === email; });
    if (data.length < 1) {
        return buildError("Der kunne ikke findes nogen indmeldelser for e-mailen: " + email, email);
    }
    try {
        var lastIndex = data.length - 1;
        doSendInviteMail(data[lastIndex][COLUMN_EMAIL], data[lastIndex][COLUMN_FORNAVN], data[lastIndex][COLUMN_EFTERNAVN]);
        _setNewStatus(email, SENT_STATUS + ' (' + Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd") + ')');
        return {
            success: true,
            message: "Sendt invitations mail til " + email,
            newStatus: SENT_STATUS
        };
    }
    catch (e) {
        return buildError(e, email);
    }
}


function _setNewStatus(email: any, status: string): any{

   var rowIds = _getSheetData()
        .getValues()
        .map((row)=> { return row[COLUMN_EMAIL]; })
        .reduce(function (a,e,i){
            if(e===email){
                a.push(i+1);
            }
            return a;                
        },[]);
        
    var sheet = SpreadsheetApp
        .openById(NEWMEMBERS_SHEETID)
        .getSheetByName("Formularsvar 1");

    rowIds.forEach(function(rowId){
        sheet.getRange(rowId, 1).setValue(status); 
    });
    
}
 function _overfoerIndmeldelsesData(email: any): any{
 var values = _getSheetData().getValues();
    var nytmedlem = values
        .filter((item)=> { return item[COLUMN_EMAIL] === email; })[0];
    //første: fornavn D - index 3
    //sidste: tidstempel J - index 9
    var erUdmeldt = false;
    try {
        erUdmeldt = medlemmer_common.erUdmeldt(email);
    }
    catch (e) {
        //Denne metode smider fejl hvis medlemment ikke findes
        Logger.log(e);
    }
    if (erUdmeldt) {
        throw "indmelding af et tidligere udmeldt medlem er ikke implementeret endnu... snak med lohals@gmail.com";
    }
    else {
        var stamdata = [
            nytmedlem[3],
            nytmedlem[4],
            nytmedlem[5],
            nytmedlem[6],
            nytmedlem[7],
            nytmedlem[8],
            nytmedlem[9],
            '',
            nytmedlem[10] === '' ? 'Ja' : nytmedlem[10]
        ];
        medlemmer_common.addStamdataForMedlem(email, stamdata);
    }
    return nytmedlem;


}
function sendInviteTestMail(): void {

        doSendInviteMail(_swcEmail, "SWC fornavn", "SWC efternavn");

}
function doSendInviteMail(email: any, fornavn: any, efternavn: any): void{
 swcadmin_common.sendDocument(INVITATIONS_MAILTEMPLATE, {
        email: email,
        fornavn: fornavn,
        efternavn: efternavn
    }, email, "Velkommen til SWC");

}
 function sendConfirmationTestMail(): void{
     doSendConfirmationMail(_swcEmail, "SWC fornavn", "SWC efternavn");
}
 function doSendConfirmationMail(email: any, fornavn: any, efternavn: any): void{
      swcadmin_common.sendDocument(CONFIRMATION_MAILTEMPLATE, {
        email: email,
        fornavn: fornavn,
        efternavn: efternavn,
    }, email, "Du er nu blevet meldt ind i SWC");

 }
 function buildError(message: any, context: any): any{
  return {
        success: false,
        message: "Error occured for " + context + ": " + message
    };
}
function include(filename: any): any{
      return HtmlService.createHtmlOutputFromFile(filename)
        .getContent();
}



//TESTS

function testIndmeld(): void{
    indmeld("rlhtest@test.dk");


}