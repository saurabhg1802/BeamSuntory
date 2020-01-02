({
	init : function(component, event, helper) {
		this.getFinalizedWorkbookId(component, event, helper);
	},

	getFinalizedWorkbookId: function(component, event, helper){
		this.showSpinner(component, event, helper);
		var caseId = component.get('v.recordId');
		var action = component.get("c.getFinalizedWorkbookFromCase");
		action.setParams({caseId: caseId});
		action.setCallback(this, function(data){
            var state = data.getState();
            if(state == 'SUCCESS'){
                var requestObject = data.getReturnValue();
                var responseMap = requestObject['responseMap'];
                console.log('Response Map', responseMap);
                
                if('success' in requestObject && !requestObject['success']){
                    this.displayToast('Error', requestObject['message'], 'error');
                }
            	
                var approved = responseMap['approved'];
            	var rejected = responseMap['rejected'];
            	var documentId = responseMap['documentId'];
            	component.set('v.approved', approved==='true');
            	component.set('v.rejected', rejected==='true');
            	component.set('v.hasFinalizedWorkbook', documentId != null);
            	
                if(documentId === null){
            		component.set('v.finalizedWorkbookDocumentId', null);
            	} else {
            		component.set('v.finalizedWorkbookDocumentId', documentId);
            	}
            } else if(state == 'ERROR'){
            	component.set('v.hasFinalizedWorkbook', false);
                this.displayToast('Error', 'An unexpected error occurred, no file could be found', 'error');
            } else {
            	component.set('v.hasFinalizedWorkbook', false);
                this.displayToast('Warning', 'An unexpected error occurred', 'warning');
            }
            this.hideSpinner(component, event, helper);
		});
		$A.enqueueAction(action);
	},

	recordResponseToCase: function(component, event, helper, response){
		this.showSpinner(component, event, helper);
		var caseId = component.get('v.recordId');
		var action = component.get("c.recordResponseToCase");
        var changeDescription = component.get('v.changeDescription');
		action.setParams({caseId: caseId, response: response, changeDescription: changeDescription});
		action.setCallback(this, function(data){
            var state = data.getState();
            if(state == 'SUCCESS'){
                var requestObject = data.getReturnValue();
                if('success' in requestObject && !requestObject['success']){
                    this.displayToast('Error', requestObject['message'], 'error');
                }
                if('success' in requestObject && requestObject['success']){
                    if(response === 'approved'){
                        component.set('v.approved', true);
                    } else if(response === 'rejected'){
                        component.set('v.rejected', true);
                    }
                    this.displayToast('Success', 'Response Recorded Successfully', 'success');
                }
            } else if(state == 'ERROR'){
                this.displayToast('Error', 'An unexpected error occurred, no file could be found', 'error');
            } else {
                this.displayToast('Warning', 'An unexpected error occurred', 'warning');
            }
            this.hideSpinner(component, event, helper);
            this.refreshView(component, event, helper);
		});
		$A.enqueueAction(action);
	},

	setAttributeApproved: function(component){
		component.set('v.approved', true);
		component.set('v.rejected', false);
	},

	setAttributeRejected: function(component){
		component.set('v.approved', false);		
		component.set('v.rejected', true);
	},

    showPopupHelper: function(component, componentId, className){
        var modal = component.find(componentId);
        $A.util.removeClass(modal, className + 'hide');
        $A.util.addClass(modal, className + 'open');
    },
    
    hidePopupHelper: function(component, componentId, className){
        var modal = component.find(componentId);
        $A.util.addClass(modal, className+'hide');
        $A.util.removeClass(modal, className+'open');
    },

    open_modal:  function(component, event, helper){
        this.showPopupHelper(component, 'modaldialog', 'slds-fade-in-');
        this.showPopupHelper(component,'backdrop','slds-backdrop--');
    },

    close_modal: function(component, event, helper){
        this.hidePopupHelper(component, 'modaldialog', 'slds-fade-in-');
        this.hidePopupHelper(component, 'backdrop', 'slds-backdrop--');
    },

	showSpinner: function(component, event, helper) {
		component.set("v.Spinner", true); 
	},

	hideSpinner: function(component, event, helper) {
	   component.set("v.Spinner", false);			
	},
	
    displayToast: function (title, message, type, duration) {
        var toast = $A.get("e.force:showToast");
        // For lightning1 show the toast
        if (toast) {
            //fire the toast event in Salesforce1
            var toastParams = {
                "title": title,
                "message": message,
                "type": type
            }
            if (duration) {
                toastParams['Duration'] = duration
            }
            toast.setParams(toastParams);
            toast.fire();
        } else {
            // otherwise throw an alert 
            alert(title + ': ' + message);
        }
    },

    refreshView: function(component, event, helper){
        $A.get('e.force:refreshView').fire();
    },

})