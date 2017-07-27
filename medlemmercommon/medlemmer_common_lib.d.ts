declare module 'medlemmer_common'{
     
    export interface medlemmer_common{
        INDMELDELSESDATO_COLUMNID:number;
        UDMELDT_COLUMN_ID:number;
        UDMELDELSES_COLUMNHEADER:string;
        getMedlemmerStamdata(): any;
        getMedlemmerSheet(): any;
        update(updateMedlem: any): void;
        addStamdataForMedlem(email: any, stamDataForMedlem: any): void;
        getNytMedlemsnummer(): any;
        erUdmeldt(email: any, stamdata: any): boolean;
        erMedlem(email: any, stamdata: any): boolean;
        getMedlemsNummmer(email: any, stamdata: any): any;
        harHylde(email: any): boolean;
        setUdmeldtStatus(email: any): void;
        erUdmeldt(email: any): boolean;
    }
}