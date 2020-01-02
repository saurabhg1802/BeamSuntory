({
	init: function(component, event, helper){
		helper.init(component, event, helper);
	},

    open_modal :  function(component, event, helper){
        //called on clicking your button
        //run your form render code after that, run the following lines
        helper.showPopupHelper(component, 'modaldialog', 'slds-fade-in-');
        helper.showPopupHelper(component,'backdrop','slds-backdrop--');
    },

    close_modal : function(component, event, helper){
		helper.hidePopupHelper(component, event, helper, 'modaldialog', 'slds-fade-in-');
		helper.hidePopupHelper(component, event, helper, 'backdrop', 'slds-backdrop--');
	},

	clearModalValues: function(component, event, helper){
		helper.clearModalValues(component, event, helper);
	},

	assignStatePicklistValues: function(component, event, helper){
		helper.assignStatePicklistValues(component, event, helper);
	},

	createAndAddAnother: function(component, event, helper){
		var auraIdFieldNameMap = {'item_name':"Item Name", 'item_size': "Size", 'quote_type': "Quote Type", 'fob_input': "FOB"};
		var currencyValidity = helper.checkCurrencyValidity(component, event, helper);
		var invalidIdList = helper.checkModalValidity(component, event, helper);
		var hasErrors = invalidIdList.length > 0 || !currencyValidity;
		if(!hasErrors){
			helper.addPendingQuote(component, event, helper);
			helper.clearModalValues(component, event, helper);
		} else {
			//Display toast message
			var msg = "These fields are missing: [<fields>]";
			var fields = [];
			invalidIdList.forEach(function(val){
				fields.push(auraIdFieldNameMap[val]);
			});
			if(fields.length > 0){
				msg = msg.replace('<fields>', fields.join(', '));
				helper.displayToast('Missing Fields', msg, 'error');
			}
		}
	},

	createAndSubmit: function(component, event, helper){
		var auraIdFieldNameMap = {'state':"State", 'item_name':"Item Name", 'item_size': "Size", 'quote_type': "Quote Type", 'priority': "Priority"};

		var currencyValidity = helper.checkCurrencyValidity(component, event, helper);
		var invalidIdList = helper.checkFormValidity(component, event, helper);
		
		var hasErrors = invalidIdList.length > 0 || !currencyValidity;
		if(!hasErrors){
			helper.addPendingQuote(component, event, helper);
			helper.hidePopupHelper(component, event, helper, 'modaldialog', 'slds-fade-in-');
			helper.hidePopupHelper(component, event, helper, 'backdrop', 'slds-backdrop--');
			helper.submit(component, event, helper);
		} else {
			//Display toast message
			var msg = "These fields are missing: [<fields>]";
			var fields = [];
			invalidIdList.forEach(function(val){
				fields.push(auraIdFieldNameMap[val]);
			});
			if(fields.length > 0){
				msg = msg.replace('<fields>', fields.join(', '));
				helper.displayToast('Missing Fields', msg, 'error');
			}
		}
	},

	submit: function(component, event, helper){
		var auraIdFieldNameMap = {'state':"State", 'priority': "Priority"};		
		var invalidIdList = helper.checkCaseValidity(component, event, helper);
		
		var hasErrors = invalidIdList.length > 0;
		if(!hasErrors){
			helper.submit(component, event, helper);
		} else {
			var msg = "These fields are missing: [<fields>]";
			var fields = [];
			invalidIdList.forEach(function(val){
				fields.push(auraIdFieldNameMap[val]);
			});
			msg = msg.replace('<fields>', fields.join(', '));
			helper.displayToast('Missing Fields', msg, 'error');
		}
	},

	onStateChange: function(component, event, helper){
		var quoteRequests = component.get('v.quoteRequestList');
		var state = component.get('v.selectedState');
		for(var i = 0; i < quoteRequests.length; i++){
			quoteRequests[i].state = state;
		}
		component.set('v.quoteRequestList', quoteRequests);
	},

	onPriorityChange: function(component, event, helper){
		var quoteRequests = component.get('v.quoteRequestList');
		var priority = component.get('v.priority');
		for(var i = 0; i < quoteRequests.length; i++){
			quoteRequests[i].priority = priority;
		}
		component.set('v.quoteRequestList', quoteRequests);
	},

	onSubmitterTypeChange: function(component, event, helper) {
		var submitterType = component.get('v.submitterType');
		if(submitterType == 'State Manager'){
			component.set('v.contact', false);
			component.set('v.manager', true);
		} else if(submitterType == 'State Contact'){
			component.set('v.contact', true);
			component.set('v.manager', false);
			component.set('v.bottlePrice', null);
			component.set('v.fobCalculation', null);
			component.set('v.recipient', '');
		} else {
			component.set('v.contact', false);
			component.set('v.manager', false);
			component.set('v.bottlePrice', null);
			component.set('v.fobCalculation', null);
			component.set('v.recipient', '');
		}
	},

	showSpinner: function(component, event, helper) {
		helper.showSpinner(component, event, helper);
	},
    
    hideSpinner : function(component,event,helper){
		helper.hideSpinner(component, event, helper);
    },

    goToCaseList: function(component, event, helper){
		var urlEvent = $A.get("e.force:navigateToURL");
		urlEvent.setParams({
		  "url": "/case/Case/00Bo0000004izUMEAY/"
		});
		urlEvent.fire();    	
    },

    goToSpecificCase: function(component, event, helper){
		var urlEvent = $A.get("e.force:navigateToURL");
		urlEvent.setParams({
		  "url": "/case/"+component.get('v.quoteRequestCase').Id
		});
		urlEvent.fire();    	
    }
})