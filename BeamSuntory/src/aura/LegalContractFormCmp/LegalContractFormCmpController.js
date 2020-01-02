({
    doInit : function(component, event, helper) {
        component.set("v.showSpinner", true);
        // calls helper method to show all questions from backend                   
            var action = component.get("c.getAlllegalcontracts");
            action.setCallback(this, function(response){
                var name = response.getState();
                if (name === "SUCCESS") {
                    component.set("v.legalContractForm", response.getReturnValue());
                    component.set("v.showSpinner", false);
                }
            });  
        $A.enqueueAction(action);    
    },    
    //Handle to get answers for each questions
    handleInputChange: function(component, event, helper) {
        var response = event.getParam('value');
        var auraId = event.getSource().getLocalId(); 
        var auraname = event.getSource().get("v.name"); 
        //Add all the questionId and its response
        	helper.addQuestionToMap(component, event, helper, auraname, response);      
        	helper.updateQuestionToMap(component, event, helper, auraname, response);
    },
    handleSaveLegalContract: function(component, event, helper) {
        helper.showToast('Legal Form Saved Successfully!', 'Success', 'success');
        setTimeout(function() {
        component.set("v.showLegalForm", false);
        component.set("v.showUploadSection", false);
        component.set("v.createLegalForm", true);
        location.reload();
        }, 3000);   
    },
    handleUpdateLegalContract: function(component, event, helper) {
        component.set('v.updateButtonDisabled', true);      
        setTimeout(function() {
            component.set('v.updateButtonDisabled', false);
        }, 5000);
        var invalidFields = helper.isFormValid(component);
        console.log('invalidFields:::',invalidFields);
        if(invalidFields && invalidFields.length > 0){
                helper.showToast(
                    'Please complete all required fields','Validation Error', 'error');
                event.preventDefault();
                return;
        } 
        else{
        	var updateLegalContractPromise = helper.updateLegalContract(component, event, helper);
            updateLegalContractPromise.then(
                $A.getCallback(function(result) {              
                    helper.showToast('Legal Contract Updated!', 'Success', 'success');
                    component.set("v.showLegalForm", false);
                    var varRecordId = component.get("v.recordId");
        			component.set("v.LegalFormId", varRecordId);
                    component.set("v.showUploadSection", true);                      
                }),
                $A.getCallback(function(error) {
                    // Something went wrong
                    helper.showToast('An Error Occured', 'Error', 'error');
                })
           )
        }
    },
    //Handle createlegalcontract
    handleCreateLegalContract: function(component, event, helper) {
        component.set('v.submitButtonDisabled', true);        
        setTimeout(function() {
            component.set('v.submitButtonDisabled', false);
        }, 5000);
        var invalidFields = helper.isFormValid(component);
        console.log('invalidFields:::',invalidFields);
        if(invalidFields && invalidFields.length > 0){
                helper.showToast(
                    'Please complete all required fields','Validation Error', 'error');
                event.preventDefault();
                return;
        }         
        else{
            var createLegalContractPromise = helper.createLegalContract(component, event, helper);
            createLegalContractPromise.then(
                    $A.getCallback(function(result) {                                              
                            console.log('result Derived:::',result['accountApplication'].Id);
                            component.set('v.questionMap', result['appQuestions']);  
                            component.set('v.LegalFormId', result['accountApplication'].Id);
                            helper.showToast('Legal Contract Submitted!', 'Success', 'success'); 
                            component.set("v.showLegalForm", false);
                            component.set("v.showUploadSection", true); 
                        
                    }),
                    $A.getCallback(function(error) {
                    // Something went wrong
                        helper.showToast('An Error Occured', 'Error', 'error');
                    })
                )
        }
    },
    buttonAction: function(component,event,helper){
        let button = event.getSource();
        component.set("v.showSpinner", true);
		helper.buildApplication(component, event, helper);
        setTimeout(function() {
        component.set("v.showSpinner", false);
        component.set("v.showLegalForm", true);
        component.set("v.createLegalForm", false); 
        }, 2000);
    },
    //File upload
    handleUploadFinished : function(component, event, helper) {
        var uploadedFiles = event.getParam("files");
        var documentId = uploadedFiles[0].documentId;
        var fileName = uploadedFiles[0].name;
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": "Success!",
            "message": "File "+fileName+" Uploaded successfully."
        });
        toastEvent.fire();
    },
    
    doAction : function(cmp, event) {
        var params = event.getParam('arguments');
        if (params) {
            var param1 = params.param1;
            // add your code here
            console.log('param1:::'+param1);
        }
    },
    // this function automatic call by aura:waiting event  
    showSpinner: function(component, event, helper) {
       //make Spinner attribute true for display loading spinner 
      	var spinner = component.find("legal_approval_spinner");
        $A.util.addClass(spinner, "slds-show");
        $A.util.removeClass(spinner, "slds-hide");
   },    
   // this function automatic call by aura:doneWaiting event 
    hideSpinner : function(component,event,helper){
       // make Spinner attribute to false for hide loading spinner    
       var spinner = component.find("legal_approval_spinner");
        $A.util.addClass(spinner, "slds-hide");
        $A.util.removeClass(spinner, "slds-show");
    },
    handleClick: function (component, event, helper) {      
    	component.set("v.createLegalForm", false);        
        component.set("v.EditMode", true);
        var ctarget = event.currentTarget;
        var id_str = ctarget.dataset.value;
        console.log('legalId :::', id_str); 
        component.set("v.recordId", id_str);
        component.set("v.legalRecordId", id_str); 
        var legalRecordId = component.get("v.legalRecordId");        
        component.set("v.showSpinner", true);
        component.set('v.updateButtonDisabled', true);        
        setTimeout(function() {
            component.set('v.updateButtonDisabled', false);
        }, 5000);
        var viewLegalContractPromise = helper.viewQuestions(component, event, helper);
        viewLegalContractPromise.then(
                $A.getCallback(function(result) {
                    console.log('result Derived1:::',result['LegalResponses']);
                    console.log('result Derived2:::',result['LegalContractForm']);
                    console.log('result Derived3:::',result['LegalResponsesIds']);
                    component.set('v.questionAnswerMap', result['LegalResponses']); 
                    component.set('v.answerIdsMap',result['LegalResponsesIds']);                    
                     // Call build application
                     setTimeout(function() {                     
            			component.set("v.showLegalForm", true);
        			 },300)
        			 component.set("v.showSpinner", false);
                    
                }),
                    $A.getCallback(function(error) {
                    // Something went wrong
                    helper.showToast('An Error Occured', 'Error', 'error');
                })
            )       
       helper.buildApplication(component, event, helper);
    },
    checkChange: function(component, event, handler) {
  		// new value will be here
  		var data = component.get("v.legalContractForm");
  		console.log('Testingsss'+data);
	}
})