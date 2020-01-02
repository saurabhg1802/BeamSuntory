({
    loadOptions: function (component, event, helper) {
        
            window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
    
      (e || window.event).returnValue = confirmationMessage; //Gecko + IE
      return confirmationMessage;                            //Webkit, Safari, Chrome
    });
        
        var param = decodeURIComponent(window.location.search.substring(1).split('=')[1]);
        component.set("v.brand", param.indexOf('+') == -1 ? param : param.split('+').join(' '));
        var action = component.get("c.getPickListValues");
        var brand = component.get("v.brand");
        action.setParams({brand: brand});
        action.setCallback(this, function(response) {          
            helper.prepareData(component, response.getReturnValue(), brand);
        });
        
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
        component.set("v.helpOptions", component.get("v.helpOptionsMap")[category]);
    },
    setAdditionalInfo: function (component, event, helper) {
        event.getSource().get("v.value") == "Product / Packaging issue" ? component.set("v.showAdditionalInfo", true) : component.set("v.showAdditionalInfo", false);	
    },
    
    handleFilesChange: function (component, event, helper) {
        var fileName = [];
        Object.keys(event.getSource().get("v.files")).forEach(i => {
            fileName.push(event.getSource().get("v.files")[i])
        });
        if (typeof component.get('v.fileName')[0] === 'string'){
            component.set("v.fileName", fileName);
        } else {
            var files = component.get("v.fileName");
            component.set("v.fileName",[...files, ...fileName]);
        }
    },
    openContactUs: function (component, event, helper) {
        component.set("v.isContactUsOpen", true);
        component.set("v.caseNumber", '');
    },
    closeContactUs: function (component, event, helper) {
        component.set("v.isContactUsOpen", false);
        helper.setDefaults(component);
        // https://beamsuntory--desktosc--c.cs14.visual.force.com
        window.parent.postMessage("sfdc", "https://beamsuntory--desktosc--c.cs14.visual.force.com/");
        window.parent.postMessage("sfdc", "https://stage.jimbeam.com");
        window.parent.postMessage("sfdc", "https://www.jimbeam.com/");
    },
    submitCase: function (component, event, helper) {
        
       if(!component.get("v.reCaptchaToken")) {
            component.set("v.errorMessage", "You need to verify reCAPTCHA.");
            return;
        }
        if(component.get("v.showAdditionalInfo") && component.find("attachment").get("v.files")!=null){
            helper.createCase(component, event, true); 
        } else {
            helper.createCase(component, event, false)
        }
        //component.set("v.submitMessage", "Thanks for contacting will reach you shortly.");
        /* var allValid = component.find('complaintForm').reduce(function (validSoFar, inputCmp) {
            inputCmp.showHelpMessageIfInvalid();
            console.log(validSoFar);
            return validSoFar && !inputCmp.get('v.validity').valueMissing;
        }, true);
        if (allValid) {
            alert('All form entries look valid. Ready to submit!');
        } else {
            alert('Please update the invalid form entries and try again.');
        }*/
        
    },
    handleShowModal: function(component, event, helper){
        component.set("v.lotCode", true);
    } ,
    closeLotCode: function(component, event, helper) {
        component.set("v.lotCode", false);
    },
            
    handleUploadFinished: function (cmp, event) {
        // Get the list of uploaded files
        var uploadedFiles = event.getParam("files");
        alert("Files uploaded : " + uploadedFiles.length);
        console.log(JSON.stringify(uploadedFiles));
        
    }

})