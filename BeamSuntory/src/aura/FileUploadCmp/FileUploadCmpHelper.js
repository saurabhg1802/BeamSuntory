({
    getRelatedFiles: function (component, event, helper) {
        var action = component.get("c.getRelatedFiles");

        action.setParams({
            "recordId": component.get('v.recordId')
        });

        return new Promise(function (resolve, reject) {
            action.setCallback(this, function (response) {
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
    isCmpValid: function (component, event, helper) {
        component.set('v.validate', function () {
            if (helper.isFileUploaded(component, event, helper)) {
                return {
                    isValid: true
                };
            } else {
                //If the component is invalid, return the isValid parameter as false and return an error message.
                return {
                    isValid: false,
                    errorMessage: (function () {
                        helper.showToast('Please upload a file', 'Error', 'error');
                        return 'Please Upload a File';
                    })()
                };
            }
        });
    },
    isFileUploaded: function (component, event, helper) {
        var files = component.get("v.files");
        var fileRequired = component.get('v.fileRequired');
        var isValid = false
        if ((!helper.isNullOrEmpty(files) && files.length > 0) || !fileRequired) {
            return true;
        }

        return isValid;
    },
    isNullOrEmpty: function (data) {

        if (data == '' || data == null || data == undefined) {
            return true;
        }
        return false;
    },
    showToast: function (message, title, type) {
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