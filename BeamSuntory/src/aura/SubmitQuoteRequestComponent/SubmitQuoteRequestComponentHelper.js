({
	init: function(component, event, helper){
		this.getPicklistValueMap(component, event, helper);
		this.getUserAttributeMap(component, event, helper);
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
        component.set("v.body", "");
        this.clearModalValues(component, event, helper);
    },

    clearModalValues: function(component, event, helper){
		component.set('v.itemName', null);
		component.set('v.itemSize', null);
		component.set('v.quoteType', null);
		component.set('v.additionalComments', null);
		component.set('v.bottlePrice', null);
		component.set('v.fobCalculation', null);
    },

    addPendingQuote: function(component, event, helper){
    	console.log('here');
		var qlist = component.get('v.quoteRequestList');
		var quote = {
			'state':component.get('v.selectedState'),
			'item_name':component.get('v.itemName'),
			'item_size':component.get('v.itemSize'),
			'quote_type':component.get('v.quoteType'),
			'priority':component.get('v.priority'),
			'bottle_price':component.get('v.bottlePrice'),
			'fob_price':component.get('v.fobCalculation'),
			'additional_comments':component.get('v.additionalComments')
		}
		qlist.push(quote);
		component.set('v.quoteRequestList', qlist);
		console.log(component.get('v.quoteRequestList'));
    },

    checkCaseValidity: function(component, event, helper){
    	var auraIdList = ['state', 'priority'];
    	var invalidFieldList = [];
    	var hasErrors = false;
    	auraIdList.forEach(function(auraid){
    		var e = component.find(auraid);
	    	if(e.get('v.value') == '' || e.get('v.value') == null){
	    		hasErrors = true;
	    		invalidFieldList.push(auraid);
    		}
    	})
    	console.log(invalidFieldList);
    	return invalidFieldList;
    },

    checkCurrencyValidity: function(component, event, helper){
    	var currencyIdList = ['price_input', 'fob_input'];
    	var validity = true;
    	var bottleMsg = '';
    	var fobMsg = '';
        var itemMsg = '';
    	if(component.get('v.manager')){
    		var bottlePrice = component.get('v.bottlePrice');

			if(bottlePrice < 0){
    			validity = false;
    			bottleMsg = 'Bottle Price cannot be a negative number';
			} else if(bottlePrice == 0){
				validity = false;
				bottleMsg = 'Bottle Price cannot be zero';
			} else if(bottlePrice >= 100000){
				validity = false;
				bottleMsg = 'Bottle Price cannot exceed $99999.99';
			}
		
    		if(component.get('v.selectedState') == 'New Hampshire'){
			    var fobPrice = component.get('v.fobCalculation');
				if(fobPrice < 0){
					validity = false;
					fobMsg = 'FOB cannot be a negative number';
				} else if(fobPrice == 0){
					validity = false;
					fobMsg = 'FOB cannot be zero';
				} else if(fobPrice >= 100000){
					validity = false;
					fobMsg = 'FOB cannot exceed $99999.99';
				} else if(fobPrice == '' || fobPrice == null){
					fobMsg = 'FOB is required for New Hampshire requests';
					validity = false;
				}
			}
			if(bottleMsg != '' && bottleMsg != null){
				this.displayToast('Bottle Price Error', bottleMsg, 'error');
			}
			if(fobMsg != '' && fobMsg != null){
				this.displayToast('FOB Error', fobMsg, 'error');
			}
    	}
        
        if(component.get('v.itemName').length > 80){
            itemMsg = 'Item Name Max Allowed characters : 80';
            validity = false;
        }
        
        if(itemMsg != '' && itemMsg != null){
			this.displayToast('Item Name Error', itemMsg, 'error');
		}
        
    	return validity;
    },

    checkModalValidity: function(component, event, helper){
    	var auraIdList = ['item_name', 'item_size', 'quote_type'];
    	var invalidFieldList = [];
    	var hasErrors = false;
    	auraIdList.forEach(function(auraid){
    		var e = component.find(auraid);
	    	if(e.get('v.validity').valid === false){
	    		hasErrors = true;
	    		invalidFieldList.push(auraid);
    		}
    	})

    	return invalidFieldList;
    },

    checkFormValidity: function(component, event, helper){
    	var caseValidity = this.checkCaseValidity(component, event, helper);
    	var modalValidity = this.checkModalValidity(component, event, helper);
    	return caseValidity.concat(modalValidity);
    },

    getPicklistValueMap: function(component, event, helper){
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
                    if('picklistValueMap' in responseMap){
                        var picklistValueMap = responseMap['picklistValueMap'];                        
                        console.log('Picklist Values retrieved successfully.');
                        component.set('v.stateValues', picklistValueMap['state']);
                        component.set('v.itemSizeValues', picklistValueMap['item_size']);
                        component.set('v.quoteTypeValues', picklistValueMap['quote_type']);
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

    getUserAttributeMap: function(component, event, helper){
    	this.showSpinner(component, event, helper);
    	var action = component.get("c.getUserAttributeMap");
    	action.setParams({});
    	action.setCallback(this, function(data){

            var state = data.getState();
            if(state == 'SUCCESS'){
                var requestObject = data.getReturnValue();
                var responseMap = requestObject['responseMap'];
                console.log('Response Map', responseMap);
                console.log('getUserAttributeMap Request Status', requestObject['success']);
                if('success' in requestObject && !requestObject['success']){
                    this.displayToast('Error', requestObject['message'], 'error');
                } else if('success' in requestObject && requestObject['success']){
                    if('attributeMap' in responseMap){
                        console.log('User Attributes retrieved successfully.');
                        var userAttrMap = responseMap['attributeMap'];
                        component.set('v.userAttrMap', userAttrMap);
                        component.set('v.contact', userAttrMap.contact);
                        component.set('v.manager', userAttrMap.manager);
                        component.set('v.other', userAttrMap.other);

                        if(userAttrMap.contact || userAttrMap.other){
                            component.set('v.submitterType', 'State Contact');
                        } else if(userAttrMap.manager){
                            component.set('v.submitterType', 'State Manager');
                        } else{
                            component.set('v.submitterType', 'State Contact');
                        }
                    }
                } else{
                    this.displayToast('Error', 'Response status not found.');
                }
            } else if(state == 'ERROR'){
                this.displayToast('Error', 'An unexpected error occurred, user type could not be loaded.', 'error');
                component.set('v.contact', false);
                component.set('v.manager', false);
                component.set('v.other', true);
            } else {
                this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
                component.set('v.contact', false);
                component.set('v.manager', false);
                component.set('v.other', true);
            }
            this.hideSpinner(component, event, helper);
    	});
		$A.enqueueAction(action);
    },

    generateQuoteRequestRecords: function(component, event, helper){
		var quotes = component.get('v.quoteRequestList');
		var qrecordlist = [];
		quotes.forEach(function(quote){
			var quoteRecord = {
				'sobjectType': 'Quote_Request__c',
				'State__c': quote.state,
				'Item_Name__c': quote.item_name,
				'Item_Size__c': quote.item_size,
				'Quote_Type__c': quote.quote_type,
				'Priority__c': quote.priority,
				'Item_Price__c': quote.bottle_price,
				'FOB_Calculation__c': quote.fob_price,
				'Additional_Comments__c': quote.additional_comments
			};
			qrecordlist.push(quoteRecord);
		});
		component.set('v.quoteRequestRecordList', qrecordlist);
    },

	submit: function(component, event, helper){
		if(component.get('v.quoteRequestList').length == 0){
			this.displayToast('No Quote Requests', 'Please create one or more quote requests before submitting', 'error');
		} else {
			this.generateQuoteRequestRecords(component, event, helper);
			this.submitQuoteRequests(component, event, helper);
		}
	},

    submitQuoteRequests: function(component, event, helper){
    	this.showSpinner(component, event, helper);
    	var action = component.get("c.insertNewQuoteRequest");
		action.setParams({quoteRequestList: component.get('v.quoteRequestRecordList'), 
									state: component.get('v.selectedState'),
									priority: component.get('v.priority'),
									type: component.get('v.submitterType'),
									recipient: component.get('v.recipient')
								});
		action.setCallback(this, function (data) {
            var state = data.getState();
            if(state == 'SUCCESS'){
                var requestObject = data.getReturnValue();
                var responseMap = requestObject['responseMap'];
                console.log('Response Map', responseMap);
                console.log('getUserAttributeMap Request Status', requestObject['success']);
                if('success' in requestObject && !requestObject['success']){
                    this.displayToast('Error', requestObject['message'], 'error');
                } else if('success' in requestObject && requestObject['success']){

                    component.set('v.submitted', true);
                    this.displayToast('Success', 'Quote Requests submitted successfully', 'success');
                    var quoteRequestCase = responseMap['quoteRequestCase'];
                    component.set('v.quoteRequestCase', quoteRequestCase);
                    this.open_prompt(component, event, helper); 
                } else {
                    this.displayToast('Error', 'Response status not found.');
                }
            } else if(state == 'ERROR'){
                this.displayToast('Fatal Error', 'An unexpected error occurred, the Case was not created.', 'error');
            } else {
                this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
            }
            this.hideSpinner(component, event, helper);
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
        //called on clicking your button
        //run your form render code after that, run the following lines
        this.showPopupHelper(component, 'modalprompt', 'slds-slide-up-');
        this.showPopupHelper(component,'backdrop','slds-backdrop--');
    },

	showSpinner: function(component, event, helper) {
		component.set("v.Spinner", true); 
	},

	hideSpinner: function(component, event, helper) {
	   component.set("v.Spinner", false);			
	},
})