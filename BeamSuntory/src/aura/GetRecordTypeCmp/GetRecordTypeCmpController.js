({
    invoke: function(component, event, helper) {
        var action = component.get("c.getRecordType");

        action.setParams({
            'brand': component.get('v.brand'),
            'sObjectName': component.get('v.sObjectType'),
            'barrelType': component.get('v.barrelType')

        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var requestObject = response.getReturnValue();
                    console.log('val ', requestObject);
                    component.set('v.recordTypeId', requestObject['responseMap']['recordTypeId']);
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