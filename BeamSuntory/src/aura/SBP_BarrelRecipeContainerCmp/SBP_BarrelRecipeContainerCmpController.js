({
    init: function(component, event, helper) {
        var getRecentRecipesPromise = helper.getRecentRecipes(component, event, helper);
        getRecentRecipesPromise.then(
            $A.getCallback(function(result) {
                component.set("v.recentRecipeMap", result['recipes']);
                component.set("v.accountName", result['accountName']);
                helper.buildRecentRecipeComponents(component, event, helper);
            }),
            $A.getCallback(function(error) {
                // Something went wrong
                alert('An error occurred getting events : ' + error.message);
            })
        ).catch(function(error) {
            $A.reportError("error message here", error);
        });
    },
    handleRecipeChange: function(component, event, helper) {
        helper.buildStaveOptions(component, event, helper);
    },
    handleNavigate: function(component, event, helper) {
        var createBarrelPromise = helper.createBarrel(component, event, helper);
        createBarrelPromise.then(
            $A.getCallback(function(result) {
                console.log(result);
                component.set('v.barrelId', result['barrelId']);
                helper.handleNavigate(component, event, helper);
            }),
            $A.getCallback(function(error) {
                // Something went wrong
                alert('An error occurred getting events : ' + error.message);
            })
        ).catch(function(error) {
            $A.reportError("error message here", error);
        });

    }
})