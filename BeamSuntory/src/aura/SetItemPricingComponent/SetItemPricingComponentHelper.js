({
	init : function(component, event, helper) {
		this.setPlatform(component, event, helper);
		this.getQuoteRequests(component, event, helper);
		this.getCase(component, event, helper);
		console.log($A.getRoot());
	},

	setPlatform: function(component, event, helper){
		var platform = $A.get("$Browser.formFactor");
		if(platform == 'PHONE' || platform == 'TABLET'){
			component.set('v.platform', 'mobile');
		} else if(platform == 'DESKTOP'){
			component.set('v.platform', 'desktop');
		} else{
			component.set('v.platform', platform);
		}
	},

	getQuoteRequests: function(component, event, helper){
		this.showSpinner(component, event, helper);
		var action = component.get("c.getRelatedQuoteRequests");
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

                if('quoteRequestMap' in responseMap){
					var quoteList = [];
					var quoteMap = responseMap['quoteRequestMap'];
					for(var key in quoteMap){
						if(quoteMap[key].Price_Needed__c === 'Yes' && quoteMap[key].Item_Available__c === 'Yes'){
							quoteList.push(quoteMap[key]);
						}
					}
					component.set('v.quoteRequestList', quoteList);
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
		console.log('getCase');
		this.showSpinner(component, event, helper);
		var action = component.get("c.getCurrentCase");
    	action.setParams({caseId: component.get('v.recordId')});
    	action.setCallback(this, function(data){
    		var state = data.getState();
            if(state == 'SUCCESS'){
            	var requestObject = data.getReturnValue();
            	var responseMap = requestObject['responseMap'];
            	console.log('Response Map', responseMap);
                if('success' in requestObject && !requestObject['success']){
                	this.displayToast('Error', requestObject['message'], 'error');
                } else if('success' in requestObject && requestObject['success']){
					var currCase = responseMap['case'];
					component.set('v.approved', currCase.Approved__c);
					component.set('v.submitted', currCase.Submitted_Compliance__c);
					component.set('v.initComplete', true);
				} else {
                	this.displayToast('Error', 'Response status not found.');
				}
            } else if(state == 'ERROR'){
                this.displayToast('Error', 'An unexpected error occurred, the Discount Document could not be retrieved', 'error');
            } else {
                this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
            }

			this.hideSpinner(component, event, helper);
    		console.log('approved1: ' + currCase.Approved__c);
    		console.log('approved2: ' + component.get('v.approved'));
    	});
		$A.enqueueAction(action);
	},

	checkValidity: function(component, event, helper){
		var priceList = [];
		var platform = component.get('v.platform');
		if(platform == 'desktop'){
			priceList = [].concat(component.find('price_input_desktop'));
		} else if(platform == 'mobile'){
			priceList = [].concat(component.find('price_input_mobile'));
		}

		var invalidComponentList = [];
		for(var index in priceList){
			if(priceList[index].get('v.validity').valid == false){
				invalidComponentList.push(priceList[index].get('v.name'));
			}
			console.log(priceList[index].get('v.validity'));
			priceList[index].showHelpMessageIfInvalid();
		}
		return invalidComponentList;
	},

	getUnpricedItems: function(component, event, helper){
		var priceList = [];
		var platform = component.get('v.platform');
		if(platform == 'desktop'){
			priceList = [].concat(component.find('price_input_desktop'));
		} else if(platform == 'mobile'){
			priceList = [].concat(component.find('price_input_mobile'));
		}

		var unpricedItems = [];
		for(var index in priceList){
			if(priceList[index].get('v.value') == '' || priceList[index].get('v.value') == null){
				unpricedItems.push(priceList[index].get('v.name'));
			}
			console.log('price value: ', priceList[index].get('v.value'));
			console.log('price value is blank: ', priceList[index].get('v.value') == '');
			console.log('price value is null: ', priceList[index].get('v.value') == null);
		}

		return unpricedItems;
	}, 

	updateQuoteRequests: function(component, event, helper, hasUnpriced){		
		/*var quoteList = [];
		for(var quote in component.get('v.quoteRequestList')){
			if(quote.Item_Price__c != null){
				quoteList.push(quote);
			}
		}*/
		this.showSpinner(component, event, helper);
		var quoteList = component.get('v.quoteRequestList');
		var caseId = component.get('v.recordId');
		var action = component.get("c.updateQuoteRequests");
		action.setParams({quoteList: quoteList, caseId: caseId, hasUnpriced: hasUnpriced});
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
					var unpricedList = this.getUnpricedItems(component, event, helper);
					if(hasUnpriced){
						this.displayToast('Success', 'Prices Saved, '+unpricedList.length+' still unpriced', 'success');
						this.displayToast('Warning', 'The following still need pricing: ['+unpricedList.join(',')+']', 'warning', 5);
					} else if(component.get('v.approved')){
						this.displayToast('Success', 'Prices Updated', 'success');
						//Trigger update email?
					} else {
						this.displayToast('Success', 'Prices Saved', 'success');
						component.set('v.approved', true);
					}
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
            console.log('toast fired');
        } else {
            // otherwise throw an alert 
            alert(title + ': ' + message);
            console.log('alert fired');
        }
    },

	showSpinner: function(component, event, helper) {
		component.set("v.Spinner", true); 
	},
    
    hideSpinner : function(component,event,helper){
		setTimeout(function(){
			component.set("v.Spinner", false);
		}, 500);
    },
})