({
	init : function(component, event, helper) {
		console.log('init');
		helper.init(component, event, helper);
	},

    onClickClose : function(component, event, helper){
    	helper.close_modal(component, event, helper);
	},

	onClickApprove: function(component, event, helper){
		console.log('approve clicked');
		helper.recordResponseToCase(component, event, helper, 'approved');
	},

	onClickReject: function(component, event, helper){
		console.log('reject clicked');
		helper.open_modal(component, event, helper);
	},

	onClickFinish: function(component, event, helper){
		console.log('finish clicked');
		helper.recordResponseToCase(component, event, helper, 'rejected');
		helper.close_modal(component, event, helper);
	},
})