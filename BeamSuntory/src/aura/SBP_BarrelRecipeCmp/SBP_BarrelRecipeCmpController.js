({
    init: function(component, event, helper) {
        var getStaveOptionsPromise = helper.getStaveOptions(component, event, helper);
        getStaveOptionsPromise.then(
            $A.getCallback(function(result) {
                component.set("v.staveCustomMetadata", result['staves']);
            }),
            $A.getCallback(function(error) {
                // Something went wrong
                alert('An error occurred getting events : ' + error.message);
            })
        ).catch(function(error) {
            $A.reportError("error message here", error);
        });
    },
    handleNavigate: function(component, event, helper) {
        var navigate = component.get("v.navigateFlow");
        navigate(event.getParam("action"));
    },
    handleClick: function(component, event, helper) {
        var recipe = component.get('v.recipeId');
        var val = event.currentTarget.dataset.val;

        if (val == 'new_recipe') {
            component.set('v.selectedRecipe', null);
        } else {
            component.set('v.selectedRecipe', recipe);
        }

    }
})