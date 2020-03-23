import React from "react";

export const Introduction: React.FC = () => (
  <>
    Denne funktion hjælper med automatisk at udmelde flere medlemmer af gangen.
    Ved kontingentsvar/rykkere er der ofter en del der skriver tilbage, at de
    ikke ønsker at være medlem. For at lette det arbejde, kan man vælge at
    flytte de mails ind i folderen{" "}
    <a
      target="_blank"
      href="https://mail.google.com/mail/u/0/#label/SWC+Admin%2FUdmeldelser"
    >
      SWC Admin/Udmeldelser
    </a>{" "}
    i klubbens gmail. Denne side læser så email adresserne derfra, og lister dem
    her. Man kan så klikke på knappen nedenfor og herved sættes udmeldte flaget
    til, og mailen flytte til en underfolder{" "}
    <a
      href="https://mail.google.com/mail/u/0/#label/SWC+Admin%2FUdmeldelser%2FProcesseret"
      target="_blank"
    >
      /processeret
    </a>
    .
    <p>
      Bemærk at du også kan udmelde medlemmer manuelt her:{" "}
      <a
        href="https://sites.google.com/site/swcmedlemoghylder/medlemmer/indmeldte"
        target="_blank"
      >
        medlemmer
      </a>
    </p>
  </>
);
