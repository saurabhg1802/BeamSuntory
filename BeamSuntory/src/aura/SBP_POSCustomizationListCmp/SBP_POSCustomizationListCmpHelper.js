({
    fetchData: function(component, event, helper) {
        var action = component.get("c.getPOSRecords");

        action.setParams({
            "recordId": component.get('v.recordId')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var requestObject = response.getReturnValue();
                    var responseMap = requestObject['responseMap'];

                    component.set('v.data', responseMap['posItems']);
                    component.set('v.doneRendering', true);
                    resolve(responseMap);

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
    }
})