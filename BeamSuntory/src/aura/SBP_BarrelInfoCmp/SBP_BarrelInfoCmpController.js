({
    init: function(component, event, helper) {
        var getEventPromise = helper.getEvent(component, event, helper);
        getEventPromise.then(
            $A.getCallback(function(result) {
                component.set('v.relatedRecordId', result['recordId']);
                helper.pageDoneRendering(component,event, helper);
            }),
            $A.getCallback(function(error) {
                // Something went wrong
                console.log('An Error Occured: ', error);
            })
        );
    },
    navigateToRecord: function(component, event, helper) {
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": component.get("v.relatedRecordId"),
            "slideDevName": "related"
        });
        navEvt.fire();
    },

})