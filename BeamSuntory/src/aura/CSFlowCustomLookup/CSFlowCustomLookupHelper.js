({
    init: function(component, event, helper) {
        var action = component.get("c.getEnvironmentUrl");

        action.setParams({});
        action.setCallback(this, function(data) {
            var state = data.getState();
            if (state == 'SUCCESS') {
                var requestObject = data.getReturnValue();
                console.log('success');
                component.set('v.baseUrl', data.getReturnValue());

            } else if (state == 'ERROR') {
                console.log('error has occured');
            }
        });
        $A.enqueueAction(action);
    },

    validateAccount: function(component, event, helper) {
        var selectedAccountLookUpRecord = component.get("v.selectedAccountLookUpRecord");
        console.log(selectedAccountLookUpRecord);
        //console.log(enableButton);
        if (selectedAccountLookUpRecord != undefined && selectedAccountLookUpRecord.hasOwnProperty('Id')) {
            component.set('v.showDisabledButton', false);
            component.set('v.showEnabledButton', true);
            component.set('v.recordId', selectedAccountLookUpRecord.Id);
        } else {
            component.set('v.showDisabledButton', true);
            component.set('v.showEnabledButton', false);
        }
    },
})