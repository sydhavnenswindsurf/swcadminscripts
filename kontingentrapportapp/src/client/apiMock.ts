import { ReportInfo } from "../server/types";
import { convertToStringsDate } from "./../../../.shared/server/utilities";

export function callGoogleApi(success, error) {
  return {
    getLatestRapports: () =>
      setTimeout(
        () =>
          success([
            {
              url: "http://google.com",
              id: "someid",
              name: "latest report 2020",
              date: "2020/03/30"
            }
          ] as ReportInfo[]),
        2000
      ),
    getStats: id =>
      setTimeout(
        () =>
          success([
            [
              "99999998",
              "test testname",
              "test@test.com",
              "Nej",
              2,
              1100,
              "2 hylder",
              "Nej",
              0,
              "Ja"
            ]
          ]),
        2000
      ),
    searchForLastMailDate: (emails: string[]) =>
      setTimeout(
        () =>
          success(
            emails.map((e, i) => ({
              lastActivity: `2020/03/29 11:1${i}:00`,
              email: e
            }))
          ),
        1000
      ),
    createNewRapport: formObject =>
      setTimeout(
        () =>
          formObject.csv.files.length !== 1 ||
          formObject.mobilepay.files.length !== 1
            ? error("no kontoudtog or mobile pay supplied")
            : success({
                url: "http://google.com",
                id: "someotherid",
                name: "new report 2020",
                date: "2020/03/30"
              }),
        1000
      )
  };
}
