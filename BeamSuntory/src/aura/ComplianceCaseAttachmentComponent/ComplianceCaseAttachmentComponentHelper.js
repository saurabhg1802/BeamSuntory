({
	/*getSuggestedAttachments: function(component, event, helper){
		var recordId = component.get('v.recordId');
		var action = component.get("c.getSuggestedAttachments");
		action.setParams({ caseId: recordId });
		action.setCallback(this, function (data) {
			var suggestedAttachmentMap = data.getReturnValue();
            component.set('v.initComplete', 'true');
            component.set('v.suggestedAttachmentMap', suggestedAttachmentMap);
            component.set('v.suggestedAttachmentKeys', Object.keys(suggestedAttachmentMap));
            //this.createFileUploadComponents(component, event, helper);
		});
		$A.enqueueAction(action);
	},*/

	setSelectedAttachmentFlag: function(component, event, helper){
		var recordId = component.get('v.recordId');
		var selectedDocumentType = component.get('v.selectedDocumentType');
		var action = component.get("c.setSelectedAttachmentFlag");
		action.setParams({ caseId: recordId, documentType: selectedDocumentType });
		action.setCallback(this, function (data) {
			console.log('set flags');
		});
		$A.enqueueAction(action);
	},

	destroyChildren: function(component, event, helper){
		var dynamicAttachmentsBody = component.find("dynamic-attachments").get("v.body");
		for(var body in dynamicAttachmentsBody){
			for(var key in component.get('v.suggestedAttachmentMap')){
				if(dynamicAttachmentsBody[body].find(key)){
					dynamicAttachmentsBody[body].find(key).destroy();
				}
			}
		}
	},

	//Initializes the selectlist using values from the Schema
	//Sets the value at index 0 as "selected"
	setDocumentTypeValueList: function(component, event, helper){
		var recordId = component.get('v.recordId');
		var action = component.get("c.getDocumentTypePicklistValues");
		action.setParams({caseId: recordId});
		action.setCallback(this, function (data) {
			var documentTypeValueList = data.getReturnValue();
	        var opts = [];
	        for(var val in documentTypeValueList){
	        	opts.push({ value: documentTypeValueList[val], label: documentTypeValueList[val] })
	        }
			component.set('v.selectedDocumentType', '');	        
			component.set('v.documentTypeValueList', opts);
		});
		$A.enqueueAction(action);
	},

	//Returns the currently selected value for Document Type
	getSelectedDocumentType: function(component, event, helper){
		var selected = component.get('v.selectedDocumentType');
		console.log('Selected Value Label', selected);
		return selected;
	},

	//Retrieves the currently selected value from the select list and sets it to the selected document type attribute
	setSelectedDocumentType: function(component, event, helper){
		var documentTypeSelectList = component.find('documentTypeSelectList');
		var selected = documentTypeSelectList.get('v.value');
		console.log(selected);
		console.log('Set selectedDocumentType to ', selected);
		component.set('v.selectedDocumentType', selected);
	},

	refreshView: function(component, event, helper){
		$A.get('e.force:refreshView').fire();
	},

	setDocumentTypeForUploads: function(component, event, helper){
		var selectedDocumentType = this.getSelectedDocumentType(component, event, helper);
		var documentIdList = [];
		var files = event.getParams()['files'];
		for(var index in files){
			documentIdList.push(files[index].documentId);
		}
		console.log('Document Type', selectedDocumentType);
		console.log('Document Id List', documentIdList);

		var action = component.get("c.assignDocumentTypesAfterUpload");
		action.setParams({ documentType: selectedDocumentType, contentVersionIdList: documentIdList});
		console.log('doc id list: ' + documentIdList);
		action.setCallback(this, function (data) {
			console.log('Document Type set');
		});
		$A.enqueueAction(action);
	},
})