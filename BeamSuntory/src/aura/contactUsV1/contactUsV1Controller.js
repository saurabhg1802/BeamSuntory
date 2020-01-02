({
    loadOptions: function (component, event, helper) {
        var action = component.get("c.getPickListValues");
        var brand = component.get("v.brand");
        
        action.setParams({brand: brand});
        action.setCallback(this, function(response) {
            component.set("v.lotCodeResource", $A.get('$Resource.'+response.getReturnValue()['lotCodeResource']));
            component.set("v.products", response.getReturnValue()[brand]);
            component.set("v.countries", response.getReturnValue()['Country_of_Interest__c']);
            component.set("v.issues", response.getReturnValue()['Issue__c']);
            component.set("v.sizes", response.getReturnValue()['Product_Size__c']);
        });
        var categoryOptions = [
            {value: "Product Information", label: "Product Information"},
            {value: "General Inquiry", label: "General Inquiry"}
        ];
        /* var helpOptions = [
            { value: "Online Store", label: "Online Store" },
            { value: "Distillery Tours", label: "Distillery Tours" },
            { value: "General Inquiries", label: "General Inquiries" },
            { value: "Questions about our Products", label: "Questions about our Products" },
            { value: "Product/Packaging Issue", label: "Product/Packaging Issue" },
            { value: "Public Relations", label: "Public Relations" }
        ]; */
        var sampleOptions =[
            {value:"Bottle(s) with liquid", label:"Bottle(s) with liquid"},
            {value:"Bottle(s) without liquid", label:"Bottle(s) without liquid"},
            {value:"Lot code only", label:"Lot code only"},
            {value:"No sample or lot code", label:"No sample or lot code"}
        ]
        component.set("v.categoryOptions", categoryOptions);
        component.set("v.sampleOptions", sampleOptions);
        //component.set("v.helpOptions", helpOptions);
        $A.enqueueAction(action); 
        window.addEventListener("message", function(event) {
            if(event.data.name=="reCaptchaToken"){
                component.set("v.errorMessage", "");
                component.set("v.reCaptchaToken", event.data.payload); 
            }
            if (event.data.captchaVisible) {
                var captchEl = document.getElementById('iFrame');
                if(event.data.captchaVisible === 'visible') {
                    captchEl.classList.add('reCaptchaBig');
                    captchEl.classList.remove('reCaptchaSmall');
                } else {
                    captchEl.classList.remove('reCaptchaBig');
                    captchEl.classList.add('reCaptchaSmall'); 
                }
            }
            component.set("v.isContactUsOpen", true);
        }, false);
    },
    setHelpOptions: function (component, event, helper) {
        var category =  event.getSource().get("v.value");
        component.set("v.newCase.How_can_we_help__c", '');
        component.set("v.showAdditionalInfo", false);
        var helpOptionsMap = {
            "Product Information":[
                {value: "Nutritional Information", label:"Nutritional Information"},
                {value: "Value of my bottle", label:"Value of my bottle"},
                {value: "Distillery Tours", label:"Distillery Tours"},
                {value: "Where can I buy?", label:"Where can I buy?"},
                {value: "Decanter Inquiry", label:"Decanter Inquiry"},
                {value: "Merchandise Request / Online store", label:"Merchandise Request / Online store"},
                {value: "Product/Packaging Issue", label:"Product/Packaging Issue"}
            ],
            "General Inquiry":[
                {value: "Brand Ambassador", label:"Brand Ambassador"},
                {value: "Influencers", label:"Influencers"},
                {value: "Public Relations", label:"Public Relations"},
                {value: "Coupons", label:"Coupons"},
                {value: "Sponsorship", label:"Sponsorship"},
                {value: "Shelf life", label:"Shelf life"}
            ]
        }
        component.set("v.helpOptions", helpOptionsMap[category]);
    },
    setAdditionalInfo: function (component, event, helper) {
        event.getSource().get("v.value")  == "Product/Packaging Issue" ? component.set("v.showAdditionalInfo", true) : component.set("v.showAdditionalInfo", false);
    },
    
    handleFilesChange: function (component, event, helper) {
        var fileName = 'No File Selected.'
        if (event.getSource().get("v.files").length > 0)
            fileName = event.getSource().get("v.files")[0]['name'];
        component.set("v.fileName", fileName);
    },
    
    openContactUs: function (component, event, helper) {
        component.set("v.isContactUsOpen", true);
        component.set("v.caseNumber", '');
    },
    
    closeContactUs: function (component, event, helper) {
        component.set("v.isContactUsOpen", false);
        helper.setDefaults(component);
    },
    submitCase: function (component, event, helper) {
        /*  var allValid = component.find('complaintForm').reduce(function (validSoFar, inputCmp) {
            inputCmp.showHelpMessageIfInvalid();
            return validSoFar && !inputCmp.get('v.validity').valueMissing;
        }, true) */
        
        /* if(!component.get("v.reCaptchaToken")) {
            component.set("v.errorMessage", "You need to verify reCAPTCHA.");
            return;
        } */
        /* component.set("v.caseCreated", true);
        window.setTimeout(
            $A.getCallback(function() {
                component.set("v.submitMessage", "Hell Yeahs");
                component.set("v.caseCreated", false);
            }), 2000
        );*/
        
        
        var index = component.get("v.currentPanel");
        
        if(index < component.get("v.totalPanels")-1 && component.get('v.showAdditionalInfo')){
            ++index;
            var carouselContent = document.getElementsByClassName('slds-carousel__content')[0];
            var modalContent = document.getElementsByClassName('slds-modal__content')[0].clientHeight;
            var innerContent = document.getElementById(`content-0${index+1}`).clientHeight;
            
            carouselContent.style.height = innerContent > modalContent ? innerContent+'px' : modalContent+'px';
            component.set("v.currentStep", index + 1 + "");
            if(index == component.get("v.totalPanels")-1){
                // Initial Case Insert (Complaint)
                component.set("v.errorMessage", "");
                component.set("v.caseCreated", true);
                window.setTimeout(
                    $A.getCallback(function() {
                        component.set("v.caseCreated", false);
                        component.set("v.currentPanel", index);
                        document.getElementsByClassName('slds-carousel__panels')[0].style.transform = `translateX(-`+`${index}`+`00%)`
                        document.getElementsByClassName('slds-modal__content')[0].scrollTop = 0
                    }), 5000
                );
            } else {
                component.set("v.currentPanel", index);
                document.getElementsByClassName('slds-carousel__panels')[0].style.transform = `translateX(-`+`${index}`+`00%)`
                document.getElementsByClassName('slds-modal__content')[0].scrollTop = 0
            }
            
        } else if(!component.get('v.showAdditionalInfo')) {
            // Inquiry Creation
            if(!component.get("v.reCaptchaToken")) {
                component.set("v.errorMessage", "You need to verify reCAPTCHA.");
                return;
            }
        } else {
            // Final Case Creation
            if(!component.get("v.reCaptchaToken")) {
                component.set("v.errorMessage", "You need to verify reCAPTCHA.");
                return;
            }
        }
        /* if(component.get("v.showAdditionalInfo") && component.find("attachment").get("v.files")!=null) {
            helper.createCase(component, event, true); 
        } else {
            helper.createCase(component, event, false)
        } */
        
    },
    handleShowModal: function(component, event, helper){
        component.set("v.lotCode", true);
    },
    previousPage: function(component, event, helper) {
        var index = component.get("v.currentPanel");
        component.set("v.currentPanel", --index);
        component.set("v.currentStep", index + 1 + "");
        if(index==0) document.getElementsByClassName('slds-carousel__content')[0].style.height = 'fit-content';
        document.getElementsByClassName('slds-carousel__panels')[0].style.transform = `translateX(-`+`${index}`+`00%)`
        document.getElementById('content-id-01').scrollIntoView();
    }
})