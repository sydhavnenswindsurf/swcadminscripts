import { EmailInfo, UdmeldtResult } from "../server/types";

export type AppState = {
  usersToProcess: string[];
  currentUserBeingUdmeldt?: string;
  mailLabel: string;
  listOfMails: EmailInfo[];
  udmeldtMessages: string[];
  notFoundMessages: string[];
  processingMessage?: string;
  errorMessages: string[];
};

export type PayloadLessAction = {
  type: "UDMELDRESULT_NOTFOUND";
};

type Udmeld = {
  type: "BEGIN_UDMELD";
  email: string;
};

type UdmeldelserLoaded = {
  type: "UDMELDELSER_LOADED";
  listOfMails: EmailInfo[];
};
type UdmeldelseResultRecieved = {
  type: "UDMELDRESULT_RECIEVED";
  result?: UdmeldtResult;
  error?: string;
};
type AppActions =
  | PayloadLessAction
  | Udmeld
  | UdmeldelserLoaded
  | UdmeldelseResultRecieved;

export const AppReducer = (state: AppState, action: AppActions): AppState => {
  switch (action.type) {
    case "UDMELDELSER_LOADED":
      const { listOfMails } = action;
      return {
        ...state,
        listOfMails,
        // TODO: use id instead
        usersToProcess: listOfMails.map(i => i.email),
        processingMessage: null
      };
    case "BEGIN_UDMELD":
      return {
        ...state,
        notFoundMessages: [],
        udmeldtMessages: [],
        processingMessage: getUdmelderProcessingMessage(action.email),
        currentUserBeingUdmeldt: action.email
      };
    case "UDMELDRESULT_RECIEVED":
      return udmeldelseResultReducer(state, action);
  }
  return state;
};

const udmeldelseResultReducer = (
  state: AppState,
  result: UdmeldelseResultRecieved
): AppState => {
  const errorMessages = result.error
    ? [
        ...state.errorMessages,
        `Der skete en fejl under udmeldelsen af ${state.currentUserBeingUdmeldt}: ${result.error}`
      ]
    : state.errorMessages;

  // Remove current user from processing
  const usersToProcess = state.usersToProcess.filter(
    i => i !== state.currentUserBeingUdmeldt
  );

  // Decide if there is a next user to process
  const currentUserBeingUdmeldt =
    usersToProcess.length > 0 ? usersToProcess[0] : null;

  const processingMessage =
    currentUserBeingUdmeldt === null
      ? ""
      : getUdmelderProcessingMessage(currentUserBeingUdmeldt);

  const { udmeldt, notFound, email } = result.result || {};
  const udmeldtMessages = udmeldt
    ? [
        ...state.udmeldtMessages,
        "Har nu markeret følgende som udmeldt: " + email
      ]
    : state.udmeldtMessages;

  const notFoundMessages = notFound
    ? [
        ...state.notFoundMessages,
        "Kunne ikke finde adressen på medlemmet: " + email
      ]
    : state.notFoundMessages;

  return {
    ...state,
    usersToProcess,
    currentUserBeingUdmeldt,
    processingMessage,
    udmeldtMessages,
    notFoundMessages,
    errorMessages
  };
};
function getUdmelderProcessingMessage(email: string): string {
  return `Udmelder ${email}...`;
}
