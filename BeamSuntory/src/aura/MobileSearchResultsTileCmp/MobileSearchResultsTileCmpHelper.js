({
	fireRecordClickEvent : function(component,event, helper) {
		// call the event   
        var compEvent = component.getEvent("selectedRecordIdEvent");
        // set the Selected item attribute
        compEvent.setParams({
        	"field" : 'Id',
        	"value" : component.get('v.recordMap').record
        });
        // fire the event  
        compEvent.fire();
	}
})