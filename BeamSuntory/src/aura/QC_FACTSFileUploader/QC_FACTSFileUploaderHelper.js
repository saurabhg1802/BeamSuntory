({
	uploadHelper : function(component, event, helper) {
        if (component.get("v.filename")) {
            component.set("v.displayFileIcon", false);
        }
		var file = component.get("v.files")[0][0];
        if (!file.name.includes(".csv")) {
            helper.showToast('The file must be a .csv file. Please try again.', 'Error.', 'error');
            component.set("v.files", []);
            component.set("v.displayFileIcon", false);
        }
        else {
            var reader = new FileReader();
        	reader.onload = $A.getCallback(function() {
                var fileContents = reader.result;
                component.set("v.fileString", fileContents);
            });
            reader.readAsText(file);
        }
	},

    navigateToNext : function(component, event, helper) {
        //if theres not a file, just go to next screen in flow
        if (!component.get("v.fileString")) {
            var navigate = component.get("v.navigateFlow");
            navigate(event.getParam("action"));
        }
        //otherwise, parse the file
        else {
            component.set('v.loaded', false);
            //check below
            component.set('v.fileDisabled', true);
            component.set('v.removeDisabled', true);
            var parseFileAndNavigatePromise = helper.parseFileAndNavigate(component, event);
            parseFileAndNavigatePromise.then(
                $A.getCallback(function(result) {
                    helper.showToast('File Uploaded.', 'Success!', 'success');
                    component.set('v.loaded', true);
                    var navigate = component.get("v.navigateFlow");
                    navigate(event.getParam("action"));
                })
            );
        }
    },

    parseFileAndNavigate : function(component, event) {

        var action = component.get("c.parseFile");

        action.setParams({ s : component.get("v.fileString"), parentIncId : component.get("v.parentIncidentId") });
        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    resolve(response.getReturnValue());
                }
                else if (state === "ERROR") {
                    helper.showToast('There was an error uploading the file. Please try again.', 'Error.', 'error');
                }
            });
            $A.enqueueAction(action);
        });
    },

	showToast : function(message, title, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type,
            "mode": "dismissible"
        });
        toastEvent.fire();
    },
})