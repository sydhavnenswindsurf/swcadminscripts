declare module swcadmin_common{
    function moveMail(email:any,fromFolder:string,toFolder:string): any;
    function sendDocument(mailTemplate:string, memberData:any, email:string, subject:string):void;
    function getIndexOf(array:Array<any>,predicate:(item)=>{}):number;
    function convertToStringsDate(date:Date):string;
}

declare function callGoogleApi(success:(result:any)=>void,failure:(message:string)=>void):any;