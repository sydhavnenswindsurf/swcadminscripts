function doGet(){
  var html = HtmlService.createTemplateFromFile("main");
  

   return html.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
}
function update(medlem){
   medlemmer_common.update(medlem);
}

function loadMedlemmer(){

  var members = medlemmer_common.getMedlemmerStamdata();
  
  return members
  .filter(function(row){
     return row[8]=='' && row[0]!='';
  })
  .map(function(row){
    return {
      medlemsnummer:row[0],
      fornavn:row[1],
      efternavn:row[2],
      email:row[3],
      telefon: row[4],
      brugerklubudstyr: row[9],
      udmeldt:false,
    }
  });
}


function udmeld(medlem){  
 medlemmer_common.setUdmeldtStatus(medlem.email);
 return "Ok";
}



function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}