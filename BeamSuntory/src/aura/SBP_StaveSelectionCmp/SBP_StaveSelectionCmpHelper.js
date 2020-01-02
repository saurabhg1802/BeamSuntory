({
    init: function(component, event, helper) {},
    getRecentBarrelRecipes: function(component, event, helper) {

    },
    getStaveOptions: function(component, event, helper) {
        var action = component.get("c.getSingleBarrelStaveCustomMetadata");

        action.setParams({
            "brand": component.get('v.brand')
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
    buildStaveOptions: function(component, event, helper) {
        var body = component.get('v.newBarrelRecipeBody');
        var brand = component.get('v.brand');
        var staveCustomMetadata = component.get('v.staveCustomMetadata');

        // clear out body
        // other methods of destorying the components did not work
        while (body.length > 0) {
            body.pop();
        }
        for (var i in staveCustomMetadata) {
            console.log(staveCustomMetadata[i]);
            $A.createComponent(
                "c:SBP_StaveCmp", {
                    "image": $A.get('$Resource.' + staveCustomMetadata[i].Static_Resource_Name__c),
                    "showImage": false,
                    "name": staveCustomMetadata[i].Stave_Name__c,
                    "numberOfStavesLeft": component.getReference('v.numberOfStavesLeft'),
                    "disabled": false,
                    "runningTotalMap": component.getReference('v.runningTotalMap')
                },
                function(recipeBody, status, errorMessage) {
                    //Add the new button to the body array
                    if (status === "SUCCESS") {

                        body.push(recipeBody);
                        component.set("v.newBarrelRecipeBody", body);

                    } else if (status === "INCOMPLETE") {
                        console.log("No response from server or client is offline.")
                            // Show offline error
                    } else if (status === "ERROR") {
                        console.log("Error: " + errorMessage);
                        // Show error message
                    }
                }
            );
        }
    },
    updateNumberOfStavesRemaining: function(component, event, helper) {
        var maxNumberOfStaves = component.get('v.maxNumberOfStaves');
        var runningTotalMap = component.get('v.runningTotalMap');
        var numberOfStavesLeft = component.get('v.numberOfStavesLeft')
        var allValues = Object.values(runningTotalMap);

        var allQuantities = allValues.map(function(value) {
            return value.Quantity__c;
        });

        var total = allQuantities.reduce(function(acc, val) {
            //console.log('acc ', acc);
            //console.log('val ', val);
            if (isNaN(acc)) {
                acc = 0;
            }
            if (isNaN(val)) {
                val = 0;
            }
            return parseInt(acc, 10) + parseInt(val, 10);
        });
        component.set('v.numberOfStavesLeft', maxNumberOfStaves - total);
    },
    createRecipe: function(component, event, helper) {
        var action = component.get("c.createBarrelRecipe");
        var staveMap = component.get('v.runningTotalMap');
        console.log('JSON ', JSON.stringify(Object.values(staveMap)));

        action.setParams({
            "jsonRecipe": JSON.stringify(Object.values(staveMap)),
            "caseId": component.get('v.recordId')
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
    getCaseRecord: function(component, event, helper) {
        var action = component.get("c.getCase");

        action.setParams({
            "recordId": component.get('v.recordId'),
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var requestObject = response.getReturnValue();
                    component.set("v.brand", response['brand']);//added for El Tesoro
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
    showNotice: function(component, event, helper, type, message, title) {
        component.find('stave_selection_prompt').showNotice({
            "variant": type,
            "header": title,
            "message": message
        });
    },
})