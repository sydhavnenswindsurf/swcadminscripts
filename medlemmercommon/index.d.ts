declare module medlemmer_common {
  function getMedlemmerSheet(): GoogleAppsScript.Spreadsheet.Sheet;
  var INDMELDELSESDATO_COLUMNID: number;
  var UDMELDT_COLUMN_ID: number;
  var UDMELDELSES_COLUMNHEADER: string;
  function getMedlemmerStamdata(): Object[][];
  function getMedlemmerSheet(): any;
  function update(updateMedlem: any): void;
  function addStamdataForMedlem(email: any, stamDataForMedlem: any): void;
  function getNytMedlemsnummer(): any;
  function erUdmeldt(email: any, stamdata: any): boolean;
  function erMedlem(email: any, stamdata: any): boolean;
  function getMedlemsNummmer(email: any, stamdata: Object[][]): any;
  function harHylde(email: any): boolean;
  function setUdmeldtStatus(email: any): void;
  function erUdmeldt(email: any): boolean;
}
