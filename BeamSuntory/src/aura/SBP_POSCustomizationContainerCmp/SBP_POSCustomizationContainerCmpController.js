({

    markStepsAsCompleted: function(component, event, helper) {
        component.set('v.disableFinish', true);
        component.set('v.disableNext', true);
        // disable buttons 
        setTimeout(function() {
            component.set('v.disableFinish', false);
            component.set('v.disableNext', false);
        }, 4000);
        var action = event.getParam("action");
        console.log(action);

        if (action != 'BACK') {
            // update case or split barrel record
            var validatePOSItemsHaveBeenSelectedPromise = helper.validatePOSItemsHaveBeenSelected(component, event, helper);
            validatePOSItemsHaveBeenSelectedPromise.then(
                    $A.getCallback(function(result) {
                        console.log('result from pos item validation ===============================', result);
                        component.set('v.posItemsValid', result);
                        return helper.validateBottleTextHasBeenEntered(component, event, helper);

                    }),
                    $A.getCallback(function(error) {
                        // Something went wrong
                        alert('An error occurred: ' + error.message);
                        console.log('ERROR: ', error);
                    })
                ).then(
                    $A.getCallback(function(result) {
                        var isPosValid = component.get('v.posItemsValid');
                        console.log('result from bottle text validation ===============================', result);
                        component.set('v.bottleTextValid', result);
                        if (result && isPosValid) {
                            return helper.markStepsAsCompleted(component, event, helper);
                        } else {
                            helper.showToast('An error occurred please contact the support team', 'Error', 'error');
                        }
                    }),
                    $A.getCallback(function(error) {
                        // Something went wrong
                        alert('An error occurred : ' + error.message);
                        console.log('ERROR: ', error);
                    })
                ).then(
                    $A.getCallback(function(result) {
                        console.log('result from markStepsAsCompleted validation ===============================', result);
                        if (result['success']) {
                            helper.handleNavigate(component, event, helper);
                        }

                    }),
                    $A.getCallback(function(error) {
                        // Something went wrong
                        alert('An error occurred : ' + error.message);
                        console.log('ERROR: ', error);
                    })
                )
                .catch(function(error) {
                    $A.reportError("error message here", error);
                });
        } else {
            helper.handleNavigate(component, event, helper);
        }


    }
})