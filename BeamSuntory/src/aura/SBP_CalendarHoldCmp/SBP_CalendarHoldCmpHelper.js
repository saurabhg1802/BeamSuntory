({
    init: function(component, event, helper) {
        var getEventsPromise = helper.getEvents(component, event, helper);
        getEventsPromise.then(
            $A.getCallback(function(result) {
                var eventsList = result['events'];
                eventsList.sort(function(a, b) {
                    if (a.dateVal < b.dateVal) {
                        return -1;
                    }

                    if (a.dateVal > b.dateVal) {
                        return 1;
                    }

                    return 0;
                });
                component.set("v.events", eventsList);
            }),
            $A.getCallback(function(error) {
                // Something went wrong
                alert('An error occurred getting events : ' + error.message);
            })
        ).catch(function(error) {
            $A.reportError("error message here", error);
        });
    },
    getEvents: function(component, event, helper) {
        var action = component.get("c.getOnHoldDates");

        action.setParams({
            'brand': component.get('v.brand')
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
    openModal: function(component, event, helper) {
        var modal = component.find('calendar_info');
        modal.openModal();
    },


})