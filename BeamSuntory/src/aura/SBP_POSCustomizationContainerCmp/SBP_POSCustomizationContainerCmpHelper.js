({
    validateAuraIdMap: function(component, event, helper, attributeName) {
        var auraIdMap = component.get('v.' + attributeName);
        var missingItems = false;

        var ids = Object.keys(auraIdMap);
        console.log('ids ' + ids);

        for (var i in ids) {
            console.log(auraIdMap[ids[i]]);
            if (!auraIdMap[ids[i]]) {
                missingItems = true;
                break;
            }
        }
        return missingItems;
    },
    validateBottleTextHasBeenEntered: function(component, event, helper) {
        var bottlePlateContainer = component.find('bottle_plate_container');
        var showBottlePlatingOption = component.get('v.showBottlePlatingOption');
        // check if the bottle plate option was selected 

        return new Promise($A.getCallback(function(resolve, reject) {

            if (bottlePlateContainer != undefined) {
                // check if the bottle plate option was selected 
                if (showBottlePlatingOption) {
                    console.log('INSERTING BOTTLE TEXT-------------------------------------------------');
                    bottlePlateContainer.insertBottlePlateDetails(function(result) {
                        console.log("callback for bottle plate aura:method was executed");
                        console.log("result: " + result);
                        resolve(result);
                    });
                } else {
                    resolve(true);
                }
            } else {
                resolve(true);
            }
        }));
    },
    validatePOSItemsHaveBeenSelected: function(component, event, helper) {
        var posItemContainer = component.find('pos_container');
        var showPosItemsOption = component.get('v.showPosItemsOption');

        return new Promise($A.getCallback(function(resolve, reject) {

            if (posItemContainer != undefined) {
                // check if the bottle plate option was selected 
                if (showPosItemsOption) {
                    posItemContainer.insertPosItems(function(result) {
                        console.log("callback for pos items aura:method was executed");
                        console.log("result: " + result);
                        resolve(result);
                    });
                } else {
                    resolve(true);
                }
            } else {
                resolve(true);
            }
        }));
    },

    markStepsAsCompleted: function(component, event, helper) {
        var bottleTextValid = component.get('v.bottleTextValid');
        var showBottlePlating = component.get('v.showBottlePlating');
        var posItemsValid = component.get('v.posItemsValid');
        var showPosItems = component.get('v.showPosItems');
        var recordId;

        var action = component.get("c.updateStepsAsCompleted");

        var programType = component.get('v.programType');
        if (programType == 'Split Barrel') {
            recordId = component.get('v.splitBarrelId');
        } else {
            recordId = component.get('v.recordId');
        }


        action.setParams({
            "recordId": recordId,
            "programType": component.get('v.programType'),
            "posItemsSelected": posItemsValid && showPosItems,
            "bottlePlateTextComplete": bottleTextValid && showBottlePlating
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    console.log(retVal);
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

    isEmpty: function(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
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
    },
    handleNavigate: function(component, event, helper) {
        var navigate = component.get("v.navigateFlow");
        navigate(event.getParam("action"));
    },




})