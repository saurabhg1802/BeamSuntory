({
    init: function(component, event, helper) {
        this.getOrderSteps(component, event, helper);

    },
    getOrderSteps: function(component, event, helper) {
        var action = component.get("c.getOrderSteps");
        action.setParams({
            "recordId": component.get('v.recordId'),
            "sObjectType" :component.get('v.sObjectType')
        });
        action.setCallback(this, function(data) {
            var state = data.getState();
            if (state == 'SUCCESS') {
                var requestObject = data.getReturnValue();
                var responseMap = requestObject['responseMap'];
                //console.log('Response Map', responseMap);
                if ('success' in requestObject && !requestObject['success']) {}

                component.set('v.currentRecord', responseMap['record']);
                console.log(responseMap['steps']);

            } else if (state == 'ERROR') {
                console.log(data.getError());
                //this.displayToast('Fatal Error', 'An unexpected error occurred, the Case was not created.', 'error');
            } else {
                //this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
                console.log(data.getError());
            }
        });
        $A.enqueueAction(action);
    },
})