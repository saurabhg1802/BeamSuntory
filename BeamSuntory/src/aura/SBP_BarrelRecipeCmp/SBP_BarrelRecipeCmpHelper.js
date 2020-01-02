({
    init: function(component, event, helper) {},
    getRecentBarrelRecipes: function(component, event, helper) {

    },
    getStaveOptions: function(component, event, helper) {
        var action = component.get("c.getSingleBarrelStaveCustomMetadata");

        action.setParams({
            brand: component.get('v.brand')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var requestObject = response.getReturnValue();
                    console.log(requestObject);
                    var responseMap = requestObject['responseMap'];
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
    },
    

})