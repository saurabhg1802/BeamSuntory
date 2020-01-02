({
    init: function(component, event, helper) {

    },
    handleAddBarrel: function(component, event, helper) {
        var createCasePromise = helper.createCase(component, event, helper);
        createCasePromise.then(
            $A.getCallback(function(result) {
                component.set('v.caseId', result['newCase']);
                component.set('v.case', result['case']);
                component.set('v.recordTypeId', result['recordTypeId']);
                helper.createNewRecord(component, event, helper);
            }),
            $A.getCallback(function(error) {
                // Something went wrong
                alert('An error occurred getting events : ' + error.message);
            })
        )
    }



})