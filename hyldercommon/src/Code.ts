
var HYLDESHEET_ID=UserProperties.getProperty("HylderSheetId");
var HYLDERLOGSHEET_ID=UserProperties.getProperty("HylderLogSheetId");
var HYLDESHEET_NAME="Hylder";
var HYLDE_CONTAINER_COLUMN= 1;
var HYLDE_HYLDENR_COLUMN= 2;
var HYLDE_MEDLEMSNUMMER_COLUMN= 3;
var HYLDE_NAVN_COLUMN= 4;
var HYLDE_EMAIL_COLUMN= 5;

var RESERVERETHYLDER_ID = UserProperties.getProperty("ReserveretHylderSheetId");
var RESERVERETHYLDER_SHEET="reservationer";
var RESERVERT_EMAIL_COLUMNINDEX = 1;
var RESERVERT_HYLDENR_COLUMNINDEX = 0;

function getHyldeLog(){
  var hyldeLog=SpreadsheetApp.openById(HYLDERLOGSHEET_ID)
  .getSheetByName("log");
  
  return hyldeLog
  .getRange(2,1,hyldeLog.getLastRow(), 5)
  .getValues()
  .filter(function(row){
    return row[0] ? true:false; // filter out any empty rows
  })
  .map(function(row){
    row[4] = swcadmin_common.convertToStringsDate(row[4] as Date); // gapps doesnt handle date objects client side
    return row;
});;
}

function getReservedHylderInfo(){
  return getReservedHylderData()
  .filter(function(row){return row[RESERVERT_EMAIL_COLUMNINDEX]!=='';})
  .map(function(row){
    return {
    email: row[RESERVERT_EMAIL_COLUMNINDEX],    
    hyldenr: row[RESERVERT_HYLDENR_COLUMNINDEX],
    reserveretDato:row[2] instanceof Date? Utilities.formatDate(row[2] as Date, "GMT+1", "dd/MM/yyyy"):row[2]
  }});
}


function getReservedHylderData(){
  var reservedSheet=SpreadsheetApp.openById(RESERVERETHYLDER_ID)
  .getSheetByName(RESERVERETHYLDER_SHEET);
  
  var reservedHylderInfo =reservedSheet
  .getRange(2,1,reservedSheet.getLastRow(), 3)
  .getValues();
  
   return reservedHylderInfo;
}

function getHyldeInfo(){
  return getHyldeDataValues()
  .map(function(row){
    return {
      hyldenr: row[1],
      container: row[0],
      medlemsnummer: row[2],
      navn: row[3],
      email:row[4]
    }
  });

}
function getHyldeSheet(){
return SpreadsheetApp.openById(HYLDESHEET_ID).getSheetByName(HYLDESHEET_NAME);
}
function getHyldeDataValues(){
  var sheet = getHyldeSheet();
  
  var lastRow =sheet.getLastRow();
  
  return sheet
    .getRange(2, 1, lastRow, 5)
    .getValues()
    .filter(function(row){
        return row[1] !=='';
      });
   
}
function addHylde(hyldenr,email,stamdata){
  //get medlemsnummer
  var medlemsNummer = medlemmer_common.getMedlemsNummmer(email,stamdata);
  if(medlemsNummer===-1){
     throw "kunne ikke finde medlemsnummer";
  }
  
  //Get hylde row
  var hyldeData= getHyldeDataValues();
  var rowId = hyldeData
     .map(function(row){return row[HYLDE_HYLDENR_COLUMN-1];})
      .indexOf(hyldenr) +2;// +2 for header and because indexOf is zero based (but rows are 1 based);
  
  //add member
  var hyldeSheet = getHyldeSheet();
  hyldeSheet.getRange(rowId,HYLDE_MEDLEMSNUMMER_COLUMN).setValue(medlemsNummer);
}

//test
function test2() { 
  var s = getHyldeSheet();
  return 2;
}