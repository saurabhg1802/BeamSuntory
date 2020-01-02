({
    handleFile : function(component, event, helper) {
    	helper.uploadHelper(component, event, helper);
    	if (!component.get("v.displayFileIcon") && component.get('v.files').length > 0) {
    		component.set("v.filename", component.get('v.files')[0][0].name);
    		component.set("v.displayFileIcon", true);
    	}
    },

    handleClick : function(component, event, helper) {
    	component.set("v.files", []);
    	component.set("v.displayFileIcon", false);
    },

    handleNavigate : function(component, event, helper) { 
        helper.navigateToNext(component, event, helper);
    }
})