import { UdmeldelserList, UdmeldelserListProps } from "./UdmeldelserList";
import * as React from "react";
import Button from "@material-ui/core/Button";
import { Introduction } from "./Introduction";
import { useEffect, useState, useReducer } from "react";
import { callGoogleApi } from "../../../.shared/api";
import { EmailInfo, UdmeldtResult } from "../server/types";
import { AppState, AppReducer } from "./appState";

const startData: AppState = {
  usersToProcess: [],
  currentUserBeingUdmeldt: null,
  mailLabel: "SWC Admin/Udmeldelser",
  listOfMails: [],
  udmeldtMessages: [],
  notFoundMessages: [],
  errorMessages: [],
  processingMessage: "Søger i emails efter udmeldelser..."
};

export const App = () => {
  const [appState, dispatch] = useReducer(AppReducer, startData);
  useEffect(() => {
    callGoogleApi(
      (listOfMails: EmailInfo[]) => {
        dispatch({ type: "UDMELDELSER_LOADED", listOfMails });
      },
      error => console.log(error)
    ).getUdmeldelserAdresses(startData.mailLabel);
  }, []);

  useEffect(() => {
    if (appState.currentUserBeingUdmeldt === null) return;
    callGoogleApi(
      (result: UdmeldtResult) => {
        dispatch({ type: "UDMELDRESULT_RECIEVED", result });
      },
      error => dispatch({ type: "UDMELDRESULT_RECIEVED", error })
    ).udmeld(appState.currentUserBeingUdmeldt);
  }, [appState.currentUserBeingUdmeldt]);

  const bulkUdmeld = () => {
    dispatch({ type: "BEGIN_UDMELD", email: appState.listOfMails[0].email }); // TODO: use medlemid
  };

  const { listOfMails, processingMessage, usersToProcess } = appState;
  return (
    <>
      <h1>Masseudmeldelse af medlemmer</h1>
      <Introduction />
      <UdmeldelserList
        {...appState}
        listOfMails={listOfMails}
        isLoading={
          processingMessage && {
            currentProcessMessage: processingMessage
          }
        }
        bulkUdmeld={bulkUdmeld}
        disableUdmeldButton={usersToProcess.length === 0}
      ></UdmeldelserList>
    </>
  );
};
