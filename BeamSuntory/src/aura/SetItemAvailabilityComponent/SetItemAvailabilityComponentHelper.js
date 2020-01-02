({
	init : function(component, event, helper) {
		this.getQuoteRequests(component, event, helper);
		this.getCase(component, event, helper);
		this.getUnavailabilityReasonPicklistValues(component, event, helper);
	},

	getQuoteRequests: function(component, event, helper){
    	this.showSpinner(component, event, helper);
		var action = component.get("c.getRelatedQuoteRequests"); //should be getRelatedQuoteRequests
    	action.setParams({caseId: component.get('v.recordId')});
    	action.setCallback(this, function(data){
    		var state = data.getState();
            if(state == 'SUCCESS'){
            	var requestObject = data.getReturnValue();
            	var responseMap = requestObject['responseMap'];
            	console.log('Response Map', responseMap);
				console.log('getQuoteRequests Request Status', requestObject['success']);
                if('success' in requestObject && !requestObject['success']){
                	this.displayToast('Error', requestObject['message'], 'error');
                } else if('success' in requestObject && requestObject['success']){
	                if('quoteRequestMap' in responseMap){
						var quoteList = [];
						var quoteMap = responseMap['quoteRequestMap'];
						for(var key in quoteMap){
							var quote = quoteMap[key];
							quoteList.push(quoteMap[key]);
						}
						component.set('v.quoteRequestMap', responseMap['quoteRequestMap']);
						component.set('v.quoteRequestList', quoteList);
						this.setRadioVals(component, event, helper);	
	                }
                } else{
                	this.displayToast('Error', 'Response status not found.');
                }
            } else if(state == 'ERROR'){
                this.displayToast('Error', 'An unexpected error occurred, the Discount Document could not be retrieved', 'error');
            } else {
                this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
            }

			this.hideSpinner(component, event, helper);
    	});
		$A.enqueueAction(action);
	},

	getCase: function(component, event, helper){
    	this.showSpinner(component, event, helper);
		var action = component.get("c.getCurrentCase");
    	action.setParams({caseId: component.get('v.recordId')});
    	action.setCallback(this, function(data){
			var state = data.getState();
			if(state == 'SUCCESS'){
            	var requestObject = data.getReturnValue();
            	var responseMap = requestObject['responseMap'];
            	console.log('Response Map', responseMap);
				console.log('getCase Request Status', requestObject['success']);
                if('success' in requestObject && !requestObject['success']){
                	this.displayToast('Error', requestObject['message'], 'error');
                } else if('success' in requestObject && requestObject['success']){
					var currCase = responseMap['case'];
					component.set('v.ownerType', currCase.Owner.Type);
					component.set('v.submitted', currCase.Submitted_Compliance__c);
					component.set('v.ownerIsUser', component.get('v.ownerType') == 'User');
				} else {
                	this.displayToast('Error', 'Response status not found.');
                }
            } else if(state == 'ERROR'){
                this.displayToast('Error', 'An unexpected error occurred, the Discount Document could not be retrieved', 'error');
            } else {
                this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
            }

	    	this.hideSpinner(component, event, helper);
    	});
		$A.enqueueAction(action);
	},

	setRadioVals: function(component, event, helper){
		this.setPricingRadioSelectionsOnRetrieval(component, event, helper);
		this.setAvailabilityRadioSelectionsOnRetrieval(component, event, helper);
	},

	setPricingRadioSelectionsOnRetrieval: function(component, event, helper){
		var pricing = [].concat(component.find('pricing-radio'));
		var availability = [].concat(component.find('availability-radio'));
		var quoteMap = component.get('v.quoteRequestMap');
		for(var index in pricing){
			var price = pricing[index];
			var value = price.get('v.value');
			var quoteId = price.get('v.class');
			var quote = quoteMap[quoteId];
			var pricingRadioVal = quote.Price_Needed__c;
			if(pricingRadioVal != null && value === pricingRadioVal){
				price.set('v.checked', true);
			}
		}
	},

	setAvailabilityRadioSelectionsOnRetrieval: function(component, event, helper){
		var availabilityList = [].concat(component.find('availability-radio'));
		var quoteMap = component.get('v.quoteRequestMap');
		for(var index in availabilityList){
			var availability = availabilityList[index];
			var value = availability.get('v.value');
			var quoteId = availability.get('v.class');
			var quote = quoteMap[quoteId];
			var availabilityRadioVal = quote.Item_Available__c;
			if(availabilityRadioVal != null && value === availabilityRadioVal){
				availability.set('v.checked', true);
			}
		}
	},

	togglePriceNeededRadioGroup: function(component, event, helper){
		var pricing = [].concat(component.find('pricing-radio'));
		var value = event.getParam("value")[0];
		var name = event.getSource().get('v.name');
		var id = name.replace('availability-', '');
		pricing.forEach(function(group){
			var groupId = group.get('v.class');
			if(groupId === id){
				var pricingId = 'pricing-'+id;
				var docs = document.getElementsByName(pricingId);
				if(value === 'Yes'){
					group.set('v.disabled', null);
				} else {
					group.set('v.selected', null);
					group.set('v.disabled', true);
				}
			}
		});
	},

	updateAvailability: function(component, event, helper){
		var pricing = [].concat(component.find('pricing-radio'));
		var value = event.getSource().get('v.value');
		var id = event.getSource().get('v.class');
		var quoteMap = component.get('v.quoteRequestMap');
		quoteMap[id].Item_Available__c=value;
		if(value === 'No'){
			quoteMap[id].Price_Needed__c=null;
		}
		for(var i=0; i<pricing.length; i++){
			var group = pricing[i];
			var groupId = group.get('v.class');
			if(groupId === id){
				var pricingId = 'pricing-'+id;
				if(value === 'Yes'){
					group.set('v.disabled', null);
				} else {
					group.set('v.checked', false);
					group.set('v.disabled', true);
				}
			}
		}
		component.set('v.quoteRequestMap', quoteMap);
	},

	updatePricing: function(component, event, helper){
		var value = event.getSource().get('v.value');
		var id = event.getSource().get('v.class');
		var quoteMap = component.get('v.quoteRequestMap');
		quoteMap[id].Price_Needed__c=value;
		component.set('v.quoteRequestMap', quoteMap);
	},

	updateQuotes: function(component, event, helper){
    	this.showSpinner(component, event, helper);
		var action = component.get("c.updateRelatedQuoteRequests");
    	action.setParams({quoteMap: component.get('v.quoteRequestMap'), caseId: component.get('v.recordId')});
    	action.setCallback(this, function(data){
    		var state = data.getState();
            if(state == 'SUCCESS'){
            	var requestObject = data.getReturnValue();
            	var responseMap = requestObject['responseMap'];
            	console.log('Response Map', responseMap);
				console.log('updateQuotes Request Status', requestObject['success']);
                if('success' in requestObject && !requestObject['success']){
                	this.displayToast('Error', requestObject['message'], 'error');
                } else if('success' in requestObject && requestObject['success']){
					this.displayToast('Success', 'Availability Set', 'success');
					component.set('v.submitted', true);
					var pricing = [].concat(component.find('pricing-radio'));
					var availability = [].concat(component.find('availability-radio'));
					pricing.forEach(function(group){
						group.set('v.disabled', true);
					});
					availability.forEach(function(group){
						group.set('v.disabled', true);
					});
                } else {
                	this.displayToast('Error', 'Response status not found.');
                }
            } else if(state == 'ERROR'){
                this.displayToast('Error', 'An unexpected error occurred, the Discount Document could not be retrieved', 'error');
            } else {
                this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
            }

	    	this.hideSpinner(component, event, helper);
	    	this.refreshView(component, event, helper);
    	});
		$A.enqueueAction(action);
	},

	checkReasonsUnavailable: function(component, event, helper){
		var quoteMap = component.get('v.quoteRequestMap');
		var unavailableIds = [];
		var numberOfItemsUnvailable = 0;
		var unavailableItemList = [];
		for(var key in quoteMap){
			var quote = quoteMap[key];
			if(quote.Item_Available__c === 'No'){
				unavailableIds.push(quote.Id);
				numberOfItemsUnvailable++;
				unavailableItemList.push(quote);
			}
		}

		console.log(unavailableIds);
		component.set('v.unavailableIds', unavailableIds);
		component.set('v.numberOfItemsUnvailable', numberOfItemsUnvailable);
		component.set('v.unavailableItemList', unavailableItemList);
	},

	checkValidity: function(component, event, helper){
		var quoteMap = component.get('v.quoteRequestMap');
		var itemsWithErrors = [];
		for(var key in quoteMap){
			var quote = quoteMap[key];
			if(quote.Item_Available__c == null){
				itemsWithErrors.push(quote.Item_Name__c);
			} else if(quote.Item_Available__c === 'Yes'){
				if(quote.Price_Needed__c == null){
					itemsWithErrors.push(quote.Item_Name__c);
				}
			} else if(quote.Item_Available__c === 'No'){
				if(quote.Price_Needed__c != null){
					itemsWithErrors.push(quote.Item_Name__c);
				}
			}
		}
		return itemsWithErrors;
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

    open_prompt:  function(component, event, helper){
        this.showPopupHelper(component, 'modalprompt', 'slds-slide-up-');
        this.showPopupHelper(component,'backdrop','slds-backdrop--');
    },

    close_prompt: function(component, event, helper){
    	this.hidePopupHelper(component, 'modalprompt', 'slds-slide-up-');
    	this.hidePopupHelper(component, 'backdrop', 'slds-backdrop--');
    },

    checkReasonValidity: function(component, event, helper) {
    	var unavailableItems = component.get('v.unavailableItemList');
    	var blankReasonList = [];
    	var missingOtherList = [];
    	for(var index in unavailableItems){
    		var item = unavailableItems[index];
    		console.log(item);
    		if(item.Unavailability_Reason__c == '' || item.Unavailability_Reason__c == null){
    			blankReasonList.push(item.Item_Name__c);
    		} else if(item.Unavailability_Reason__c == 'Other'){
    			if(item.Unavailability_Reason_Other__c == '' || item.Unavailability_Reason_Other__c == null){
    				missingOtherList.push(item.Item_Name__c);
    			}
    		} else if(item.Unavailability_Reason__c != 'Other'){
    			item.Unavailability_Reason_Other__c = '';
    		}
    	}

    	if(blankReasonList.length > 0){
	    	this.displayToast('Error', 'The following items still need reasons: ' + blankReasonList.join(','), 'error');
    	}
    	if(missingOtherList.length > 0){
	    	this.displayToast('Error', 'The following items need "Other" reasons: ' + missingOtherList.join(','), 'error');
    	}

    	component.set('v.unavailableItemList', unavailableItems);
    	return (blankReasonList.length + missingOtherList.length) > 0;
    	/*var l = component.get('v.unavailableItemList');
    	l[0].Price_Needed__c = 'Yes';
    	component.set('v.unavailableItemList', l);
    	console.log(component.get('v.unavailableItemList'));
    	console.log(component.get('v.quoteRequestMap'));
    	var unavailability = [].concat(component.find('unavailability-reason'));
		var quoteMap = component.get('v.quoteRequestMap');
    	var errorNames = [];
    	var missingOtherNames = [];
    	for(var u in unavailability){
    		var comp = unavailability[u];
    		var id = comp.get('v.name').replace('unavailability-', '');
    		var val = comp.get('v.value');
    		var valueLen = val.length;
    		if(valueLen == 0){
    			errorNames.push(quoteMap[id].Item_Name__c);
    		} else {
    			quoteMap[id].Unavailability_Reason__c = val;
    		}
    	}
    	component.set('v.quoteRequestMap', quoteMap);
    	if(errorNames.length > 0){
	    	this.displayToast('Error', 'The following items still need reasons: ' + errorNames.join(','), 'error');
    	}
    	return errorNames.length > 0;*/
    },

    getUnavailabilityReasonPicklistValues: function(component, event, helper){
    	this.showSpinner(component, event, helper);
		var action = component.get("c.getUnavailabilityReasonPicklistValues");
    	action.setCallback(this, function(data){
    		component.set('v.unavailabilityReasonValues', data.getReturnValue());
    		this.hideSpinner(component, event, helper);
    	});
		$A.enqueueAction(action);
    },

	showSpinner: function(component, event, helper) {
		component.set("v.Spinner", true); 
	},
    
    hideSpinner : function(component,event,helper){
		component.set("v.Spinner", false);
    }
})