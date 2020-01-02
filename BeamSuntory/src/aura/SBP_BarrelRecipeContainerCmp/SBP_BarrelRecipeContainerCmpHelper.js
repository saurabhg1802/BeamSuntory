({
    init: function(component, event, helper) {},
    getRecentBarrelRecipes: function(component, event, helper) {

    },
    getRecentRecipes: function(component, event, helper) {
        var action = component.get("c.getRecentRecipes");

        action.setParams({
            'caseId': component.get('v.caseId'),
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
    buildRecentRecipeComponents: function(component, event, helper) {
        var body = component.get('v.recentRecipesBody');
        var brand = component.get('v.brand');
        var recentRecipeMap = component.get('v.recentRecipeMap');
        var recipeToStaveMap = {};

        // clear out body
        // other methods of destorying the components did not work
        while (body.length > 0) {
            body.pop();
        }
        for (var i in recentRecipeMap) {
            console.log(recentRecipeMap[i]);
            var showNewRecipe = false;
            if (i == recentRecipeMap.length - 1) {
                showNewRecipe = true;
            }
            recipeToStaveMap[recentRecipeMap[i].Id] = recentRecipeMap[i].Staves__r;

            $A.createComponent(
                "c:SBP_BarrelRecipeCmp", {
                    "recipeName": recentRecipeMap[i].Recipe_Label__c,
                    "recipeAccount": component.get('v.accountName'),
                    "recipeCreatedDate": recentRecipeMap[i].Creation_Date__c,
                    "recipeId": recentRecipeMap[i].Id,
                    "selectedRecipe": component.getReference('v.selectedRecipe'),
                    "aura:id": recentRecipeMap[i].Id,
                    "staves": recentRecipeMap[i].Staves__r,
                    "showNewRecipe": showNewRecipe,
                    "staveCustomMetadata": component.getReference('v.staveCustomMetadata')
                },
                function(recipeBody, status, errorMessage) {
                    //Add the new button to the body array
                    if (status === "SUCCESS") {

                        body.push(recipeBody);
                        component.set("v.recentRecipesBody", body);

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

        component.set('v.recipeToStaveMap', recipeToStaveMap);


    },
    buildStaveOptions: function(component, event, helper) {
        var body = component.get('v.newBarrelRecipeBody');
        var brand = component.get('v.brand');
        var recipeToStaveMap = component.get('v.recipeToStaveMap');
        var selectedRecipeId = component.get('v.selectedRecipe');
        var staveCustomMetadata = component.get('v.staveCustomMetadata');
        var staves = component.get('v.staves');

        // clear out body
        // other methods of destorying the components did not work
        while (body.length > 0) {
            body.pop();
        }
        if (recipeToStaveMap.hasOwnProperty(selectedRecipeId)) {
            var staves = recipeToStaveMap[selectedRecipeId];
            for (var i in staves) {
                console.log('stave ', staves[i]);
                for (var x in staveCustomMetadata) {
                    if (staves[i].Type__c == staveCustomMetadata[x].Stave_Name__c) {
                        $A.createComponent(
                            "c:SBP_StaveCmp", {
                                "image": $A.get('$Resource.' + staveCustomMetadata[x].Static_Resource_Name__c),
                                "name": staveCustomMetadata[x].Stave_Name__c,
                                "maxNumberOfStaves": component.getReference("v.maxNumberOfStaves"),
                                "count": staves[i].Quantity__c,
                                "disabled": true,
                                "showImage": true
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
                }
            }
        } else {
            component.set("v.newBarrelRecipeBody", body);
            component.set('v.createNewRecipe', true);
            helper.navigateToNexPage(component, event, helper);
        }
    },
    navigateToNexPage: function(component, event, helper) {
        var navigate = component.get("v.navigateFlow");
        navigate('NEXT');
    },
    createBarrel: function(component, event, helper) {
        var action = component.get("c.createBarrelRecord");
        console.log("caseId ", component.get('v.caseId'));
        console.log("brand ", component.get('v.brand'));
        console.log("selectedRecipe ", component.get('v.selectedRecipe'));

        action.setParams({
            'caseId': component.get('v.caseId'),
            'brand': component.get('v.brand'),
            'recipe': component.get('v.selectedRecipe')
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
    handleNavigate: function(component, event, helper) {
        console.log('in navigate');
        var navigate = component.get("v.navigateFlow");
        console.log(navigate);
        navigate(event.getParam("action"));
    }
})