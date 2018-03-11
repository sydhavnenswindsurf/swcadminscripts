function PageViewModel(){
     var self = this;
     this.hylder =  ko.observableArray([]);
     
     this.groupedHylder = ko.computed(function(){
        var result= [];
        _.forOwn(_.groupBy(this.hylder(),"container"), function(value, key) {
           result.push({groupName:key,values:value})
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
     this.openLog = function(hyldenummer:number){
         console.log(hyldenummer);return;
        callGoogleApi(function(result){          
          console.log(result);
          
      },function(message){
        console.log(message);        
      }).getHyldeLog(hyldenummer);
     }
     self.loadHylder();
  }  




