({
    init: function(component, event, helper) {
        helper.getRelatedFiles(component, event, helper);
    },
    handleUploadFinished: function(component, event) {
        // This will contain the List of File uploaded data and status
        //helper.getRelatedFiles(component, event, helper);
        $A.get('e.force:refreshView').fire();
    },
    openSingleFile: function(component, event, helper) {
    	var fileId = event.getSource().get("v.value");
        $A.get('e.lightning:openFiles').fire({
            recordIds: [fileId]
        });
    },
})