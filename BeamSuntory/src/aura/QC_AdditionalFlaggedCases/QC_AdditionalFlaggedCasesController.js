({
	init : function(component, event, helper) {
        helper.setColumns(component, event, helper);
        helper.init(component, event, helper);
	},

	handleAddCases : function(component, event, helper) {
        var addAdditionalCasesPromise = helper.addAdditionalCases(component, event);
        addAdditionalCasesPromise.then(
            $A.getCallback(function(result) {
            	component.set('v.loaded', true);
        		helper.showToast('Cases were successfully added to the FACTS call.', 'Success!', 'success');
        		//helper.setDatatableInfo(component, event, helper);
                helper.setRemainingCases(component, event, helper);
            })
        );
	},

	handleRowAction : function(component, event, helper) {
        helper.goToCaseRecord(component, event);
    },

	updateSelected : function(component, event, helper) {
		var selectedRows = event.getParam('selectedRows');
		component.set('v.selectedCases', selectedRows);
	}
})