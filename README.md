# swcadminscripts
Anvender node modulet her: 
https://www.npmjs.com/package/node-google-apps-script
til at synce ændringer til google apps
Installér globally:

    npm install -g node-google-apps-script

Sitet der er kodet findes her:
https://sites.google.com/site/swcmedlemoghylder/

For at starte med at udvikle (efter standard clone og npm install):

1. download gapps auth json file til 'credentials' folder i roden af projektet
2. foretag grund authenticering one-time ved at køre:

    npm run gapps-auth

3. initialiser hvert enkelt projekt du vil arbejde med ved at gå til folder og skriv

    gapps init [scriptid]


Følgende apps er på regular konto (pga problemer der var mistet adgang til data kontoen):

- hyldevenliste
- kontigentrapport
- indmeldelse

Resten er på data kontoen stadigvæk