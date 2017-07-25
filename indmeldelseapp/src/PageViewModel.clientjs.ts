declare let _: any;
namespace IndmeldelseApp {
    export class PageViewModel {

        /**
         *
         */

        constructor(
            private tableSelector: string,
            private isCallingServer = ko.observable<Boolean>(false),
            public indmeldelser = ko.observableArray([]),
            public logMessages = ko.observableArray(["Vælg en handling"])
        ) {
            this.loadIndmeldelser();
            this.hookupMessageDisplay(tableSelector);

        }
        private hookupMessageDisplay(tableSelector: string): any {
            const lastCellSelector =  "td.lastmail-status-cell";
            const messageWithContentSelector = "div.message-view.hascontent";
            const displayingClass = "is-displaying-message";

            $(tableSelector).on('mouseenter',lastCellSelector, function () {
                var $currentCell = $(this);
                var message = $currentCell.children(messageWithContentSelector);
                if (message.length == 0)
                    return;
                message.css("top","-" + (message.height()/4)+"px")
                $currentCell.addClass(displayingClass);
                message.show();
            });
            $(tableSelector).on('mouseleave', lastCellSelector, function () {
                var $currentCell = $(this);
                var message = $currentCell.children(messageWithContentSelector);
                if (message.length == 0)
                    return;                
                $currentCell.removeClass(displayingClass);
                message.hide();
            });
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
            this.logMessages.push(result.message);
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
            alert(message);
        }
        public sendInviteTestMail() {
            callGoogleApi(() => { this.logMessages.push("sendt test mail"); }, (mes) => this.defaultErrorHandler(mes)).sendInviteTestMail();
        }
        public sendConfirmationTestMail() {
            callGoogleApi(() => { this.logMessages.push("sendt test mail"); }, (mes) => this.defaultErrorHandler(mes)).sendConfirmationTestMail();
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

                let chunks = _(this.indmeldelser().slice(1)).chunk(5);
                chunks.forEach((chunk) => {
                    callGoogleApi((results) => {
                        results.forEach(result => {
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

    }
}