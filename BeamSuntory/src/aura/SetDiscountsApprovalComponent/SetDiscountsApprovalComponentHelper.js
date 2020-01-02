({
	init : function(component, event, helper) {
		console.log('helper init');
		this.getDiscountsDocumentInfo(component, event, helper);
	},

	getDiscountsDocumentInfo: function(component, event, helper){
		this.showSpinner(component, event, helper);
		var action = component.get("c.getDiscountInit");
    	action.setParams({caseId: component.get('v.recordId')});
    	action.setCallback(this, function(data){
            var state = data.getState();
            if(state == 'SUCCESS'){
            	var requestObject = data.getReturnValue();
            	var responseMap = requestObject['responseMap'];
            	console.log('Response Map', responseMap);
                if('success' in requestObject && !requestObject['success']){
                	this.displayToast('Error', requestObject['message'], 'error');
                }

                if('approvalStatus' in responseMap){
                	var approvalStatus = responseMap['approvalStatus'];
                	component.set('v.approvalStatus', approvalStatus);
                	component.set('v.approved', approvalStatus=='Approved');
                	component.set('v.rejected', approvalStatus=='Rejected');
                }

                if('versionId' in responseMap){
                	component.set('v.discountVersionId', responseMap['versionId']);
                }

            	if('documentId' in responseMap){
            		component.set('v.discountDocumentId', responseMap['documentId']);
            		component.set('v.hasDocument', true);
            	}
            } else if(state == 'ERROR'){
                this.displayToast('Error', 'An unexpected error occurred, the Discount Document could not be retrieved', 'error');
            } else {
                this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
            }
            this.hideSpinner(component, event, helper);
            component.set('v.initComplete', true);
    	});
		$A.enqueueAction(action);
	},

	recordApprovalStatus: function(component, event, helper, response, changeDescription){
		this.showSpinner(component, event, helper);
		var action = component.get("c.recordApprovalStatus");
    	action.setParams({caseId: component.get('v.recordId'),
    						versionId: component.get('v.discountVersionId'),
    						response: response,
    						changeDescription: component.get('v.changeDescription')});
    	action.setCallback(this, function(data){
            var state = data.getState();
            if(state == 'SUCCESS'){
            	console.log('Return value', data.getReturnValue());
            	var requestObject = data.getReturnValue();
            	console.log('Request success', requestObject['success']);
            	console.log('Request message', requestObject['message']);
                if(requestObject['success']){
                	this.displayToast('Success', 'Approval Status Updated', 'success');
                	component.set('v.approved', response);
                	component.set('v.rejected', !response);
                } else {
                	this.displayToast('Error', requestObject['message'],'error');
                }
            } else if(state == 'ERROR'){
                this.displayToast('Error', 'An unexpected error occurred, response could not be recorded.', 'error');
            } else {
                this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
            }
            this.hideSpinner(component, event, helper);
			this.refreshView(component, event, helper);
    	});
		$A.enqueueAction(action);
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
		console.log('showing spinner');
	},

	hideSpinner: function(component, event, helper) {
	   component.set("v.Spinner", false);
	   console.log('hiding spinner');
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
		setTimeout(function(){
			$A.get('e.force:refreshView').fire();
		}, 1000);
	},
})