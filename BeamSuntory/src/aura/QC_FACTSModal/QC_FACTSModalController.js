({
    init : function(component, event, helper) {
    	helper.getSelectedCases(component, event, helper);
    	helper.beginFACTSFlow(component, event, helper);
    },

    handleStatusChange : function(component, event, helper) {
    	helper.statusChange(component, event);
    },

    handleCloseModal : function(component, event, helper) {
        helper.closeModal(component, event, helper);
    },
})