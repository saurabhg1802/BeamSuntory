({
	init : function(component, event, helper) {
		helper.init(component, event, helper);
	},

	handleNext: function(component, event, helper){
		helper.showSpinner(component, event, helper);		
		var pageNumber = component.get('v.breadcrumbPageCount');
		if(pageNumber===1){
			var pageOneValidity = helper.checkPageOneValidity(component, event, helper);
			if(pageOneValidity.length > 0){
				var fieldLabelList = helper.getFieldLabelList(component, event, helper, pageOneValidity);
				helper.displayMissingFieldToast(component, event, helper, fieldLabelList);
			} else {
				pageNumber++;
				component.set('v.breadcrumbPageCount', pageNumber);
			}
		} else if(pageNumber===2){
			pageNumber++;
			component.set('v.breadcrumbPageCount', pageNumber);
		} else if(pageNumber===3){
			pageNumber++;
			component.set('v.breadcrumbPageCount', pageNumber);
		}
		helper.hideSpinner(component, event, helper);
	},

	handlePrevious: function(component, event, helper){
		helper.showSpinner(component, event, helper);		
		var pageNumber = component.get('v.breadcrumbPageCount');
		pageNumber--;
		component.set('v.breadcrumbPageCount', pageNumber);
		helper.hideSpinner(component, event, helper);
	},

	handleFinish: function(component, event, helper){
		helper.createInquiryCase(component, event, helper);
	},

	uploadFile: function(component, event, helper){
    	var documentIdList = component.get('v.attachmentIdList');
    	var files = event.getParams()['files'];
		for(var index in files){
			documentIdList.push(files[index].documentId);
		}
		component.set('v.attachmentIdList', documentIdList);
		helper.getUploadedDocumentData(component, event, helper, documentIdList);
	},

	removeAttachment: function(component, event, helper){
		var docId = event.getSource().get('v.name');
		helper.removeAttachmentFromList(component, event, helper, docId);
		console.log('clicked remove');
	},

    goToCaseList: function(component, event, helper){
		var urlEvent = $A.get("e.force:navigateToURL");
		urlEvent.setParams({
		  "url": "/case/Case/00Bo0000004izUMEAY/"
		});
		urlEvent.fire();
    },

    goToSpecificCase: function(component, event, helper){
		var urlEvent = $A.get("e.force:navigateToURL");
		urlEvent.setParams({
		  "url": "/case/"+component.get('v.inquiryCase').Id
		});
		urlEvent.fire();
    }
})