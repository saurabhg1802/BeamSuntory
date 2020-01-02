({
    init: function(component, event, helper) {
    },
    doSave: function(component, event, helper) {
        component.set('v.isLoading', true);
        if (component.find("fileId").get("v.files").length > 0) {
            helper.uploadHelper(component, event, helper);
        } else {
            alert('Please Select a Valid File');
        }

    },
    onFileChange: function(component, event, helper) {
        var uploadFile = event.getSource().get("v.files")[0].name;
        component.set('v.fileName', uploadFile);
    },
    handleValidateCode: function(component, event, helper) {
        var validateCodePromise = helper.validateCode(component, event, helper);
        validateCodePromise.then(
            $A.getCallback(function(result) {
                component.set('v.verificationCodeAccepted', result['isValidCode']);
                component.set('v.invalidCode', !result['isValidCode']);
                component.set('v.brand', result['brand']);
                component.set('v.objectType', result['object']);
            }),
            $A.getCallback(function(error) {
                // Something went wrong
                console.log('error ', error);
                var message = 'Please Contact Your System Administrator: \n\n';
                alert(message + error);
            })
        )

    }

})