({
	init : function(component, event, helper) {
		helper.init(component, event, helper);
	},

	togglePriceNeededRadioGroup: function(component, event, helper){
		helper.togglePriceNeededRadioGroup(component, event, helper);
	},

	availabilityChange: function(component, event, helper){
		helper.updateAvailability(component, event, helper);
	},

	pricingChange: function(component, event, helper){
		helper.updatePricing(component, event, helper);
	},

	updateQuotes: function(component, event, helper){
		var itemsWithErrors = helper.checkValidity(component, event, helper);
		var items = itemsWithErrors.join(', ');
		var hasErrors = itemsWithErrors.length > 0;
		var hasUnavailable = helper.checkReasonsUnavailable(component, event, helper);
		if(hasErrors){
    		helper.displayToast('Error', 'The following item(s) must be corrected before submission: [<items>].'.replace('<items>', items), 'error');
		} else if(component.get('v.numberOfItemsUnvailable') > 0){
			helper.open_prompt(component, event, helper);
		} else {
			helper.updateQuotes(component, event, helper);
		}
	},

	onUnavailabilityReasonChange: function(component, event, helper){

	},

    open_prompt: function(component, event, helper){
    	helper.open_prompt(component, event, helper);
    },

    close_prompt: function(component, event, helper){
    	var hasErrors = helper.checkReasonValidity(component, event, helper);
    	if(!hasErrors){
	    	helper.close_prompt(component, event, helper);
	    	helper.updateQuotes(component, event, helper);
    	}
    }
})