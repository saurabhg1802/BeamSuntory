({
	doInit : function(component, event, helper) {
        helper.init(component, event, helper);
	},

	handleChange : function(component, event, helper) {
		var selectedOptionsList = event.getParam("value");
	    var selectedString = selectedOptionsList.join(';');  
	    component.set("v.selectedString", selectedString);
	    component.set("v.selected", selectedOptionsList);
	    helper.setValidity(component, event, helper);
	},

	handleBrandStringChange : function(component, event, helper) {
        helper.updateBrandString(component, event, helper);
    }
})