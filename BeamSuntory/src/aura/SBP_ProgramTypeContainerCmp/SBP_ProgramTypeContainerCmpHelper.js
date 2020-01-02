({
    createProgramTypeComp: function(component, event, helper) {
        var body = component.get("v.programTypeBody");
        var showRecipes = component.get('v.showRecipes');

        // clear out body
        // other methods of destorying the components did not work
        while (body.length > 0) {
            body.pop();
        }

        var currentBrand = component.get('v.currentBrandObj');

        var count = 0;
        for (var i in currentBrand.programTypes) {
            if (!showRecipes && currentBrand.programTypes[i] == 'Recent Recipes') {
                continue;
            }
            console.log(currentBrand.programTypes[i]);
            $A.createComponent(
                "c:SBP_ProgramTypeCmp", {
                    "staticResourceName": currentBrand.staticResourceName,
                    "index": count,
                    "brand": currentBrand.label,
                    "programType": currentBrand.programTypes[i],
                    "aura:id": currentBrand.label + '-' + currentBrand.programTypes[i],
                    "auraId": currentBrand.label + '-' + currentBrand.programTypes[i],
                    "isNationalAccount": component.get('v.isNationalAccount')
                },
                function(newProgramType, status, errorMessage) {
                    //Add the new button to the body array
                    if (status === "SUCCESS") {

                        body.push(newProgramType);
                        component.set("v.programTypeBody", body);

                        //helper.toggleFadeIn(component, event, helper, programTypeAuraId);
                    } else if (status === "INCOMPLETE") {
                        console.log("No response from server or client is offline.")
                            // Show offline error
                    } else if (status === "ERROR") {
                        console.log("Error: " + errorMessage);
                        // Show error message
                    }
                }
            );
            count++;
        }
    },

    getImages: function(component, event, helper) {
        var action = component.get("c.getSingleBarrelImages");
        var showRecipes = component.get('v.showRecipes');
        var accountId = component.get('v.accountId');
        console.log('accountId' , accountId);

        action.setParams({
            "userId": $A.get("$SObjectType.CurrentUser.Id"),
            "caseId" : component.get('v.caseId'),
            "acctId" : accountId
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    resolve(retVal['responseMap']);

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
    setSelectedBrand: function(component, event, helper) {
        var selectedBrand = component.get('v.selectedBrand');
        var brandMap = component.get('v.brandMap');
        console.log('selected Brand ', selectedBrand);
        console.log('brandMap ', brandMap);
        console.log('currentObj ', brandMap[selectedBrand]);

        component.set('v.currentBrandObj', brandMap[selectedBrand]);
    },
    removeProgramTypeClass: function(component, event, helper) {
        var lastProgramTypeAuraId = component.get('v.selectedProgramTypeAuraId');
        $A.util.removeClass(component.find(lastProgramTypeAuraId), 'selected-program-type');
    },
    getCase: function(component, event, helper) {
        var action = component.get("c.getCaseRecord");

        action.setParams({
            "caseId": component.get('v.caseId')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    resolve(retVal['responseMap']);

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
        component.find('program_type_container_prompt').showNotice({
            "variant": type,
            "header": title,
            "message": message
        });
    },



})