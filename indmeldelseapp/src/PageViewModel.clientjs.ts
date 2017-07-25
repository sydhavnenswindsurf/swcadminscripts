/// <reference path="../../index.d.ts" />
namespace IndmeldelseApp{
    export class PageViewModel{
        /**
         *
         */
       
        constructor(
            private isCallingServer  = ko.observable<Boolean>(false),
            public indmeldelser = ko.observableArray([]),
            public logMessages = ko.observableArray(["Vælg en handling"])
        ) {
            this.loadIndmeldelser();

        }
      
        public  indmeld (email:string){
            this.isCallingServer(true);
            callGoogleApi((result)=> 
            this.feedBack(email,result), this.defaultErrorHandler)
            .indmeld(email);
        }
        private feedBack(email:string,result:any){
            this.isCallingServer(false);
            if(result.success){ 
                $.each(this.indmeldelser().filter(function(item){return item.email===email;}),function(index,item){
                        item.status(result.newStatus);
                
                });
            }
            this.logMessages.push(result.message);
        }      
        
        public sendVelkomstMail (email){
                this.isCallingServer(true);
                callGoogleApi((result)=> { this.feedBack(email,result); },this.defaultErrorHandler)
                .sendVelkomstMail(email);

        }
        public afvis (email){
                this.isCallingServer(true);
                callGoogleApi((result)=>{ this.feedBack(email,result);},this.defaultErrorHandler)
                .afvis(email);

        }
        
        private defaultErrorHandler (message:string){
            this.isCallingServer(false);
            console.log(message);
            alert(message);
        }
        public sendInviteTestMail(){
            callGoogleApi(()=>{this.logMessages.push("sendt test mail");},this.defaultErrorHandler).sendInviteTestMail();
        }
        public sendConfirmationTestMail (){
            callGoogleApi(()=>{this.logMessages.push("sendt test mail");},this.defaultErrorHandler).sendConfirmationTestMail();
        }
        
        private loadIndmeldelser (){
            callGoogleApi((result)=>{
                 this.indmeldelser(result.map((item)=>{
                    item.status =ko.observable(item.status);
                    return item;
                })); 
            },(e)=>this.defaultErrorHandler(e)).getUbehandledeIndmeldelser();
        
        }
        
    }
}