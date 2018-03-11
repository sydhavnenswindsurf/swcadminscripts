
var MAILFOLDER ="SWC Admin/Ledig hylde";
var HYLDE_VENTELISTE_SHEET_ID= PropertiesService.getScriptProperties().getProperty("HyldeVentelisteSheetId"); 
var HYLDE_VENTELISTE_SHEET_NAME="Formularsvar 1";
var STATUS_COL =1;
var NAME_COL = 4;
var EMAIL_COL = 5;
var ISMEMBER_COL=6;
var WANTED_CONT_COL=7;
var WANTED_HYLDE_COL=8;
var COMMENTS_COL=9;

var HYLDEINVITE_TEMPLATE_ID= "1Kgo7WGLOQkm_hscTNjLb7ucovmCqE1wy0QHADO_Nw_Y"; 
var HYLDECONFIRM_TEMPLATE_ID= "1hZ62lKRZi7e8uu55Isq32SlxKgJfuzxyburQel_ndvE";

var TOTAL_NUMBER_COLUMNS = 9;

var DONE_STATUS =["Tildelt","Fortrudt","Fjernet"];

// @ts-ignore
function doGet() {
      
  var html= HtmlService.createTemplateFromFile('main');
    
  return html.evaluate()
  .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

function loadLedigeHylder(){ 
  var resHylder =hylder_common.getReservedHylderInfo();
  
  var sheet =SpreadsheetApp.openById(hylder_common.HYLDESHEET_ID).getSheetByName(hylder_common.HYLDESHEET_NAME);
  var values= sheet.getRange(2, hylder_common.HYLDE_CONTAINER_COLUMN, sheet.getLastRow(), 3).getValues();
  
  var containerIndex= 0;
  var hyldeIndex =1;
  var medlemNummerIndex=2;
  
  var result =values
       .filter(function(row){return row[medlemNummerIndex] === ""})
  .map(function(row){return {
    container:row[containerIndex], 
    hyldenr:row[hyldeIndex]
  }})
  .filter(function(outer){
    return swcadmin_common.getIndexOf(resHylder, function(inner){return inner.hyldenr === outer.hyldenr })===-1;
  });
  
  
  return {
    ledigeHylder:result,
    reserveretHylder: resHylder
  };

}

function loadVenteliste(){
  var stamdata = medlemmer_common.getMedlemmerStamdata();
  
  var  reservedHylderInfo = hylder_common.getReservedHylderData();
  var emailsOnReservedList= reservedHylderInfo.map(function(row){return row[1];});
  
  var sheet =SpreadsheetApp.openById(HYLDE_VENTELISTE_SHEET_ID).getSheetByName(HYLDE_VENTELISTE_SHEET_NAME);
  var values= sheet.getRange(2, 1, sheet.getLastRow(), TOTAL_NUMBER_COLUMNS).getValues();
  var result = values
  .filter(function(row){
      return DONE_STATUS.indexOf(row[STATUS_COL-1] as string) ===-1
      && row[EMAIL_COL-1] !=="";
  })
  .map(function(row){
    return { 
      email: row[EMAIL_COL-1],
      navn: row[NAME_COL-1],
      comments:row[COMMENTS_COL-1],
      oensket_hylde:row[WANTED_HYLDE_COL-1],
      oensket_container: row[WANTED_CONT_COL-1],
      erIkkeMedlem: medlemmer_common.erMedlem(row[EMAIL_COL-1], stamdata)?false:true,
      hasReservation: emailsOnReservedList.indexOf(row[EMAIL_COL-1])>-1,
      tidsstempel:row[2] instanceof Date? Utilities.formatDate(row[2] as Date, "GMT", "dd/MM/yyyy"):row[2]
    }
  });
  return result;

}
function setHyldeReservation(hyldeReservation){
  var reservationSheet = SpreadsheetApp.openById(hylder_common.RESERVERETHYLDER_ID).getSheetByName(hylder_common.RESERVERETHYLDER_SHEET);
  reservationSheet.appendRow([hyldeReservation.hyldenr,hyldeReservation.medlem.email,new Date()]);
  
}

function sendHyldeInviteMail(hyldeReservation){
  swcadmin_common.sendDocument(HYLDEINVITE_TEMPLATE_ID,
                               {
                                 hyldenr: hyldeReservation.hyldenr,
                                 navn:hyldeReservation.medlem.navn,
                                 
  },hyldeReservation.medlem.email,"En hylde er blevet ledig i SWC");
}
function sendInvite(hyldeReservation){
  setHyldeReservation(hyldeReservation);
  sendHyldeInviteMail(hyldeReservation);
  
  return {success:true};
}


function removeReservation(email){
  var reservationSheet = SpreadsheetApp.openById(hylder_common.RESERVERETHYLDER_ID).getSheetByName(hylder_common.RESERVERETHYLDER_SHEET);
  var reservedHylderInfo =reservationSheet
  .getRange(1,1,reservationSheet.getLastRow(), 2)
  .getValues();
  
  reservationSheet.deleteRow(
    reservedHylderInfo
    .map(function(row){return row[1];})
    .indexOf(email)+1);
  
}
function setStatus(email,status){
  var sheet =SpreadsheetApp.openById(HYLDE_VENTELISTE_SHEET_ID).getSheetByName(HYLDE_VENTELISTE_SHEET_NAME);

  //Find all entries for email (to handle duplicate sign ups...)
  var rowIds = sheet
  .getRange(1, EMAIL_COL, sheet.getLastRow(), 1)
  .getValues()
  .map(function(row){return row[0]})
  .reduce(function (total:Array<number>,item,index){
            if(item===email){
                total.push(index+1);
            }
            return total;                
        },[]) as Array<number>;
  if(rowIds.length===0){
     throw "Couldnt find email in venteliste sheet";
  }
  rowIds.forEach(function(rowId){
        sheet.getRange(rowId, STATUS_COL).setValue(status);
    });
  
}
function frigivHylde(reservation){
  
  removeReservation(reservation.email);
  
  return {
    success:true,
    updatedHyldeInfo:loadLedigeHylder()
  };
}

function tildelHylde(reservation) {  
  //validate membership
   var stamdata =medlemmer_common.getMedlemmerStamdata();
   if(!medlemmer_common.erMedlem(reservation.email, stamdata)){
      throw ""+ reservation.email +" er ikke medlem.. Personen skal meldes ind, før man kan tilføjes hyldelisten";
   }
  
  //add to hylder
   hylder_common.addHylde(reservation.hyldenr,reservation.email,stamdata);
   
  //send confirmation
   swcadmin_common.sendDocument(HYLDECONFIRM_TEMPLATE_ID,
                               {
                                 hyldenr: reservation.hyldenr
                               },reservation.email,"Tillykke med hylden i SWC");
  
  
  removeReservation(reservation.email);
  
  setStatus(reservation.email,"Tildelt");
  
  swcadmin_common.moveMail(reservation.email, MAILFOLDER, MAILFOLDER + "/Processeret");
  
  //Remove member from list
  removeFromList(reservation.email);
  
  
  return {success:true,message:"medlem påført hylden"};
}

function removeFromList(email){
    setStatus(email,"Fjernet");
  return {success:true}
}

// @ts-ignore
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}



