var IndmeldelseApp;
(function (IndmeldelseApp) {
    var PageViewModel = /** @class */ (function () {
        /**
         *
         */
        function PageViewModel(isCallingServer, indmeldelser, logMessageHandler, logMessages) {
            if (isCallingServer === void 0) { isCallingServer = ko.observable(false); }
            if (indmeldelser === void 0) { indmeldelser = ko.observableArray([]); }
            if (logMessageHandler === void 0) { logMessageHandler = new LogMessageHandler(); }
            if (logMessages === void 0) { logMessages = logMessageHandler.logMessages; }
            this.isCallingServer = isCallingServer;
            this.indmeldelser = indmeldelser;
            this.logMessageHandler = logMessageHandler;
            this.logMessages = logMessages;
            this.loadIndmeldelser();
            console.log("is mobile: " + this.isMobile());
        }
        PageViewModel.prototype.isMobile = function () {
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
                return true;
            return false;
        };
        PageViewModel.prototype.indmeld = function (email) {
            var _this = this;
            this.isCallingServer(true);
            callGoogleApi(function (result) {
                return _this.feedBack(email, result);
            }, function (mes) { return _this.defaultErrorHandler(mes); })
                .indmeld(email);
        };
        PageViewModel.prototype.feedBack = function (email, result) {
            this.isCallingServer(false);
            if (result.success) {
                $.each(this.indmeldelser().filter(function (item) { return item.email === email; }), function (index, item) {
                    item.status(result.newStatus);
                });
            }
            this.logMessageHandler.addMessage(result.message);
        };
        PageViewModel.prototype.sendVelkomstMail = function (email) {
            var _this = this;
            this.isCallingServer(true);
            callGoogleApi(function (result) { _this.feedBack(email, result); }, function (mes) { return _this.defaultErrorHandler(mes); })
                .sendVelkomstMail(email);
        };
        PageViewModel.prototype.afvis = function (email) {
            var _this = this;
            this.isCallingServer(true);
            callGoogleApi(function (result) { _this.feedBack(email, result); }, function (mes) { return _this.defaultErrorHandler(mes); })
                .afvis(email);
        };
        PageViewModel.prototype.defaultErrorHandler = function (message) {
            this.isCallingServer(false);
            console.log(message);
            //alert(message);
            this.logMessageHandler.addMessage(message);
        };
        PageViewModel.prototype.sendInviteTestMail = function () {
            var _this = this;
            callGoogleApi(function () { _this.logMessageHandler.addMessage("sendt test mail"); }, function (mes) { return _this.defaultErrorHandler(mes); }).sendInviteTestMail();
        };
        PageViewModel.prototype.sendConfirmationTestMail = function () {
            var _this = this;
            callGoogleApi(function () { _this.logMessageHandler.addMessage("sendt test mail"); }, function (mes) { return _this.defaultErrorHandler(mes); }).sendConfirmationTestMail();
        };
        PageViewModel.prototype.getLatestMailDisplay = function (sidsteMailObject) {
            if (sidsteMailObject === "henter..." || sidsteMailObject === "Seneste mailsvar")
                return sidsteMailObject;
            return sidsteMailObject.lastMailDate || "ingen mail";
        };
        PageViewModel.prototype.loadIndmeldelser = function () {
            var _this = this;
            callGoogleApi(function (result) {
                _this.indmeldelser(result.map(function (item) {
                    item.status = ko.observable(item.status);
                    item.sidsteMail = ko.observable(item.sidsteMail);
                    return item;
                }));
                var chunks = _(_this.indmeldelser().slice(1)).chunk(10); //der er kvote på hvor man gange man må kalde gmail api (for mail svar).
                chunks.forEach(function (chunk) {
                    callGoogleApi(function (results) {
                        results.forEach(function (result) {
                            if (result.mailId !== undefined)
                                _this.setMailUrl(result);
                            _this.indmeldelser()
                                .filter(function (i) {
                                return i.email === result.email;
                            }).forEach(function (i) {
                                i.sidsteMail(result);
                            });
                        });
                    }, function (mes) { return _this.defaultErrorHandler(mes); })
                        .getLatestMails(chunk.map(function (e) { return e.email; }));
                });
            }, function (mes) { return _this.defaultErrorHandler(mes); }).getUbehandledeIndmeldelser();
        };
        PageViewModel.prototype.setMailUrl = function (latestMailResult) {
            if (this.isMobile()) {
                //if no labels
                var threadPrefix = "priority/%5Esmartlabel_personal";
                //if label we need to show with some label in url
                if (latestMailResult.labels.length > 0)
                    threadPrefix = latestMailResult.labels[0].replace(/\/| /g, '-');
                latestMailResult.mailUrl = "https://mail.google.com/mail/mu/mp/831/#cv/" + threadPrefix + "/" + latestMailResult.mailId;
            }
            else {
                latestMailResult.mailUrl = "https://mail.google.com/mail/u/0/#inbox/" + latestMailResult.mailId;
            }
        };
        return PageViewModel;
    }());
    IndmeldelseApp.PageViewModel = PageViewModel;
    var GuiEnhancements = /** @class */ (function () {
        function GuiEnhancements(tableSelector) {
            this.tableSelector = tableSelector;
            this.hookupMessageDisplay(tableSelector);
        }
        GuiEnhancements.prototype.hookupMessageDisplay = function (tableSelector) {
            var lastCellSelector = "td.lastmail-status-cell";
            var messageWithContentSelector = "div.message-view.hascontent";
            $(tableSelector).on('mouseenter', lastCellSelector, function () {
                var $currentCell = $(this);
                var message = $currentCell.children(messageWithContentSelector);
                if (message.length == 0)
                    return;
                //Calculate placement
                message.css("top", "-" + (message.height() / 4) + "px");
                message.fadeIn();
            });
            $(tableSelector).on('mouseleave', lastCellSelector, function () {
                $(this).children(messageWithContentSelector).fadeOut();
            });
        };
        return GuiEnhancements;
    }());
    IndmeldelseApp.GuiEnhancements = GuiEnhancements;
    var LogMessageHandler = /** @class */ (function () {
        function LogMessageHandler(logMessages) {
            if (logMessages === void 0) { logMessages = ko.observableArray([]); }
            this.logMessages = logMessages;
        }
        LogMessageHandler.prototype.showMessage = function (elem) {
            if (elem.nodeType === 1)
                $(elem).fadeIn(1000);
        };
        LogMessageHandler.prototype.hideMessage = function (elem) {
            if (elem.nodeType === 1)
                $(elem).fadeOut(1000);
        };
        LogMessageHandler.prototype.addMessage = function (message) {
            var _this = this;
            var logMessage = {
                id: Math.random(),
                message: message
            };
            this.logMessages.push(logMessage);
            console.log("added logmessage: " + logMessage.id + ", " + logMessage.message);
            setTimeout(function () {
                var logMessage = _this.logMessages.shift();
                console.log("removed logmessage: " + logMessage.id + ", " + logMessage.message);
            }, 10000);
        };
        return LogMessageHandler;
    }());
    IndmeldelseApp.LogMessageHandler = LogMessageHandler;
})(IndmeldelseApp || (IndmeldelseApp = {}));
