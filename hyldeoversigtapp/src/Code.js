
function doGet() {
      
  var html= HtmlService.createTemplateFromFile('main');
    
    html.data = {
    };
  return html.evaluate()
  .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}


function loadHylder(){
  
  //TODO: tilføj info resereveret hylde...
  return hyldercommon.getHyldeInfo();
}
function remove(info){
 
  var values =hyldercommon.getHyldeDataValues();
  
  var rowId = swcadmin_common.getIndexOf(values, function(row)
                       {
                         return row[hyldercommon.HYLDE_MEDLEMSNUMMER_COLUMN-1] == info.medlemsnummer 
                         && row[hyldercommon.HYLDE_HYLDENR_COLUMN-1] == info.hyldenr;
                       }) +2;// +2 for header and because indexOf is zero based (but rows are 1 based);
 
  if(rowId<3){
    throw "Det ser ikke ud til der er nogen på hyldelisten med medlemsnummer: "+ info.medlemsnummer +" på hylde nr. "+ info.hyldenr;
  }
  var sheet = hyldercommon.getHyldeSheet();
  sheet.getRange(rowId,hyldercommon.HYLDE_MEDLEMSNUMMER_COLUMN).setValue('');
  
  return loadHylder();
}

function testAdd(){
  var hyldeInfo= JSON.parse("{\"newOwner\":\"mail@gmail.com\",\"hyldenr\":155}");
  var result =add(hyldeInfo);
  var break_this = "here";
}

function add(hyldeInfo){
 
  
  var email = hyldeInfo.newOwner;
  var stamdata= medlemmer_common.getMedlemmerStamdata();
  if(!medlemmer_common.erMedlem(email, stamdata)){
     throw "Email kunne ikke findes i medlemsdatabase. Er du sikker"+
      " på at personen er meldt ind, og at det er den email adresse de står registreret med?"
  }
  
  hyldercommon.addHylde(hyldeInfo.hyldenr, email,stamdata);
  var reloadedHyldeData=hyldercommon.getHyldeDataValues();
  
  var navn = reloadedHyldeData[153];
  var hylderForMember= reloadedHyldeData
  .filter(function(row){
      return row[hyldercommon.HYLDE_EMAIL_COLUMN-1].toLowerCase()==email.toLowerCase();
  });
  
  var name = hylderForMember[0][hyldercommon.HYLDE_NAVN_COLUMN-1];
  
  return { newlyAddedNavn: name };
}
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}