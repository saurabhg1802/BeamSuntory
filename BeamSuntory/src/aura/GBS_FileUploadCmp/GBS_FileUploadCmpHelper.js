({
    getRelatedFiles: function(component, event, helper) {
        var action = component.get("c.getRelatedFiles");

        action.setParams({
            "recordId": component.get('v.recordId')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    component.set('v.files', retVal['responseMap']['files']);
                    console.log(retVal['responseMap']['files']);

                    resolve(retVal);

                } else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            reject(Error("Error message: " + errors[0].message));
                        }
                    } else {
                        reject(Error("Unknown error"));
                    }
                }
            });
            $A.enqueueAction(action);
        });
    },
    isPageValid: function(component, event, helper) {
        var fileRequired = component.get('v.required');
        var files = component.get('v.files');
        var isValid = true;

        if (files.length == 0 && fileRequired) {
            isValid = false;
        }

        return isValid;
    },
    showToast: function(message, title, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type,
            "mode": "dismissible"
        });
        toastEvent.fire();
    },
    navigateToPage: function(component, event, helper) {
        var navigate = component.get("v.navigateFlow");
        var action = event.getParam("action");

        navigate(event.getParam("action"));
    },
})