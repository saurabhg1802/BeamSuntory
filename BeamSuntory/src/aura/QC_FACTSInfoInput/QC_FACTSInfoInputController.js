({
    init : function(component, event, helper) {
        helper.doInit(component, event, helper);
    },
    
	handleNavigate : function(component, event, helper) {
        var isPageValid = helper.isPageValid(component, event, helper);
        if (!isPageValid) {
            helper.showToast('Invalid Fields', 'Error', 'error');
        }
        else {
        	helper.navigateToPage(component, event, helper);
        }  
    },

    handleComboboxSelected : function(component, event, helper) {
        helper.doComboboxSelect(component, event, helper);
    },
})