import { UdmeldelserList, UdmeldelserListProps } from "./UdmeldelserList";
import * as React from "react";
import Button from "@material-ui/core/Button";
import { Introduction } from "./Introduction";
import { useEffect, useState } from "react";
import { callGoogleApi } from "../../../.shared/api";
import { EmailInfo } from "../server/types";

const startData: UdmeldelserListProps = {
  mailLabel: "SWC Admin/Udmeldelser",
  listOfMails: [],
  udmeldtMessages: [],
  notFoundMessages: [],
  bulkUdmeld: () => {
    console.log("udmeld");
  },
  isLoading: {
    currentProcessMessage: "Henter mails om udmeldelser"
  }
};

export const App = () => {
  const [listOfMails, setListOfMails] = useState<EmailInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Create an scoped async function in the hook
    // (async () => {
    //   callGoogleApi(
    //     (emails: EmailInfo[]) => {
    //       setListOfMails(emails);
    //     },
    //     error => console.log(error)
    //   ).getUdmeldelserAdresses(startData.mailLabel);
    // })();
    callGoogleApi(
      (emails: EmailInfo[]) => {
        setListOfMails(emails);
        setIsLoading(false);
      },
      error => console.log(error)
    ).getUdmeldelserAdresses(startData.mailLabel);
  }, []);
  return (
    <>
      <h1>Masseudmeldelse af medlemmer</h1>
      <Introduction />
      <UdmeldelserList
        {...startData}
        listOfMails={listOfMails}
        isLoading={
          isLoading && {
            currentProcessMessage: "Søger i emails efter udmeldelser..."
          }
        }
      ></UdmeldelserList>
    </>
  );
};
