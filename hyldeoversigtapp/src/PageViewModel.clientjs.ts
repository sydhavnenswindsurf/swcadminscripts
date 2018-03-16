import * as lodash from 'lodash';
declare let _:lodash.PH;
namespace Hyldeoversigt{
    export class PageViewModel{
    
        constructor() {
         this.loadHylder();
         this.loadHyldeLog();
        }
         private hylder =  ko.observableArray([]);
        
         private hyldeLog: KnockoutObservable<{
            hyldenr:string;
            handling:string;
            navn:string;
            medlemsnummer:number;
            dato:string; 
            datetime:string;
         }[]> = ko.observable([]);

         private groupedHylder = ko.computed(()=>{
            var result= [];
            _.forOwn(_.groupBy(this.hylder(),"container"), (value, key) =>{
               result.push({
                   groupName:key,
                   values:value.map(item=>{
                        item.showLog = ko.observable(false);
                        item.log= ko.computed(()=>{
                            return _(this.hyldeLog())
                            .filter(log=>log.hyldenr === item.hyldenr)
                            .orderBy(item=>new Date(item.datetime),"desc")
                            .value()
                        });
                        return item;
                   })
                })
             });
            return result;
         
         },this);
    
         private isCallingServer = ko.observable(false);
         
         closeAnyLogs = ()=>{
            this.getAllHyldeItems().forEach(item=>item.showLog(false));
         }
         loadHylder = () => {
              this.isCallingServer(true);
              callGoogleApi((result)=>{    
             
              this.updateHylder(result);
              this.isCallingServer(false);
              }, (error)=>console.log(error)).loadHylder();
         }
         updateHylder = (result) => {
             this.hylder(result.map((item)=>
             {
                item.newOwner = ko.observable("");
                item.navn = ko.observable(item.navn);
                item.email = ko.observable(item.email);
                return item;
             }));
         }
         remove = (hyldeInfo)=>{
              if(!confirm("Dette fjerner personen fra hylden?")){
                  return;
              }
              this.isCallingServer(true);

              const hyldeItem = ko.mapping.toJS(hyldeInfo);
              console.log(hyldeItem);
              callGoogleApi((result)=>{         
              
                  this.updateHylder(result);
                  this.isCallingServer(false);
                  this.loadHyldeLog();
              }, (message)=>{
              
                this.isCallingServer(false);
                alert(message);
                
              }).remove(hyldeItem);
         }
         add = (hyldeInfo)=>{
              if(hyldeInfo.newOwner()===''){
                  alert("Du skal udfylde med et medlems email adreese");
                  return;
              }
              
              this.isCallingServer(true);
              callGoogleApi((result)=>{
              
                  console.log(result);
                  hyldeInfo.navn(result.newlyAddedNavn);
                  hyldeInfo.email(hyldeInfo.newOwner());
                  this.isCallingServer(false);
                  this.loadHyldeLog();
              },(message)=>{
                console.log(message);
                this.isCallingServer(false);
                alert("Kunne ikke tilføje medlem: \n" + message);
                
              })
              .add({newOwner:hyldeInfo.newOwner(), hyldenr:hyldeInfo.hyldenr});
         }

         getAllHyldeItems=()=>{
            return _.flatten(this.groupedHylder().map(g=>g.values));             
         }
         openLog = (hyldeItem:{
             hyldenr:number;
             showLog:KnockoutObservable<boolean>;
             log:KnockoutObservable<{
                handling:string;
                navn:string;
                medlemsnummer:number;
                dato;            
             }[]>;
         })=>{
    
            hyldeItem.showLog(true);
            console.log(hyldeItem.hyldenr);
         }
         loadHyldeLog = () => {
            callGoogleApi((result :{ 
                hyldenr: string;
                handling: string;
                medlemsnummer:number;
                navn: string;
                datetime:string; 
            }[])=>{    
                this.hyldeLog(result.map(item=>{
                    // add date information client side (gapps serverside doesnt like Date object)
                    const dateObject= new Date(item.datetime);
                    return {
                        ...item, 
                        dato:dateObject.toLocaleDateString()
                    };
                }));
            },(error)=> {
                console.log(error);
            })
            .getHyldeLog();
         }
      }  

      export class GuiEnhancments{
          constructor(
              private logPopupSelector:string, 
              private viewModel: PageViewModel
            ) {
            $(document).on('mouseup touchend', (e)=> 
            {
                var container = $(logPopupSelector);
            
                // if the target of the click isn't the container nor a descendant of the container
                if (!container.is(e.target) && container.has(e.target).length === 0) 
                {
                    this.viewModel.closeAnyLogs();
                }
            });
          }
      }
}