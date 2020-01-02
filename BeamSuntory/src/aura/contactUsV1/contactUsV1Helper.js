({
    createCase : function(component, event, isComplaint) {
        if(isComplaint && component.find("attachment").get("v.files").length > 0){
            var file = component.find("attachment").get("v.files")[0];
            var self = this;
            
            var objFileReader = new FileReader();
            objFileReader.onload = $A.getCallback(function() {
                var fileContents = objFileReader.result;
                var base64 = 'base64,';
                var dataStart = fileContents.indexOf(base64) + base64.length;                
                fileContents = fileContents.substring(dataStart);
                self.createNewCase(component, file, fileContents);
            });
            objFileReader.readAsDataURL(file);
        } else {
            this.createNewCase(component, null, null);
        }
    },
    createNewCase: function(component, file, fileContents) {
        var action = component.get("c.createCase");
        action.setParams({
            "caseObj": component.get("v.newCase"), 
            fileName: file ? file.name : '',
            base64Data: fileContents,
            contentType: file ? file.type : '',
            brand: component.get("v.brand"),
            reCaptchaResponse: component.get("v.reCaptchaToken")
        });
        
        // set call back 
        action.setCallback(this, function(response) {
            //attachId = response.getReturnValue();
            var returnValue = response.getReturnValue();
            
            if(returnValue['success']  && !returnValue['success']){
                component.set("v.errorMessage", "You need to verify ReCaptcha.");
                return;
            }
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.caseNumber", response.getReturnValue());
                this.setDefaults(component);
            } else if (state === "INCOMPLETE") {
                alert("From server: " + response.getReturnValue());
                this.setDefaults(component);
            } else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + errors[0].message);
                        this.setDefaults(component);
                    }
                } else {
                    console.log("Unknown error");
                    this.setDefaults(component);
                }
            }
        });
        component.set("v.caseCreated", true);
        // enqueue the action
        $A.enqueueAction(action); 
    },
    setDefaults: function (component){
        component.set("v.caseCreated", false);
        component.set("v.isContactUsOpen", false);
        component.set("v.newCase", {
            'sobjectType':'Case',
            'First_name__c' : '',
            'Last_name__c' : '',
            'Email_Address__c' : '',
            'Work_Address__c' : '',
            'Brand__c' : '',
            'Product_Type__c' : '',
            'Country_of_Interest__c': '',
            'Case_City__c' : '',
            'Case_State__c' : '',
            'SuppliedPhone' : '',
            'Case_Postal_Code__c' : '',
            'Product_Size__c' : '',
            'Issue__c' : '',
            'Lot_Code__c' : '',
            'Newsletter_Comments__c' : ''
        });
        component.set("v.fileName", 'No File Selected.');
        component.set("v.selectedHelpOption", '');
        component.set("v.selectedSampleOption", '');
        component.set("v.address2", '');
        component.set("v.showAdditionalInfo", false);
        component.set("v.confirmEmail", '');
        if(component.find("attachment") && component.find("attachment").get("v.files") && component.find("attachment").get("v.files").length > 0){
            component.find("attachment").set("v.files", {});
        }
        window.parent.postMessage("sfdc", "https://beamsuntory--desktosc--c.cs14.visual.force.com/");
    }
})