({
    init: function() {},
    navigateFlow: function(component, event, helper) {
        var navigate = component.get("v.navigateFlow");
        navigate(event.getParam("action"));
    },
    showNotice: function(component, event, helper, type, message, title) {
        component.find('Sample_Kit_prompt').showNotice({
            "variant": type,
            "header": title,
            "message": message
        });
    },

    saveSampleKitDetails: function(component, event, helper) {
        //var selectedItemsMap = component.get('v.selectedItemsMap');
        var action = component.get("c.updateSampleKitDetails");
        
        action.setParams({
            "sampleKitCompany": component.get('v.sampleKitCompany'),
            "sampleKitStreet": component.get('v.sampleKitStreet'),
            "sampleKitCity": component.get('v.sampleKitCity'),
            "sampleKitZip": component.get('v.sampleKitZip'),
            "sampleKitState": component.get('v.sampleKitState'),
            "sampleKitPhone": component.get('v.sampleKitPhone'),
            "caseId": component.get('v.caseId')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    console.log(response.getReturnValue());
                    var retVal = response.getReturnValue();
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
    validateSampleKitInfo: function(component, event, helper) {
        var fieldList = component.get('v.fieldList');
        var fieldIdValueMap = component.get('v.fieldIdValueMap');

        var isValid = true;

        return new Promise($A.getCallback(function(resolve, reject) {

            for (var i in fieldList) {
                var val = fieldList[i];

                var currentVal = component.get('v.' + fieldIdValueMap[val]);
                console.log(fieldIdValueMap[val]);
                console.log('value ', currentVal);
                console.log('----------------');
                if (currentVal == null || currentVal == '') {
                    isValid = false;
                    helper.showToast('Please complete missing information before going to Next Screen', 'Error', 'error');
                    resolve(isValid);
                    break;
                }
            }

            resolve(isValid);
        }));

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
    }

})