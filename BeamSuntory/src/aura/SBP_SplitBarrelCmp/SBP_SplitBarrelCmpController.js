({
    init: function(component, event, helper) {
        helper.createSplitRowCmp(component, event, helper);
    },
    handleTextInputChange: function(component, event, helper) {
        helper.handleTextInputChange(component, event, helper);
    },
    createSplits: function(component, event, helper) {
        var rowrow = component.find('split-1');
        console.log('val ', rowrow);
        helper.resetRows(component,event, helper);
        helper.createSplitRowCmp(component, event, helper);

    },
    handleSplitBarrelRowChange: function(component, event, helper) {
        var field = event.getParam('field');
        var value = event.getParam('value');
        var action = event.getParam('action');
        var index = event.getParam('index');
        var isValid = event.getParam('isValid');

        helper.buildSplitBarrelRecordMap(component, event, helper, index, field, value, action);
        helper.setFieldValidity(component, event, helper, index, field, isValid);
    },
    handleNavigate: function(component, event, helper) {
        var createRecordsPromise = helper.createRecords(component, event, helper);
        createRecordsPromise.then(
            $A.getCallback(function(result) {
                var responseMap = result['responseMap'];
                component.set('v.barrelId', responseMap['barrelId']);
                component.set('v.splitBarrelIds', responseMap['splitBarrelIds'])
                var continueToNextPage = helper.validateRemainingAmount(component, event, helper);
                var fieldsAreValid = helper.validateFields(component, event, helper);

                if (continueToNextPage && fieldsAreValid) {
                    var navigate = component.get("v.navigateFlow");
                    navigate(event.getParam("action"));
                }

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                alert('An error occurred getting events : ' + error.message);
            })
        )
    },
    updatePercentRemaining: function(component, event, helper) {
        console.log('hherrrrrrrrrrrrrr');
    }
})