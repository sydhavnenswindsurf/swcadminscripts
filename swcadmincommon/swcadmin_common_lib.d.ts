declare module swcadmin_common{
    function moveMail(email:any,fromFolder:string,toFolder:string): any;
    function sendDocument(mailTemplate:string, memberData:{
        email:string,
        fornavn: string,
        efternavn: string
    }, email:string, subject:string):void;
 
}

declare function callGoogleApi(success:(result:any)=>void,failure:(message:string)=>void):any;