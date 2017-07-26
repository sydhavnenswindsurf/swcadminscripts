import * as lodash from 'lodash';
declare let _:lodash.PH;
namespace IndmeldelseApp {
    export class PageViewModel {

        /**
         *
         */
        constructor(
            private isCallingServer = ko.observable<Boolean>(false),
            public indmeldelser = ko.observableArray([]),
            public logMessageHandler:LogMessageHandler =new LogMessageHandler(),
            public logMessages=logMessageHandler.logMessages        
        ) {
            this.loadIndmeldelser();

            console.log("is mobile: " +this.isMobile());
           
        }
        private isMobile():boolean{
            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) 
                return true;
            return false;
        }
        public indmeld(email: string) {
            this.isCallingServer(true);
            callGoogleApi((result) =>
                this.feedBack(email, result), (mes) => this.defaultErrorHandler(mes))
                .indmeld(email);
        }
        private feedBack(email: string, result: any) {
            this.isCallingServer(false);
            if (result.success) {
                $.each(this.indmeldelser().filter(function (item) { return item.email === email; }), function (index, item) {
                    item.status(result.newStatus);

                });
            }
            this.logMessageHandler.addMessage(result.message);
        }

        public sendVelkomstMail(email) {
            this.isCallingServer(true);
            callGoogleApi((result) => { this.feedBack(email, result); }, (mes) => this.defaultErrorHandler(mes))
                .sendVelkomstMail(email);

        }
        public afvis(email) {
            this.isCallingServer(true);
            callGoogleApi((result) => { this.feedBack(email, result); }, (mes) => this.defaultErrorHandler(mes))
                .afvis(email);

        }

        private defaultErrorHandler(message: string) {
            this.isCallingServer(false);
            console.log(message);
            //alert(message);
            this.logMessageHandler.addMessage(message);
        }
        public sendInviteTestMail() {
            callGoogleApi(() => { this.logMessageHandler.addMessage("sendt test mail"); }, (mes) => this.defaultErrorHandler(mes)).sendInviteTestMail();
        }
        public sendConfirmationTestMail() {
            callGoogleApi(() => { this.logMessageHandler.addMessage("sendt test mail"); }, (mes) => this.defaultErrorHandler(mes)).sendConfirmationTestMail();
        }
        public getLatestMailDisplay(sidsteMailObject) {
            if (sidsteMailObject === "henter..." || sidsteMailObject === "Seneste mailsvar")
                return sidsteMailObject;
            return sidsteMailObject.lastMailDate || "ingen mail";
        }
        private loadIndmeldelser() {
            callGoogleApi((result) => {
                this.indmeldelser(result.map((item) => {
                    item.status = ko.observable(item.status);
                    item.sidsteMail = ko.observable(item.sidsteMail)
                    return item;
                }));

                let chunks = _(this.indmeldelser().slice(1)).chunk(10);//der er kvote på hvor man gange man må kalde gmail api (for mail svar).
                chunks.forEach((chunk) => {
                    callGoogleApi((results) => {                        
                        results.forEach(result => {
                            if(result.mailId !== undefined)
                                this.setMailUrl(result);                            
                            this.indmeldelser()
                                .filter((i) => {
                                    return i.email === result.email;
                                }).forEach(i => {
                                    i.sidsteMail(result);
                                });
                        });

                    }, (mes) => this.defaultErrorHandler(mes))
                        .getLatestMails(chunk.map((e) => e.email));
                });


            }, (mes) => this.defaultErrorHandler(mes)).getUbehandledeIndmeldelser();
        }
        private setMailUrl(latestMailResult:any){

            if(this.isMobile()){
                //if no labels
                var threadPrefix = "priority/%5Esmartlabel_personal"
                //if label we need to show with some label in url
                if(latestMailResult.labels.length>0)
                    threadPrefix =latestMailResult.labels[0].replace(/\/| /g, '-');
                    
                latestMailResult.mailUrl = "https://mail.google.com/mail/mu/mp/831/#cv/"+ threadPrefix +"/" + latestMailResult.mailId 
            }else{
                     latestMailResult.mailUrl = "https://mail.google.com/mail/u/0/#inbox/" + latestMailResult.mailId;
            }
        }
    }

    export class GuiEnhancements{
        constructor(private tableSelector: string){
            this.hookupMessageDisplay(tableSelector);
        }
         private hookupMessageDisplay(tableSelector: string): any {
            const lastCellSelector =  "td.lastmail-status-cell";
            const messageWithContentSelector = "div.message-view.hascontent";

            $(tableSelector).on('mouseenter',lastCellSelector, function () {
                var $currentCell = $(this);
                var message = $currentCell.children(messageWithContentSelector);
                if (message.length == 0)
                    return;
                //Calculate placement
                message.css("top","-" + (message.height()/4)+"px")
                message.fadeIn();
            });
            $(tableSelector).on('mouseleave', lastCellSelector, function () {
                $(this).children(messageWithContentSelector).fadeOut();
            });
        }
    }

    export class LogMessageHandler{
        constructor(
            public logMessages = ko.observableArray([])
            
        ){

        } 
         public showMessage (elem) {              
             if (elem.nodeType === 1) $(elem).fadeIn(1000);
         }
         public hideMessage (elem) { 
             if (elem.nodeType === 1) $(elem).fadeOut(1000);         
         }

         public addMessage(message:string){
            const logMessage = {
                id:Math.random(),
                message:message
            };
            this.logMessages.push(logMessage);
            console.log("added logmessage: " + logMessage.id+", " +logMessage.message);
            setTimeout(()=>{               
                let logMessage= this.logMessages.shift();
                 console.log("removed logmessage: " + logMessage.id+", " +logMessage.message);
            },10000);
         }
    }
}