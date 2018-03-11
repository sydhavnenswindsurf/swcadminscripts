function PageViewModel(){
     var self = this;
     this.hylder =  ko.observableArray([]);
     
     this.groupedHylder = ko.computed(function(){
        var result= [];
        _.forOwn(_.groupBy(this.hylder(),"container"), function(value, key) {
           result.push({
               groupName:key,
               values:value.map(item=>{
                    item.showLog = ko.observable(false);
                    item.loadingLog = ko.observable(false);
                    item.log= ko.observable();
                    return item;
               })
            })
         });
        return result;
     
     },this);
     this.isCallingServer= ko.observable(false);
     this.loadHylder =function(){
          this.isCallingServer(true);
          callGoogleApi(function(result){    
         
          self.updateHylder(result);
          self.isCallingServer(false);
          }, (error)=>console.log(error)).loadHylder();
     }
     this.updateHylder = function (result){
         self.hylder(result.map(function(item)
         {
            item.newOwner = ko.observable("");
            item.navn = ko.observable(item.navn);
            return item;
         }));
     }
     this.remove = function(hyldeInfo){
          if(!confirm("Dette fjerner personen fra hylden?")){
              return;
          }
          this.isCallingServer(true);
          var dataToSend=ko.mapping.toJS(hyldeInfo);
          console.log(dataToSend);
          callGoogleApi(function(result){         
          
              self.updateHylder(result);
              self.isCallingServer(false);
          
          }, function(message){
          
            self.isCallingServer(false);
            alert(message);
            
          }).remove(dataToSend);
     }
     this.add = function(hyldeInfo){
          if(hyldeInfo.newOwner()===''){
              alert("Du skal udfylde med et medlems email adreese");
              return;
          }
          
          this.isCallingServer(true);
          callGoogleApi(function(result){
          
              console.log(result);
              hyldeInfo.navn(result.newlyAddedNavn);
              self.isCallingServer(false);
              
          },function(message){
            console.log(message);
            self.isCallingServer(false);
            alert("Kunne ikke tilføje medlem: \n" + message);
            
          })
          .add({newOwner:hyldeInfo.newOwner(), hyldenr:hyldeInfo.hyldenr});
     }
     this.openLog = (hyldeItem:{
         hyldenr:number;
         showLog:KnockoutObservable<boolean>;
         loadingLog:KnockoutObservable<boolean>;
         log:KnockoutObservable<{
            handling:string;
            navn:string;
            medlemsnummer:number;
            dato;            
         }[]>;
     })=>{
         var isShowingAlready = hyldeItem.showLog();
        // hide all others
        self.groupedHylder().forEach(group=>group.values.forEach(item=>item.showLog(false)));
        // toggle current
         if(isShowingAlready)
         {
             // we just hid it and it was showing so we return...
             return;
         }

        hyldeItem.showLog(true);
        hyldeItem.loadingLog(true);
        console.log(hyldeItem.hyldenr);
        callGoogleApi((result :{ 
            hyldenr: number;
            handling: string;
            medlemsnummer:number;
            navn: string;
            datetime:string; 
        }[])=>{          
            hyldeItem.loadingLog(false);
            hyldeItem.log(result.map(event=>{
                return {
                    handling:event.handling,
                    navn:event.navn,
                    medlemsnummer:event.medlemsnummer,
                    dato:event.datetime,
                };
            }));
        },(message)=>{
            hyldeItem.loadingLog(false);
            console.log(message);     
        }).getHyldeLog(hyldeItem.hyldenr);
     }
     self.loadHylder();
  }  
// export class GuiEnhancements{
//     constructor(private logButtonSelector: string){
//         this.hookupMessageDisplay(logButtonSelector);
//     }
//      private hookupMessageDisplay(tableSelector: string): any {
//         const lastCellSelector =  "td.lastmail-status-cell";
//         const messageWithContentSelector = "div.message-view.hascontent";

//         $(tableSelector).on('mouseenter',lastCellSelector, function () {
//             var $currentCell = $(this);
//             var message = $currentCell.children(messageWithContentSelector);
//             if (message.length === 0)
//                 return;
//             //Calculate placement
//             message.css("top","-" + (message.height()/4)+"px")
//             message.fadeIn();
//         });
//         $(tableSelector).on('mouseleave', lastCellSelector, function () {
//             $(this).children(messageWithContentSelector).fadeOut();
//         });
//     }
// }




