({
	init : function(component, event, helper) {
		helper.init(component, event, helper);
		console.log('init');
	},

	submit: function(component, event, helper){
		var invalidList = helper.checkValidity(component, event, helper);
		var unpricedList = helper.getUnpricedItems(component, event, helper);
		var hasErrors = invalidList.length > 0;
		var hasUnpriced = unpricedList.length > 0;
		if(hasErrors){
			var msg = 'These items are missing prices: [<items>]';
			var prices = invalidList.join(', ');
			msg = msg.replace('<items>', prices);
			helper.displayToast('Error', msg, 'error');
		} else {
			helper.updateQuoteRequests(component, event, helper, hasUnpriced);
		}
	},

	locChange: function(component, event, helper) {
		console.log('nav away');
	}
})