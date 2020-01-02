({
    init: function(component, event, helper) {
        helper.buildAttendeeList(component, event, helper);
        var attendeeLimit = component.get('v.attendeeLimit');
        var brand = component.get('v.brand');
        component.set('v.numberOfAttendeesLimit', attendeeLimit[brand]);
    },
    handleTextInputChange: function(component, event, helper) {
        helper.handleTextInputChange(component, event, helper);
    },
    buildAttendeeList: function(component, event, helper) {
        helper.buildAttendeeList(component, event, helper);

    },
    handleNavigate: function(component, event) {
        var navigate = component.get("v.navigateFlow");
        navigate(event.getParam("action"));
    },
    createAttendees: function(component, event, helper) {
        var params = event.getParam('arguments');
        var callback;
        if (params) {
            callback = params.callback;
        }

        var isValid = helper.checkAttendeeValidity(component, event, helper);

        if (isValid) {

            var createAttendeesPromise = helper.createAttendees(component, event, helper);
            createAttendeesPromise.then(
                $A.getCallback(function(result) {
                    if (callback) {
                        console.log('inserted bottle plate ', result);
                        callback(result['success']);
                    }
                }),
                $A.getCallback(function(error) {
                    // Something went wrong
                    var message = 'Please Contact Your System Administrator: \n\n';
                    helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
                })
            )
        } else {
            return false;
        }
    },
    clearOutAttendeeMap: function(component, event, helper) {
        component.set('v.attendeeMap', {});
        helper.buildAttendeeList(component, event, helper);
    }

})