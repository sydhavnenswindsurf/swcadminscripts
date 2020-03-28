import { getIndexOf } from "../../../.shared/utilities";
import { EmailInfo, UdmeldtResult } from "./types";

const udmeldelserLabelKey = "MAIL_FOLDER_UDMELDELSER";
const medlemmerSheet = PropertiesService.getScriptProperties().getProperty(
  "MedlemmerSheetId"
);
const medlemmerSheetName = "Medlemsliste";
const MAIL_COLUMN_ID = 4;
const UDMELDELSESDATE_COLUMN_ID = "9";
const PROCESSEDLABEL = "Processeret";
export function getHtml(e) {
  return HtmlService.createHtmlOutputFromFile("dist/index.html");
}

export function getUdmeldelserAdresses(label: string): EmailInfo[] {
  const emails = GmailApp.getUserLabelByName(label)
    .getThreads()
    .map(thread => {
      return thread.getMessages().filter(notOwnMailAddress);
    });
  var udmeldelseMails = flatten(emails);

  var filteredAndParsed = udmeldelseMails
    .filter(onlyUniqueMails)
    .map(message => {
      return parseMailFromData(message.getFrom());
    });

  return filteredAndParsed;
}
export function udmeld(email): UdmeldtResult {
  console.log("calling udmeld", email);
  email = "lohals@gmail.com";
  var udmeldt = false;
  var notFound = false;
  if (!medlemExists(email)) {
    console.log("Medlem didnt exist", email);
    notFound = true;
  } else {
    console.log("Setting udmeldt status", email);
    medlemmer_common.setUdmeldtStatus(email);

    console.log("Moving mail status", email);
    swcadmin_common.moveMail(
      email,
      getMailLabelName(),
      getMailLabelName() + "/" + PROCESSEDLABEL
    );
    udmeldt = true;
  }
  return {
    email: email,
    notFound: notFound,
    udmeldt: udmeldt
  };
}
function getMailLabelName() {
  //return "Test/SWC Admin/Udmeldelser";//PropertiesService.getScriptProperties().getProperty(udmeldelserLabelKey);
  return PropertiesService.getScriptProperties().getProperty(
    udmeldelserLabelKey
  );
}
function medlemExists(email) {
  var sheet = SpreadsheetApp.openById(medlemmerSheet).getSheetByName(
    medlemmerSheetName
  );
  var lastRow = sheet.getLastRow();

  var emails = sheet.getRange(2, MAIL_COLUMN_ID, lastRow, 1).getValues();

  var result =
    emails.filter(function(row) {
      return (row[0] as string).toLowerCase() === email.toLowerCase();
    }).length > 0;
  return result;
}

function onlyUniqueMails(
  value: GoogleAppsScript.Gmail.GmailMessage,
  index: number,
  self: GoogleAppsScript.Gmail.GmailMessage[]
) {
  return (
    getIndexOf(self, item => {
      return item.getFrom() === value.getFrom();
    }) === index
  );
}

function parseMailFromData(mailFrom: string) {
  var name = "";
  var email = "";
  var matches = mailFrom.match(/\s*"?([^"]*)"?\s+<(.+)>/);
  if (matches) {
    name = matches[1];
    email = matches[2];
  } else {
    email = mailFrom;
  }

  return {
    name: name,
    email: email
  };
}

function notOwnMailAddress(item: GoogleAppsScript.Gmail.GmailMessage) {
  var from = item.getFrom();
  return (
    from.indexOf("sydhavnenswindsurfdata@gmail.com") === -1 &&
    from.indexOf("sydhavnenswindsurf@gmail.com") === -1
  );
}

function flatten<T>(array: T[][]): T[] {
  return [].concat.apply([], array);
}
