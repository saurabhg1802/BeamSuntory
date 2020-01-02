({
    init: function() {},
    navigateFlow: function(component, event, helper) {
        var navigate = component.get("v.navigateFlow");
        navigate(event.getParam("action"));
    },
    showNotice: function(component, event, helper, type, message, title) {
        component.find('barrel_selection_prompt').showNotice({
            "variant": type,
            "header": title,
            "message": message
        });
    },

    createBarrel: function(component, event, helper) {
        //var selectedItemsMap = component.get('v.selectedItemsMap');
        var action = component.get("c.createBarrelRecord");

        action.setParams({
            "caseId": component.get('v.caseId'),
            "brand": component.get('v.brand'),
            "flavor": component.get('v.flavor')
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
})