({
    init: function(component, event, helper) {
        var availableActions = component.get('v.availableActions');

        var getEventsPromise = helper.getEvents(component, event, helper);
        getEventsPromise.then(
            $A.getCallback(function(result) {
                component.set("v.events", result['events']);
                component.set("v.group1", result['group1']); //added for El Tesoro
                component.set("v.group2", result['group2']); //added for El Tesoro
                console.log(result['events'].length);
                if (result['events'].length == 0) {
                    var index = availableActions.indexOf('NEXT');
                    availableActions.splice(index, 1);
                    console.log(availableActions);
                    component.set('v.availableActions', availableActions);
                }
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
        var action = component.get("c.getSeasonalEvents");

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
    insertEvent: function(component, event, helper) {
        var action = component.get("c.insertEvent");
        var eventObject = helper.buildEvent(component, event, helper);
        console.log(component.get('v.brand'));

        action.setParams({
            'sEventObj': JSON.stringify(eventObject),
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
    buildEvent: function(component, event, helper) {
        var evObj = {
            "Plant__c": component.get('v.brand'),
            "Brand__c": component.get('v.brand'),
            "Initiator__c": $A.get("$SObjectType.CurrentUser.Id"),
            "Time_Interval__c": component.get('v.selectedGroup')
        };

        return evObj;
    }
})