import { ReportPaymentInfo } from "./types";

const mobileSampleData = `Event;Currency;Amount;Date and time;Customer name;MP-number;Comment;TransactionID;Payment point;MyShop-Number;Date;Time
Payment;DKK;400,00;2020-03-31T23:21:26.0879910+02:00;fornavn1 efternavn1;xxxx 9636;99910525 fornavn1 efternavn1;148E030050388264;SWC;93932;2020-03-31;23.21.26
Payment;DKK;750,00;2020-03-30T23:15:16.9441027+02:00;fornavn2 efternavn2;xxxx 6538;99910600 fornavn2 efternavn2;082E030050247682;SWC;93932;2020-03-30;23.15.16
`;

const kontoUdtogData = `"Dato";"Tekst";"Beløb";"Saldo";"Status";"Afstemt"
"01.04.2016";"Jan Aasbjerg Peterse";"700,00";"435.039,07";"Udført";"Nej"
"01.04.2016";"Jan Aasbjerg Peterse";"700,00";"435.039,07";"Udført";"Nej"
`;
describe("serverLib._isValidMobileCsvFormat", () => {
  test("returns true if header is correct", () => {
    // Loading library inside test method in order to be able to mock global variable
    const serverLib = require("./serverLib");
    const result: ReportPaymentInfo = serverLib._isValidMobileCsvFormat(
      mobileSampleData
    );
    expect(result).toBeTruthy();
  });
  test("returns false if header is incorrect", () => {
    // Loading library inside test method in order to be able to mock global variable
    const serverLib = require("./serverLib");
    const result: ReportPaymentInfo = serverLib._isValidMobileCsvFormat(
      "Somewrongfile"
    );
    expect(result).toBeFalsy();
  });
});
test("_parseMobilePayCsvFile", () => {
  // Loading library inside test method in order to be able to mock global variable
  const serverLib = require("./serverLib");
  const result: ReportPaymentInfo = serverLib._parseMobilePayCsvFile(
    mobileSampleData
  );
  expect(result).toHaveLength(2);
  expect(result).toEqual([
    [
      "2020-03-31",
      "99910525 fornavn1 efternavn1",
      400,
      "-",
      "Fra MobilePay",
      "Nej"
    ],
    [
      "2020-03-30",
      "99910600 fornavn2 efternavn2",
      750,
      "-",
      "Fra MobilePay",
      "Nej"
    ]
  ]);
});

test("_parseCsvKontoUdtogFile", () => {
  // Loading library inside test method in order to be able to mock global variable
  const serverLib = require("./serverLib");
  const result: ReportPaymentInfo = serverLib._parseCsvKontoUdtogFile(
    kontoUdtogData
  );
  expect(result).toHaveLength(3);
  expect(result).toEqual([
    ["Dato", "Tekst", "Beløb", "Saldo", "Status", "Afstemt"],
    ["2016-04-01", "Jan Aasbjerg Peterse", 700, "435.039,07", "Udført", "Nej"],
    ["2016-04-01", "Jan Aasbjerg Peterse", 700, "435.039,07", "Udført", "Nej"]
  ]);
});

test("_mergeKontoudtogAndCsv", () => {
  // Loading library inside test method in order to be able to mock global variable
  const serverLib = require("./serverLib");
  const result: ReportPaymentInfo = serverLib._mergeKontoudtogAndCsv(
    [
      ["Dato", "Tekst", "Beløb", "Saldo", "Status", "Afstemt"],
      ["2016-04-01", "Jan Aasbjerg Peterse", 700, "435.039,07", "Udført", "Nej"]
    ],
    [
      [
        "2020-03-30",
        "99910600 fornavn2 efternavn2",
        750,
        "-",
        "Fra MobilePay",
        "Nej"
      ],
      [
        "2020-03-31",
        "99910525 fornavn1 efternavn1",
        400,
        "-",
        "Fra MobilePay",
        "Nej"
      ]
    ]
  );

  // There should be 4 items
  expect(result).toHaveLength(4);

  // First row item should be this
  expect(result[0]).toEqual([
    "Dato",
    "Tekst",
    "Beløb",
    "Saldo",
    "Status",
    "Afstemt"
  ]);

  // Asserting on date colum that they are sorted correctly
  expect(result.map(items => items[0])).toEqual([
    "Dato",
    "2020-03-31",
    "2020-03-30",
    "2016-04-01"
  ]);
});
beforeEach(() => {
  // mock this in order for tests to run
  global["PropertiesService"] = {
    getScriptProperties: () => ({
      getProperty: (key: string) => "RandomKey"
    })
  };
});
