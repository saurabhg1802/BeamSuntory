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
})