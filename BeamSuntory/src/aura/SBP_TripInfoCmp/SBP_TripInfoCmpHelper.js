({
    getEvent: function(component, event, helper) {
        var action = component.get("c.getRelatedEvent");

        action.setParams({
            "recordId": component.get('v.recordId')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var requestObject = response.getReturnValue();
                    console.log(requestObject);
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
    showSpinner: function(component, event, helper) {
        var spinner = component.find("trip_info_spinner");
        $A.util.addClass(spinner, "slds-show");
        $A.util.removeClass(spinner, "slds-hide");
    },
    hideSpinner: function(component, event, helper) {
        var spinner = component.find("trip_info_spinner");
        $A.util.addClass(spinner, "slds-hide");
        $A.util.removeClass(spinner, "slds-show");
    },
    pageDoneRendering: function(component, event, helper) {
        helper.hideSpinner(component, event, helper);
        component.set('v.doneRendering', true);

    }
    
})