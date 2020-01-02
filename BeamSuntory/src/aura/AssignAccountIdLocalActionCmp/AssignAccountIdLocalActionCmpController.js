({
    invoke: function (component, event, helper) {
        var action = component.get("c.assignAccountId");

        action.setParams({
            'recordId': component.get('v.recordId'),
            'accountId': component.get('v.accountId'),
            'accountApiName': component.get('v.accountApiName')
        });

        return new Promise(function (resolve, reject) {
            action.setCallback(this, function (response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var requestObject = response.getReturnValue();
                    console.log('val ', requestObject);
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