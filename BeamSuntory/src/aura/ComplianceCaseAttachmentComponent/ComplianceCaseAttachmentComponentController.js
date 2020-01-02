({
	init: function (component, event, helper) {
		//helper.getSuggestedAttachments(component, event, helper);
		helper.setDocumentTypeValueList(component, event, helper);
	},

	reinit: function(component, event, helper){
		//helper.destroyChildren(component, event, helper);
		//helper.getSuggestedAttachments(component, event, helper);
		helper.setDocumentTypeValueList(component, event, helper);		
	},

	handleUploadFinished : function(component, event, helper) {
		helper.setDocumentTypeForUploads(component, event, helper);
		helper.setSelectedAttachmentFlag(component, event, helper);
		helper.refreshView(component, event, helper);
	},

	setSelectedDocumentType: function(component, event, helper){
		helper.setSelectedDocumentType(component, event, helper);
	}
})