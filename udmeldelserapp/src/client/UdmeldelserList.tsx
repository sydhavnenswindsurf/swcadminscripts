import React from "react";
import Button from "@material-ui/core/Button";
import { EmailInfo } from "../server/types";
import CircularProgress from "@material-ui/core/CircularProgress";

export interface UdmeldelserListProps {
  mailLabel: string | undefined;
  listOfMails: EmailInfo[];
  udmeldtMessages: string[];
  notFoundMessages: string[];
  isLoading?: { currentProcessMessage: string };
  bulkUdmeld: () => void;
  disableUdmeldButton: boolean;
  errorMessages: string[];
}
export const UdmeldelserList: React.FC<UdmeldelserListProps> = ({
  mailLabel,
  listOfMails,
  udmeldtMessages,
  notFoundMessages,
  isLoading,
  bulkUdmeld,
  disableUdmeldButton,
  errorMessages
}) => {
  return (
    <>
      <section id="bulkudmeld-funktion">
        {mailLabel && (
          <div>
            Kunne ikke lede efter udmeldelser, fordi den konfigurede mail label:{" "}
            {mailLabel} findes ikke.
          </div>
        )}
        {listOfMails.length === 0 && (
          <div>
            Der ikke er fundet nogen mails til behandling i folderen{" "}
            <strong> {mailLabel} </strong>. Flyt udmeldelses mails til den
            folder, og reload siden for at foretage masseudmeldelse.
          </div>
        )}
        <section id="logmessages">
          <div style={{ color: "green" }}>
            {udmeldtMessages.map(i => (
              <div key={i}>{i}</div>
            ))}
          </div>
          <div style={{ color: "yellow" }}>
            {notFoundMessages.map(i => (
              <div key={i}>{i}</div>
            ))}
          </div>
          <div style={{ color: "red" }}>
            {errorMessages.map(i => (
              <div key={i}>{i}</div>
            ))}
          </div>
          {notFoundMessages.length > 0 && renderGuide()}
        </section>
        {isLoading && (
          <>
            <CircularProgress size={15} />{" "}
            <span>{isLoading.currentProcessMessage}</span>
          </>
        )}
        {listOfMails.length > 0 && (
          <>
            <div>
              Har fundet følgende mails i folderen <strong>{mailLabel}</strong>{" "}
              som har angivet at de ønsker udmeldelser
            </div>

            <div>
              <Button
                disabled={disableUdmeldButton}
                color="primary"
                onClick={e => bulkUdmeld()}
              >
                Klik her
              </Button>{" "}
              hvis du ønsker at markere dem alle som udmeldt.
            </div>

            <ul>
              {listOfMails.map(i => (
                <li key={`${i.name}+${i.email}`}>
                  {i.name} - {i.email}{" "}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  );
};

const renderGuide = () => (
  <div>
    Der kan være flere årsager til at visse medlemmer ikke kan udmeldes, måske
    er de registreret med en anden mailadresse. Eller også har de aldrig været
    registreret korrekt. Du kan melde dem ud manuelt via siden her:
    <a
      href="https://sites.google.com/site/swcmedlemoghylder/medlemmer/indmeldte"
      target="_blank"
    >
      medlemmer
    </a>
    <p>
      Når du er færdig kan du evt. flytte deres{" "}
      <a
        target="_blank"
        href="https://mail.google.com/mail/u/0/#label/SWC+Admin%2FUdmeldelser"
      >
        udmeldelses mails
      </a>{" "}
      over i{" "}
      <a
        href="https://mail.google.com/mail/u/0/#label/SWC+Admin%2FUdmeldelser%2FProcesseret"
        target="_blank"
      >
        /processeret
      </a>{" "}
      folderen. På den måde forsvinder de fra listen her.
    </p>
  </div>
);
