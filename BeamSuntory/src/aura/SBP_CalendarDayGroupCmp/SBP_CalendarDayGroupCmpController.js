({
    init: function(component, event, helper) {
        helper.init(component, event, helper);
    },
    handleOnGroupChange: function(component, event, helper) {
        var value = event.currentTarget.value;

        component.set('v.selectedGroup', value);
        console.log(value);
    },
    handleNavigate: function(component, event, helper) {

        var insertEventPromise = helper.insertEvent(component, event, helper);
        insertEventPromise.then(
            $A.getCallback(function(result) {
                component.set('v.eventId', result['newEvent'].Id);
                if (result['newEvent'].Id != null) {
                    var navigate = component.get("v.navigateFlow");
                    navigate(event.getParam("action"));
                }

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                alert('An error occurred getting events : ' + error.message);
            })
        ).catch(function(error) {
            $A.reportError("error message here", error);
        });

    },

})