({
    createCase : function(component, event, isComplaint) {
        if(isComplaint && component.find("attachment").get("v.files").length > 0){
            var files = component.get("v.fileName");
            var self = this;
            var base64Files = [];
            files.forEach((file, index) => {
                
                var objFileReader = new FileReader();
                objFileReader.onload = $A.getCallback(function() {
                    var fileContents = objFileReader.result;
                    var base64 = 'base64,';
                    var dataStart = fileContents.indexOf(base64) + base64.length;                
                    fileContents = fileContents.substring(dataStart);
                	base64Files.push({name:file.name,  base64data:fileContents, fileType:file.type});
                    if(index==files.length-1){
                        self.createNewCase(component, base64Files);
                    }	
                });
                objFileReader.readAsDataURL(file);
            });
        } else {
            //this.createNewCase(component, null, null);
        }
        
    },
    createNewCase: function(component, base64Files) {
        var action = component.get("c.createCase");
        component.set("v.newCase.Brand__c", component.get("v.brand"));
        action.setParams({
            "caseObj": component.get("v.newCase"), 
            "base64Data": base64Files,
            reCaptchaResponse: component.get("v.reCaptchaToken")
        });
        
        // set call back 
        action.setCallback(this, function(response) {
            //attachId = response.getReturnValue();
            var returnValue = response.getReturnValue();
            if(!returnValue || returnValue['success']  && !returnValue['success']){
                component.set("v.caseCreated", false);
                component.set("v.errorMessage", "You need to verify ReCaptcha.");
                return;
            }
            var state = response.getState();
            if (state === "SUCCESS" && !returnValue.hasOwnProperty('error')) {
                component.set("v.caseNumber", response.getReturnValue());
                this.setDefaults(component);
                component.set("v.submitMessage", "Thank You for your request, we will connect with you shortly.");
            } else if (state === "INCOMPLETE") {
                alert("From server: " + response.getReturnValue());
                this.setDefaults(component);
            } else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + errors[0].message);
                        this.setDefaults(component);
                        component.set("v.submitMessage", "Something went wrong.");
                    }
                } else {
                    console.log('here')
                    this.setDefaults(component);
                    component.set("v.submitMessage", "Something went wrong.");
                }
            } else if (returnValue.hasOwnProperty('error')){
                 this.setDefaults(component);
                 component.set("v.submitMessage", "Something went wrong.");
            }
        });
        component.set("v.caseCreated", true);
        // enqueue the action
        $A.enqueueAction(action);
    },
    setDefaults: function (component){
        component.set("v.caseCreated", false);
       // component.set("v.isContactUsOpen", false);
        component.set("v.newCase", {
            'sobjectType':'Case',
            'First_name__c' : '',
            'Last_name__c' : '',
            'Email_Address__c' : '',
            'Work_Address__c' : '',
            'Brand__c' : '',
            'Category__c': '',
            'How_can_we_help__c' : '',
            'Product_Type__c' : '',
            'Country_of_Interest__c': '',
            'Case_City__c' : '',
            'Case_State__c' : '',
            'SuppliedPhone' : '',
            'Case_Postal_Code__c' : '',
            'Product_Size__c' : '',
            'Issue__c' : '',
            'Lot_Code__c' : '',
            'Comments' : ''
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
    },
    prepareData: function (component, data, brand) {
        console.log(data);
        var category = [];
        var help = {};
        Object.keys(data["BrandCategoryHelpMapping__c"][0]).forEach(item => {
            category.push({value: item, label:item});
            var helpObj=[];  
            data["BrandCategoryHelpMapping__c"][0][item].forEach(val => helpObj.push({value: val, label:val}));
    		help[item] = helpObj;
		})
    	component.set("v.lotCodeResource", $A.get('$Resource.' + data['lotCodeResource']));
    	component.set("v.helpOptionsMap", help);
        component.set("v.products", data[brand]);
        component.set("v.countries", data['Country_of_Interest__c']);
        component.set("v.issues", data['Issue__c']);
        component.set("v.sizes", data['Product_Size__c']);
    	component.set("v.categoryOptions", category);
    	var sampleOptions = [
            {value:"Bottle(s) with liquid", label:"Bottle(s) with liquid"},
            {value:"Bottle(s) without liquid", label:"Bottle(s) without liquid"},
            {value:"Lot code only", label:"Lot code only"},
            {value:"No sample or lot code", label:"No sample or lot code"}
        ];
        component.set("v.sampleOptions", sampleOptions);
	}
})