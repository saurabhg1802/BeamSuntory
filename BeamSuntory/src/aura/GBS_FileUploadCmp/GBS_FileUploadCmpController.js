({
    init: function(component, event, helper) {
        helper.getRelatedFiles(component, event, helper);
    },
    handleUploadFinished: function(component, event, helper) {
        // This will contain the List of File uploaded data and status
        helper.getRelatedFiles(component, event, helper);
        //$A.get('e.force:refreshView').fire();
    },
    openSingleFile: function(component, event, helper) {
        var fileId = event.getSource().get("v.value");
        $A.get('e.lightning:openFiles').fire({
            recordIds: [fileId]
        });
    },
    handleNavigate: function(component, event, helper) {
        var isPageValid = helper.isPageValid(component, event, helper);
        if (!isPageValid) {
            helper.showToast(component.get('v.attachmentRequiredMessage'), 'Error', 'error');
        } else {
            helper.navigateToPage(component, event, helper);
        }

    },
    validateCaseType: function(component, event, helper) {
        var recordType = component.get("v.caseRecord.RecordType.Name");
        var category = component.get("v.caseRecord.Category_1__c");
        if (recordType === "OTC Billing" && category === "Credit Request") {
           component.set("v.displayResource", true);
        }
    }
})