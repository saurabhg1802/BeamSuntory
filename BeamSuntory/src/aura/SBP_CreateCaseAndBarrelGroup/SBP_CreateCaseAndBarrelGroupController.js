({
    invoke: function(component, event, helper) {
        var action = component.get("c.createCaseAndBarrelGroup");

        action.setParams({
            'brand': component.get('v.brand'),
            'productType': component.get('v.productType'),
            'programType': component.get('v.programType')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var requestObject = response.getReturnValue();
                    console.log('val ', requestObject);
                    component.set('v.caseId', requestObject['responseMap']['caseId']);
                    component.set('v.barrelGroupId', requestObject['responseMap']['barrelGroupId']);
                    component.set('v.caseRecordTypeId', requestObject['responseMap']['caseRecordTypeId']);
                    
                    resolve(requestObject['responseMap']);

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
})