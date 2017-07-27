declare module 'medlemmer_common'{
    var INDMELDELSESDATO_COLUMNID:number;
    function getMedlemmerStamdata(): any;
    function getMedlemmerSheet(): any;
    function update(updateMedlem: any): void;
    function addStamdataForMedlem(email: any, stamDataForMedlem: any): void;
    function getNytMedlemsnummer(): any;
    function erUdmeldt(email: any, stamdata: any): boolean;
    function erMedlem(email: any, stamdata: any): boolean;
    function getMedlemsNummmer(email: any, stamdata: any): any;
    function harHylde(email: any): boolean;
    function setUdmeldtStatus(email: any): void;
    function erUdmeldt(email: any): boolean;

}