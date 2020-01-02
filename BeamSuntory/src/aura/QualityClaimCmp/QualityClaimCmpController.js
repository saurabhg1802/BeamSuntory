({
    init: function(component, event, helper) {
        helper.init(component, event, helper);
       	helper.setDefaultValues(component,event, helper);
       	helper.getUserInfo(component,event, helper);
    },
    handleNavigate: function(component, event, helper) {
        var isPageValid = helper.isPageValid(component, event, helper);
        if (!isPageValid) {
            helper.showToast('Invalid Fields', 'Error', 'error');
        }else{
        	helper.navigateToPage(component,event, helper);
        }
        
    },
    handleUpdateAccountId : function(component,event, helper){
    	var selectedAccountDistributorLookUpRecord = component.get('v.selectedAccountDistributorLookUpRecord');
    	var accountId = component.get('v.accountId');

    	if(helper.isNullorEmpty(accountId)){
    		component.set('v.accountId', selectedAccountDistributorLookUpRecord.Id);
    	}
    }
})