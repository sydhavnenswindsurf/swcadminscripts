import _ from "lodash";
import { convertToStringsDate } from "./../../../.shared/server/utilities";
import {
  ReportInfo,
  Report,
  LastEmailActivity,
  CreateReportInputFormObject,
  UploadedFile,
  ReportPaymentInfo
} from "./types";
var MANUEL_REGISTRINGER_SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty(
  "ManuelRegistreringerSheetId"
);
var KONTINGENT_RAPPORT_TEMPLATE =
  "1nUDatf7SxoYOASDrVEeLjwGA2gtsYvS84RcwkaUcxDA";
var CSV_HEADER_FORMAT =
  '"Dato";"Tekst";"Bel\u00AFb";"Saldo";"Status";"Afstemt"\r\n"01.04.2016";"Jan Aasbjerg Peterse";"700,00";"435.039,07";"Udf\u00AFrt";"Nej"';
var MOBILE_CSV_HEADER_FORMAT =
  "Event;Currency;Amount;Date and time;Customer name;MP-number;Comment;TransactionID;Payment point;MyShop-Number;Date;Time";
var _RAPPORTS_FOLDER = "KontingentRapporter";

export function doGet() {
  var html = HtmlService.createTemplateFromFile("dist/client/index.html");
  return html
    .evaluate()
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

export function udmeld(emails) {
  if (emails === null || emails.length === 0)
    throw "ingen medlemmer angivet til udmeldelse";
  var stamdata = medlemmer_common.getMedlemmerStamdata();
  var result = [];
  var i = 0;
  for (i; i < emails.length; i++) {
    var email = emails[i];
    if (!medlemmer_common.erMedlem(email, stamdata)) {
      throw email + " er ikke registreret medlem";
    }
    medlemmer_common.setUdmeldtStatus(email);
    result.push({
      email: email,
      status: "udmeldt"
    });
  }
  return result;
}
export function searchForLastMailDate(emails): LastEmailActivity[] {
  var returnList = [];
  for (var i = 0; i < emails.length; i++) {
    var returnObject = { lastActivity: null, email: emails[i] };
    var result = GmailApp.search("from:" + emails[i]).map(thread => {
      return thread.getLastMessageDate();
    });
    if (result.length > 0) {
      var sorted = result.sort((a, b) => {
        if (a < b) return 1;
        if (a > b) return -1;
        return 0;
      });
      returnObject.lastActivity = convertToStringsDate(sorted[0]);
    }
    returnList.push(returnObject);
  }
  return returnList;
}
export function getStats(id): Report {
  var rapport = SpreadsheetApp.openById(id);
  var rapportSheet = rapport.getSheetByName("Rapport");
  var result = rapportSheet
    .getRange(2, 1, rapportSheet.getLastRow(), rapportSheet.getLastColumn())
    .getValues();
  return result;
}
export function getLatestRapports(): ReportInfo[] {
  const kontingentRapportFolders = DriveApp.getFoldersByName(_RAPPORTS_FOLDER);
  const kontingentRapportFolder = kontingentRapportFolders.hasNext()
    ? kontingentRapportFolders.next()
    : null;
  if (!kontingentRapportFolder) throw "No kontingent rapport folder found";
  const files: GoogleAppsScript.Drive.File[] = [];
  var fileIterator = kontingentRapportFolder.getFiles();
  while (fileIterator.hasNext()) {
    files.push(fileIterator.next());
  }
  //sort by newest files, and return latest 5 and map to gui friendly object
  var rapporter = _(files)
    .sortBy(f => {
      return f.getLastUpdated();
    })
    .takeRight(5)
    .value()
    .map(f => {
      return {
        url: f.getUrl(),
        name: f.getName(),
        id: f.getId(),
        date: convertToStringsDate(f.getLastUpdated())
      };
    });
  return rapporter;
}
export function createNewRapport(formObject: CreateReportInputFormObject) {
  if (!formObject.mobilepay) throw "No mobilepay csv uploaded";

  if (!_isValidCsvFormat(formObject.csv)) {
    throw "Det forventes at konto udtog filen er en semi kolon separeret .csv  fil med eksempel formatet: \n\n" +
      CSV_HEADER_FORMAT;
  }

  const mobilePayRawString = formObject.mobilepay.getBlob().getDataAsString();
  if (!_isValidMobileCsvFormat(mobilePayRawString)) {
    throw "Det forventes at mobile pay udtog filen er en semi kolon separeret .csv  fil med eksempel formatet: \n\n" +
      MOBILE_CSV_HEADER_FORMAT;
  }

  const kontoUdtogData = _parseCsvKontoUdtogFile(
    formObject.csv.getBlob().getDataAsString()
  );

  const mobilePayData = _parseMobilePayCsvFile(mobilePayRawString);

  const mergedMobilePayAndKontoUdtogData = _mergeKontoudtogAndCsv(
    kontoUdtogData,
    mobilePayData
  );

  var newRapportId = _cloneRapportTemplate();
  var newRapport = SpreadsheetApp.openById(newRapportId);
  _insertKontoData(mergedMobilePayAndKontoUdtogData, newRapport);
  var medlemmer = medlemmer_common.getMedlemmerSheet();
  _copyIndmeldteData(newRapport, medlemmer);
  _addManualIndbetalinger(newRapport);
  _setCalculationForAllMembers(newRapport);
  newRapport.setActiveSheet(newRapport.getSheetByName("Rapport"));
  return {
    url: newRapport.getUrl(),
    name: newRapport.getName(),
    id: newRapport.getId(),
    date: convertToStringsDate(new Date())
  };
}
function _addManualIndbetalinger(newRapport) {
  var sheet = SpreadsheetApp.openById(
    MANUEL_REGISTRINGER_SPREADSHEET_ID
  ).getSheetByName("emails");
  var data = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  var targetSheet = newRapport.getSheetByName("Manuel registrering");
  if (data.length > 0) {
    targetSheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  }
  var calculationSource = targetSheet.getRange(2, 6, 1, 1);
  calculationSource.copyTo(targetSheet.getRange(3, 6, data.length, 1));
}
function _setCalculationForAllMembers(newRapport) {
  var rapportSheet = newRapport.getSheetByName("Rapport");
  //
  //  sheet.insertRows(3, medlemmer.getLastRow()-2);
  //
  var calculationRange = rapportSheet.getRange(
    2,
    1,
    1,
    rapportSheet.getLastColumn()
  );
  //
  var newRapportMedlemsliste = newRapport.getSheetByName("Medlemsliste");
  var lastCol = calculationRange.getLastColumn();
  calculationRange.copyTo(
    rapportSheet.getRange(
      3,
      1,
      newRapportMedlemsliste.getLastRow() - 2,
      lastCol
    )
  );
}
function _isValidCsvFormat(file: UploadedFile) {
  var headerData = file
    .getBlob()
    .getDataAsString()
    .split("\n")[0]
    .split(";");
  var result =
    headerData[0].match(/^"?Dato"?$/) != null &&
    headerData[1].match(/^"?Tekst"?$/) != null &&
    headerData[2].match(/^"?Bel\Sb"?$/) != null;
  return result;
}

export function _isValidMobileCsvFormat(fileContent: string) {
  var headerData = fileContent.split("\n")[0];
  return headerData === MOBILE_CSV_HEADER_FORMAT;
}

export function _parseCsvKontoUdtogFile(
  fileContent: string
): ReportPaymentInfo {
  var result = fileContent
    .split("\n")
    .filter(row => row !== "")
    .map(row => {
      return row
        .split(";")
        .map(part => {
          const unQuoted = part.replace(/^\"/, "").replace(/\"$/, "");
          // Remove quotes
          return unQuoted;
        })
        .map((part, index) => {
          // Create excel friendly date
          return index === 0 && part !== "Dato"
            ? part
                .split(".")
                .reverse()
                .join("-")
            : part;
        })
        .map((part, index) => {
          // Translate string for beløb column to int
          return index === 2 && /^\d+/.test(part) ? parseInt(part) : part;
        });
    });
  return result;
}
export function _parseMobilePayCsvFile(fileContent: string) {
  // Skip first row that is headers
  const [_, ...rows] = fileContent
    .split("\n") // split on new line
    .filter(row => row !== ""); // remove empty rows
  return _mapMobilePayToCommonReportFormat(rows);
}

function _mapMobilePayToCommonReportFormat(
  mobileCsvFileRows: string[]
): ReportPaymentInfo {
  return mobileCsvFileRows.map(row => {
    const rowParts = row.split(";");
    return [
      rowParts[10], //Date
      rowParts[6], // Comment with memberid and name
      parseInt(rowParts[2]), // Amount
      "-",
      "Fra MobilePay",
      "Nej"
    ];
  });
}

export function _mergeKontoudtogAndCsv(
  kontoUdtogData: ReportPaymentInfo,
  mobilePayData: ReportPaymentInfo
): ReportPaymentInfo {
  const [headerRow, ...restOfKontoUdtog] = kontoUdtogData;
  const allPayments = [...restOfKontoUdtog, ...mobilePayData];
  const sortedPayments = _.orderBy(allPayments, i => i[0] /* the date */, [
    "desc"
  ]);
  return [headerRow, ...sortedPayments];
}

function _cloneRapportTemplate() {
  var rapportFolders = DriveApp.getFoldersByName(_RAPPORTS_FOLDER);
  var rapportFolder;
  if (rapportFolders.hasNext()) {
    rapportFolder = rapportFolders.next();
  } else {
    rapportFolder = DriveApp.createFolder(_RAPPORTS_FOLDER);
  }
  return DriveApp.getFileById(KONTINGENT_RAPPORT_TEMPLATE)
    .makeCopy("Kontingent opgørelse " + new Date(), rapportFolder)
    .getId();
}
function _copyIndmeldteData(newRapport, medlemmer) {
  var currentYear = new Date().getFullYear();
  var targetSheet = newRapport.getSheetByName("Medlemsliste").clear();
  var valuesToCopy = medlemmer
    .getRange(1, 1, medlemmer.getLastRow(), medlemmer.getLastColumn())
    .getValues()
    .filter((row, index) => {
      //filter out members indmeldt in current year
      var indmeldDate = row[medlemmer_common.INDMELDELSESDATO_COLUMNID - 1];
      if (
        indmeldDate != null &&
        indmeldDate.getFullYear !== undefined &&
        currentYear === indmeldDate.getFullYear()
      )
        return false;
      var udmeldtValue = row[medlemmer_common.UDMELDT_COLUMN_ID - 1];
      return (
        udmeldtValue == "" ||
        udmeldtValue == medlemmer_common.UDMELDELSES_COLUMNHEADER
      );
    });
  targetSheet
    .getRange(2, 1, valuesToCopy.length, valuesToCopy[0].length)
    .setValues(valuesToCopy);
}
function _insertKontoData(kontoData, newRapport) {
  var sheet = newRapport.getSheetByName("Konto udtog").clear();
  sheet
    .getRange(1, 1, kontoData.length, kontoData[0].length)
    .setValues(kontoData);
}
function test_searchForLastMailDate(email) {
  var result = searchForLastMailDate("xxx@gmail.com");
  alert(result);
}
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
function testGetStats() {
  var result = getStats("1eAFkk-YGDBL8DjpLAGnKrioVpFkNWH5toNZi442qtNA");
  var x = 2;
}
function testUdmeld() {
  var result = udmeld(["xx@gmail.com"]);
  console.log(result);
}
