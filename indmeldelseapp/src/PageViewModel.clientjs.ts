import * as knockout from 'knockout';
export class PageViewModel{
    /**
     *
     */
    constructor() {
         this.loadIndmeldelser();

    }
     isCallingServer  = knockout.observable<Boolean>(false);
     indmeldelser = knockout.observableArray([]);    
      logMessages = knockout.observableArray(["Vælg en handling"]);
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
                item.status =knockout.observable(item.status);
                return item;
             }));
          },this.defaultErrorHandler).getUbehandledeIndmeldelser();
      
      }
      
  }
  


