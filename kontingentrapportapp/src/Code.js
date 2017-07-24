var MANUEL_REGISTRINGER_SPREADSHEET_ID= UserProperties.getProperty("ManuelRegistreringerSheetId");

var KONTINGENT_RAPPORT_TEMPLATE ="1nUDatf7SxoYOASDrVEeLjwGA2gtsYvS84RcwkaUcxDA";

var CSV_HEADER_FORMAT="\"Dato\";\"Tekst\";\"Bel\u00AFb\";\"Saldo\";\"Status\";\"Afstemt\"\r\n\"01.04.2016\";\"Jan Aasbjerg Peterse\";\"700,00\";\"435.039,07\";\"Udf\u00AFrt\";\"Nej\"";
var _RAPPORTS_FOLDER ="KontingentRapporter";


function doGet() {
  //return HtmlService.createHtmlOutput("<div>dsf</div>");
  var html = HtmlService.createTemplateFromFile("main");
  

   return html.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);

  
}

function udmeld(emails){
  if(emails==null || emails.length==0)
    throw "ingen medlemmer angivet til udmeldelse";
  
  var stamdata = medlemmer_common.getMedlemmerStamdata();
  var result = [];
  
  var i= 0;
  for(i;i<emails.length;i++){
      var email=emails[i];
      if(!medlemmer_common.erMedlem(email, stamdata)){
        throw email + " er ikke registreret medlem";
      }
    
      medlemmer_common.setUdmeldtStatus(email);
      result.push({
         email:email,
         status: 'udmeldt'
      });
  }
  return result;
}

function searchForLastMailDate(emails){
  var returnList = []; 
  for(var i=0;i<emails.length;i++){
      var returnObject= {lastActivity:null,email:emails[i]};
      var result = GmailApp.search("from:" +emails[i]).map(function(thread){return thread.getLastMessageDate();});   
      if(result.length>0){
        var sorted = result.sort(function(a,b){
          if(a<b)
            return 1;
          if(a>b)
            return -1;
          return 0;
       });
       returnObject.lastActivity = swcadmin_common.convertToStringsDate(sorted[0]);
       
      }
      returnList.push(returnObject);
  }
  
   return returnList;
  
}

function getStats(id){
    var rapport=SpreadsheetApp.openById(id);
    var rapportSheet= rapport.getSheetByName("Rapport");
    var result=  rapportSheet.getRange(2, 1,rapportSheet.getLastRow(),rapportSheet.getLastColumn()).getValues();
    return result;

}
function getLatestRapports(){
  
  var kontingentRapportFolders= DriveApp.getFoldersByName(_RAPPORTS_FOLDER);
  var kontingentRapportFolder;
  if(kontingentRapportFolders.hasNext()){
    kontingentRapportFolder =kontingentRapportFolders.next();
  }else{
    throw "No kontingent rapport folder found";
   }
  var rapporter = [];
  var files=kontingentRapportFolder.getFiles();
  while(files.hasNext()){
    var file =files.next();
    //,lastUpdated:file.getLastUpdated()
    rapporter.push({url:file.getUrl(), name:file.getName(), id:file.getId(),date:swcadmin_common.convertToStringsDate(file.getLastUpdated())});
  }
  return rapporter;
}

function createNewRapport(formObject){
  if(!_isValidCsvFormat(formObject.csv)){
    throw "Det forventes at konto udtog filen er en semi kolon separeret .csv  fil med eksempel formatet: \n\n"+
     CSV_HEADER_FORMAT;
  }
  var kontoData = _parseCsv(formObject.csv); 
  
  var newRapportId = _cloneRapportTemplate()
  var newRapport = SpreadsheetApp.openById(newRapportId);
  
  _insertKontoData(kontoData,newRapport);
  
  var medlemmer =medlemmer_common.getMedlemmerSheet();
  _copyIndmeldteData(newRapport,medlemmer);
  
  _addManualIndbetalinger(newRapport);
  
  
  _setCalculationForAllMembers(newRapport);
     
  newRapport.setActiveSheet(newRapport.getSheetByName("Rapport"));
  
  
  
  return {url:newRapport.getUrl(),name:newRapport.getName(), id:newRapport.getId(),date:swcadmin_common.convertToStringsDate(new Date())};
}

function _addManualIndbetalinger(newRapport){
    var sheet = SpreadsheetApp.openById(MANUEL_REGISTRINGER_SPREADSHEET_ID).getSheetByName("emails");
    var data = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
    
    var targetSheet = newRapport.getSheetByName("Manuel registrering");
     if(data.length >0){
          targetSheet.getRange(2,1,data.length,data[0].length).setValues(data);
     }
    var calculationSource= targetSheet.getRange(2,6,1,1);
    calculationSource.copyTo(targetSheet.getRange(3,6,data.length,1));
  
}


function _setCalculationForAllMembers(newRapport){
 var rapportSheet =newRapport.getSheetByName("Rapport");
//  
//  sheet.insertRows(3, medlemmer.getLastRow()-2);
//  
   var calculationRange = rapportSheet.getRange(2,1,1,rapportSheet.getLastColumn());
//  
  
  
  var newRapportMedlemsliste= newRapport.getSheetByName("Medlemsliste");
  
  var lastCol =calculationRange.getLastColumn();
  
  calculationRange.copyTo(rapportSheet.getRange(3,1,newRapportMedlemsliste.getLastRow()-2,lastCol));

}


function _isValidCsvFormat(file){
   
   var headerData = file.getBlob()
   .getDataAsString()
   .split("\n")[0]
   .split(";");
   var result = 
       headerData[0].match(/^"?Dato"?$/) !=null
       && headerData[1].match(/^"?Tekst"?$/) !=null
       && headerData[2].match(/^"?Bel\Sb"?$/)!=null;
                     ;
   return result;
}

function _parseCsv(file){
   var result =file.getBlob()
   .getDataAsString()
   .split("\n")
   .map(function(row){
      var row =  row.split(";")
         .map(function (row){
             return  row.replace(/^\"/,"").replace(/\"$/,"");
          });
      row[2] =parseInt(row[2]);
      return row;
   });
  return result;
}

function _cloneRapportTemplate(){
  
  var rapportFolder =_RAPPORTS_FOLDER;
  var rapportFolders = DriveApp.getFoldersByName(rapportFolder);
  if (rapportFolders.hasNext()) {
      rapportFolder = rapportFolders.next();
    } else {
      rapportFolder = DriveApp.createFolder(rapportFolder);
    }
  return DriveApp
  .getFileById(KONTINGENT_RAPPORT_TEMPLATE)
  .makeCopy("Kontingent opgørelse " + new Date(), rapportFolder).getId();
  
}



function _copyIndmeldteData(newRapport,medlemmer){
  
  var targetSheet = newRapport.getSheetByName("Medlemsliste").clear();
  
  var valuesToCopy = medlemmer
  .getRange(1, 1, medlemmer.getLastRow(), medlemmer.getLastColumn())
  .getValues()
  .filter(function(row){
    var udmeldtValue=row[medlemmer_common.UDMELDT_COLUMN_ID-1];
    return (udmeldtValue=='' 
    || udmeldtValue == medlemmer_common.UDMELDELSES_COLUMNHEADER);
  });
  
  targetSheet.getRange(2,1,valuesToCopy.length,valuesToCopy[0].length).setValues(valuesToCopy);

}
function _insertKontoData(kontoData,newRapport){
  var sheet = newRapport
  .getSheetByName("Konto udtog")
  .clear();
  
  sheet.getRange(1, 1, kontoData.length, kontoData[0].length).setValues(kontoData);
}
function test_searchForLastMailDate(email){
    var result= _searchForLastMailDate("xxx@gmail.com");
    alert(result);
 }


function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

function testcreateNewRapport(){
  
   var testfile = DriveApp.getFileById("0B6zVGnjYaDZiQ1NMYmdkbS1Id28");
   //var data = testfile.getBlob().getDataAsString().split("\n");
   
  
   var result = createNewRapport(
     {
       csv:testfile
     });
}

function testGetStats(){
   var result = getStats("1eAFkk-YGDBL8DjpLAGnKrioVpFkNWH5toNZi442qtNA");
   var x=2;
}

function testUdmeld(){
   var result =udmeld(["xx@gmail.com"]);
   console.log(result); 
}