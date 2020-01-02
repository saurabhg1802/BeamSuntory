({
    init: function (component, event, helper) {

        var getRecordPromise = helper.getRecord(component, event, helper);
        getRecordPromise.then(
            $A.getCallback(function (result) {
                component.set('v.relatedRecordId', result['relatedRecordId']);
                helper.parseStringToList(component, event, helper);
                helper.pageDoneRendering(component, event, helper);
            }),
            $A.getCallback(function (error) {
                // Something went wrong
                console.log('An Error Occured: ', error);
            })
        );

    },
    navigateToRecord: function (component, event, helper) {
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": component.get("v.relatedRecordId"),
            "slideDevName": "related"
        });
        navEvt.fire();
    },
    handleUpdate: function (component, event, helper) {
        helper.showToast('Record Updated', 'Success', 'success');
    },
    handleSuccess: function (component, event, helper) {
        var payload = event.getParams().response;
    }

})