({
	init : function(component, event, helper) {
		console.log('init');
		this.getInquiryTypes(component, event, helper);
	},

	getInquiryTypes: function(component, event, helper){
		this.showSpinner(component, event, helper);
		var action = component.get("c.getPicklistValueMap");
		action.setParams({});
		action.setCallback(this, function(data){
			var state = data.getState();
			if(state == 'SUCCESS'){
				var requestObject = data.getReturnValue();
				var responseMap = requestObject['responseMap'];
				console.log('Response Map', responseMap);
				console.log('getPicklistValueMap Request Status', requestObject['success']);
				if('success' in requestObject && !requestObject['success']){
					this.displayToast('Error', requestObject['message'], 'error');
				} else if('success' in requestObject && requestObject['success']){
					if('typeValues' in responseMap){
						console.log('Picklist Values retrieved successfully.');
						var typeValueList = responseMap['typeValues'];
						component.set('v.inquiryTypeList', typeValueList);
					}
					if('stateValues' in responseMap){
						console.log('Picklist Values retrieved successfully.');
						var stateValueList = responseMap['stateValues'];
						component.set('v.inquiryStateList', stateValueList);
					}
				} else{
					this.displayToast('Error', 'Response status not found.');
				}
			} else if(state == 'ERROR'){
				this.displayToast('Error', 'An unexpected error occurred, some picklist values were not loaded.', 'error');
			} else {
				this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
			}
			this.hideSpinner(component, event, helper);
		});
		$A.enqueueAction(action);
	},
    
	getComplianceAccount: function(component, event, helper){
		this.showSpinner(component, event, helper);
		var action = component.get("c.retrieveComplianceAccount");
		action.setParams({});
		action.setCallback(this, function(data){
			var state = data.getState();
			if(state == 'SUCCESS'){
				var requestObject = data.getReturnValue();
				var responseMap = requestObject['responseMap'];
				console.log('Response Map', responseMap);
				console.log('Compliance Account Retrieval Status', requestObject['success']);
				if('success' in requestObject && !requestObject['success']){
					this.displayToast('Error', requestObject['message'], 'error');
				} else if('success' in requestObject && requestObject['success']){
					if('accountId' in responseMap){
						console.log('Account Id retrieved successfully.');
						var accountId = responseMap['accountId'];
						component.set('v.accountId', accountId);
					}
				} else{
					this.displayToast('Error', 'Response status not found.');
				}
			} else if(state == 'ERROR'){
				this.displayToast('Error', 'An unexpected error occurred, Account Id was not loaded.', 'error');
			} else {
				this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
			}
			this.hideSpinner(component, event, helper);
		});
		$A.enqueueAction(action);
	},

	checkPageOneValidity: function(component, event, helper){
		var auraIdList = ['inquiryType', 'state', 'details'];
		var invalidFieldList = [];
		var hasErrors = false;
		auraIdList.forEach(function(auraid){
			var e = component.find(auraid);
			if(e.get('v.validity').valid === false){
				hasErrors =true;
				invalidFieldList.push(auraid);
			}
		});
		return invalidFieldList;
	},

	getFieldLabelList: function(component, event, helper, idList){
		var labelList = [];
		var idLabelMap = {'state': 'State',
							'inquiryType': 'Inquiry Type',
							'details': 'Request Details'
		};
		for(var index in idList){
			labelList.push(idLabelMap[idList[index]]);
		}
		return labelList;
	},

	displayMissingFieldToast: function(component, event, helper, missingFieldList){
		var msg = "The following fields are missing or invalid: [<fields>]";
		var fields = [];
		missingFieldList.forEach(function(val){
			fields.push(val);
		});
		if(fields.length > 0){
			msg = msg.replace('<fields>', fields.join(', '));
			this.displayToast('Missing Fields', msg, 'error');
		}
	},

	getUploadedDocumentData: function(component, event, helper, documentIdList){
		this.showSpinner(component, event, helper);	
		var action = component.get("c.getContentDocumentData");
		action.setParams({documentIdList: documentIdList});
		action.setCallback(this, function(data){
			var state = data.getState();
			if(state == 'SUCCESS'){
				var requestObject = data.getReturnValue();
				var responseMap = requestObject['responseMap'];
				if('success' in requestObject && !requestObject['success']){
					this.displayToast('Error', requestObject['message'], 'error');
				} else if('success' in requestObject && requestObject['success']){
					var documentList = responseMap['documentList'];
					component.set('v.attachmentDataList', documentList);
				} else {
					this.displayToast('Error', 'Response status not found.');
				}
			} else if(state == 'ERROR'){
				this.displayToast('Fatal Error', 'An unexpected error occurred, document data could not be retrieved.', 'error');
			} else {
				this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
			}
			this.hideSpinner(component, event, helper);
		});
		$A.enqueueAction(action);
	},

	deleteUploadedDocumentData: function(component, event, helper, deletedDocumentId, documentIdList){
		this.showSpinner(component, event, helper);	
		var action = component.get("c.deleteContentDocumentList");
		action.setParams({deletedDocumentId: deletedDocumentId,
							fullDocumentIdList: documentIdList});
		action.setCallback(this, function(data){
			var state = data.getState();
			if(state == 'SUCCESS'){
				var requestObject = data.getReturnValue();
				var responseMap = requestObject['responseMap'];
				if('success' in requestObject && !requestObject['success']){
					this.displayToast('Error', requestObject['message'], 'error');
				} else if('success' in requestObject && requestObject['success']){
					var documentList = responseMap['documentList'];
					if(documentList.length == 0 || documentList == null){
						documentList = [];
					}
					component.set('v.attachmentDataList', documentList);
				} else {
					this.displayToast('Error', 'Response status not found.');
				}
			} else if(state == 'ERROR'){
				this.displayToast('Fatal Error', 'An unexpected error occurred, document data could not be retrieved.', 'error');
			} else {
				this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
			}
			this.hideSpinner(component, event, helper);
		});
		$A.enqueueAction(action);
	},

	removeAttachmentFromList: function(component, event, helper, documentId){
		var attachmentIdList = component.get('v.attachmentIdList');
		var attachmentDataList = component.get('v.attachmentDataList');
		var deletedIdList = [];
		
		for(var index in attachmentIdList){
			if(attachmentIdList[index] == documentId){
				deletedIdList.push(attachmentIdList.splice(index, 1)[0]);
			}
		}
		
		for(var index in attachmentDataList){
			if(attachmentDataList[index].Id == documentId){
				attachmentDataList.splice(index, 1);
			}
		}

		component.set('v.attachmentIdList', attachmentIdList);
		component.set('v.attachmentDataList', attachmentDataList);
		this.deleteUploadedDocumentData(component, event, helper, deletedIdList[0], attachmentIdList);
	},

	createInquiryCase: function(component, event, helper){
		var state = component.get('v.state');
		var inquiryType = component.get('v.inquiryType');
		var details = component.get('v.details');
		var documentIdList = component.get('v.attachmentIdList');

		this.showSpinner(component, event, helper);	
		var action = component.get("c.insertComplianceInquiryCase");
		action.setParams({state: state,
							inquiryType: inquiryType,
							details: details,
							documentIdList: documentIdList});
		action.setCallback(this, function(data){
			var state = data.getState();
			if(state == 'SUCCESS'){
				var requestObject = data.getReturnValue();
				var responseMap = requestObject['responseMap'];
				if('success' in requestObject && !requestObject['success']){
					this.displayToast('Error', requestObject['message'], 'error');
				} else if('success' in requestObject && requestObject['success']){
					var inquiryCase = responseMap['case'];
					component.set('v.inquiryCase', inquiryCase);
					this.open_prompt(component, event, helper);
				} else {
					this.displayToast('Error', 'Response status not found.');
				}
			} else if(state == 'ERROR'){
				this.displayToast('Fatal Error', 'An unexpected error occurred, document data could not be retrieved.', 'error');
			} else {
				this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
			}
			this.hideSpinnerNoTimeout(component, event, helper);
		});
		$A.enqueueAction(action);

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

	open_prompt :  function(component, event, helper){
		this.showPopupHelper(component, 'modalprompt', 'slds-slide-up-');
		this.showPopupHelper(component,'backdrop','slds-backdrop--');
	},

	showPopupHelper: function(component, componentId, className){
		var modal = component.find(componentId);
		$A.util.removeClass(modal, className + 'hide');
		$A.util.addClass(modal, className + 'open');
	},
	
	hidePopupHelper: function(component, event, helper, componentId, className){
		var modal = component.find(componentId);
		$A.util.addClass(modal, className+'hide');
		$A.util.removeClass(modal, className+'open');
	},

	showSpinner: function(component, event, helper) {
		component.set("v.Spinner", true); 
	},

	hideSpinner: function(component, event, helper) {
		setTimeout(function(){
			component.set("v.Spinner", false);
		}, 500);
	},

	hideSpinnerNoTimeout: function(component, event, helper) {
		component.set("v.Spinner", false);
	},
})