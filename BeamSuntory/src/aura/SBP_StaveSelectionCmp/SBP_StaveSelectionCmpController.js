({
    init: function(component, event, helper) {

        var getCaseRecordPromise = helper.getCaseRecord(component, event, helper);
        getCaseRecordPromise.then(
            $A.getCallback(function(result) {
                component.set("v.brand", result['brand']);//added for El Tesoro
                console.log('stave result ', result);
                if((result['type'] == 'Remote Selection' || result['type'] == 'Trip and Tour') && !result['barrelSelected']){
                    component.set("v.allowStaveSelection", true);
                }
                
                var getStaveOptionsPromise = helper.getStaveOptions(component, event, helper);
                return getStaveOptionsPromise;
            }),
            $A.getCallback(function(error) {
                // Something went wrong
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        ).then(
            $A.getCallback(function(result) {
                console.log(result);
                component.set("v.staveCustomMetadata", result['staves']);
                helper.buildStaveOptions(component, event, helper);

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        ).catch(function(error) {
            $A.reportError("Error Occured: ", error);
        });
        
    },
    handleNavigate: function(component, event, helper) {
        var navigate = component.get("v.navigateFlow");
        navigate(event.getParam("action"));
    },
    handleCountChange: function(component, event, helper) {
        helper.updateNumberOfStavesRemaining(component, event, helper);
    },
    handleShowStaveButtonClick: function(component, event, helper) {
        component.set('v.showStaveSelectionButton', false);
    },
    handleSubmitSelectionButtonClick: function(component, event, helper) {
        var createRecipePromise = helper.createRecipe(component, event, helper);
        createRecipePromise.then(
            $A.getCallback(function(result) {
                console.log(result);
                helper.showToast('Recipe has been created!', 'Success', 'success');
                component.set('v.allowStaveSelection', false);
                //$A.get('e.force:refreshView').fire();

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        ).catch(function(error) {
            $A.reportError("error message here", error);
        });
    }
})