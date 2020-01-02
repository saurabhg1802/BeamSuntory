({
	init : function(component, event, helper) {
		helper.init(component, event, helper);
	},

    onClickClose : function(component, event, helper){
    	helper.close_modal(component, event, helper);
	},

	onClickApprove: function(component, event, helper){
		console.log('approve clicked');
		console.log(component.get("v.approvalStatus"));
		console.log(component.get("v.discountDocumentId"));
		console.log(component.get("v.discountVersionId"));
		console.log(component.get("v.changeDescription"));
		helper.recordApprovalStatus(component, event, helper, true);
	},

	onClickReject: function(component, event, helper){
		console.log('reject clicked');
		helper.open_modal(component, event, helper);
	},

	onClickFinish: function(component, event, helper){
		console.log('finish clicked');
		helper.recordApprovalStatus(component, event, helper, false);
		helper.close_modal(component, event, helper);
	},
})