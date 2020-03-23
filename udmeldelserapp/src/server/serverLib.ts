import { getIndexOf } from "../../../.shared/utilities";

export function getHtml(e) {
  return HtmlService.createHtmlOutputFromFile("dist/index.html");
}

export function getUdmeldelserAdresses(label: string) {
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
