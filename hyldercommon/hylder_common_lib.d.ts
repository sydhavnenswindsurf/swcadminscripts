declare module hylder_common{
    var HYLDESHEET_ID: string;
    var HYLDESHEET_NAME: string;
    var HYLDE_CONTAINER_COLUMN: number;
    var RESERVERETHYLDER_ID:string;
    var RESERVERETHYLDER_SHEET:string;
    function getReservedHylderInfo(): any;
    function getReservedHylderData(): any;
    function getHyldeInfo(): any;
    function getHyldeSheet(): any;
    function getHyldeDataValues(): any;
    function addHylde(hyldenr: any, email: any, stamdata: any): void;
    function getHyldeLog():object[][];
    function addHyldeLogEvent(logEvent:{
        hyldenr: string;
        handling:string;
        navn:string;
        medlemsNummer:number;
      });
}

