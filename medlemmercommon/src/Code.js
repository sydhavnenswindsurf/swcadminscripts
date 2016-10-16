var _MEDLEMMER_SHEET_ID = PropertiesService.getScriptProperties().getProperty("MedlemmerSheetId");
var _MEDLEMMER_SHEET_NAME = "Medlemsliste";
var UDMELDELSES_COLUMNHEADER = 'Udmeldelsesdato';
var MEDLEMSNUMMER_COLUMN_ID = "1";
var FORNAVN_COLUMN_ID = "2";
var EFTERNAVN_COLUMN_ID = "3";
var MAIL_COLUMN_ID = 4;
var TELEFON_COLUMN_ID = 5;
var BRUGERKLUBUDSTYR_COLUMN_ID = 10;
var UDMELDT_COLUMN_ID = "9";
var INDMELDELSESDATO_COLUMNID = 8;
var LASTRAWDATA_COLUMNID = 10;
function getMedlemmerSheet() {
    return SpreadsheetApp.openById(_MEDLEMMER_SHEET_ID).getSheetByName(_MEDLEMMER_SHEET_NAME);
}
function update(updateMedlem) {
    var sheet = getMedlemmerSheet();
    var values = sheet.getRange(1, 1, sheet.getLastRow(), LASTRAWDATA_COLUMNID).getValues();
    var rowIndex = swcadmin_common.getIndexOf(values, function (row) { return row[0] == updateMedlem.medlemsnummer; });
    var targetMemberData = values[rowIndex];
    targetMemberData[FORNAVN_COLUMN_ID - 1] = updateMedlem.fornavn;
    targetMemberData[EFTERNAVN_COLUMN_ID - 1] = updateMedlem.efternavn;
    targetMemberData[MAIL_COLUMN_ID - 1] = updateMedlem.email;
    targetMemberData[TELEFON_COLUMN_ID - 1] = updateMedlem.telefon;
    targetMemberData[BRUGERKLUBUDSTYR_COLUMN_ID - 1] = updateMedlem.brugerklubudstyr;
    var targetRange = sheet.getRange(rowIndex + 1, 1, 1, LASTRAWDATA_COLUMNID);
    targetRange.setValues([targetMemberData]);
}
function addStamdataForMedlem(email, stamDataForMedlem) {
    if (erMedlem(email)) {
        throw "email adressen er allerede registreret for medlemmet";
    }
    var sheet = getMedlemmerSheet();
    var nytmedlemsnummer = getNytMedlemsnummer();
    stamDataForMedlem.splice(0, 0, nytmedlemsnummer);
    stamDataForMedlem[7] = new Date(); //indmeldeslsdato
    sheet.appendRow(stamDataForMedlem);
    var calculatedRangeTemplate = sheet.getRange(2, 14, 1, 4);
    var targetRange = sheet.getRange(sheet.getLastRow(), 14, 1, 4);
    calculatedRangeTemplate.copyTo(targetRange);
}
function getNytMedlemsnummer() {
    var sortedMedlemsnummer = getMedlemmerStamdata()
        .filter(function (row) { return row[0] != ''; })
        .map(function (row) { return row[0]; })
        .sort(function (first, second) { return first - second; });
    var result = sortedMedlemsnummer[sortedMedlemsnummer.length - 1]
        + 1;
    return result;
}
function getMedlemmerStamdata() {
    var sheet = SpreadsheetApp.openById(_MEDLEMMER_SHEET_ID)
        .getSheetByName(_MEDLEMMER_SHEET_NAME);
    return sheet
        .getRange(2, 1, sheet.getLastRow(), 10)
        .getValues();
}
function erUdmeldt(email, stamdata) {
    if (stamdata == null) {
        stamdata = getMedlemmerStamdata();
    }
    var result = stamdata
        .filter(function (row) {
        return row[MAIL_COLUMN_ID - 1].toLowerCase() == email.toLowerCase();
    });
    if (result.length == 0) {
        throw email + " findes ikke i medlemsdatabasen";
    }
    return result[0][UDMELDT_COLUMN_ID - 1] != "";
}
function erMedlem(email, stamdata) {
    if (stamdata == null) {
        stamdata = getMedlemmerStamdata();
    }
    var result = stamdata
        .filter(function (row) {
        return row[MAIL_COLUMN_ID - 1].toLowerCase() == email.toLowerCase() && row[UDMELDT_COLUMN_ID - 1] == "";
    }).length > 0;
    return result;
}
function getMedlemsNummmer(email, stamdata) {
    if (stamdata == null) {
        stamdata = getMedlemmerStamdata();
    }
    var memberInfo = stamdata
        .filter(function (row) {
        return row[MAIL_COLUMN_ID - 1].toLowerCase() == email.toLowerCase() && row[UDMELDT_COLUMN_ID - 1] == "";
    });
    var nummer = memberInfo.length > 0 ? memberInfo[0][MEDLEMSNUMMER_COLUMN_ID - 1] : -1;
    return nummer;
}
function harHylde(email) {
    var medlemsNummer = getMedlemsNummmer(email);
    var hylder = hylder_common.getHyldeDataValues().filter(function (row) {
        return row[2] == medlemsNummer;
    });
    return hylder.length > 0;
}
function setUdmeldtStatus(email) {
    if (harHylde(email)) {
        throw "Medlemmet er registreret på en hylde. Kan ikke udmelde medlem, før du har fjernet vedkommende fra hylden.";
    }
    var sheet = SpreadsheetApp.openById(_MEDLEMMER_SHEET_ID).getSheetByName(_MEDLEMMER_SHEET_NAME);
    var lastRow = sheet.getLastRow();
    var startRowOffset = 2;
    var emails = sheet.getRange(startRowOffset, MAIL_COLUMN_ID, lastRow, 1).getValues();
    var rowIndex = swcadmin_common.getIndexOf(emails, function (row) { return row[0].toLowerCase() == email.toLowerCase(); }) + startRowOffset;
    sheet.getRange(rowIndex, UDMELDT_COLUMN_ID).setValue(new Date());
}
//TEST METHODS
function testUpdate() {
    var testmedlem = {
        medlemsnummer: -1,
        email: "",
        fornavn: "",
        efternavn: "",
        telefon: "12345643",
        brugerklubudstyr: 'Nej'
    };
    update(testmedlem);
}
