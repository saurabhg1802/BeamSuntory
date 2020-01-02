({
    init: function(component, event, helper) {
        var userLocaleCountry = $A.get("$Locale.userLocaleCountry");
        helper.init(component, event, helper);
        component.set('v.currentUserCountry', userLocaleCountry);
        if (userLocaleCountry != 'US') {
            component.set('v.disabledPremise', false);
            component.set('v.renderPremise', true);
        }
        helper.setRenderedValues(component, event, helper);

    },
    togglerSpinner: function(component, event, helper) {
        helper.togglerSpinner(component, event, helper);
    },
    onPremiseAccountChange: function(component, event, helper) {
        helper.onPremiseAccountChange(component, event, helper);
    },
    onDistributorAccountChange: function(component, event, helper) {
        helper.onDistributorAccountChange(component, event, helper);
    },
    onContactLookupChange: function(component, event, helper) {
        helper.onContactLookupChange(component, event, helper);
    },
    handleNavigate: function(component, event, helper) {
        console.log('navigate');
        component.set('v.disableNext', true);
        var attendeeInfo = component.find('attendee_info');
        var navigate = component.get("v.navigateFlow");
        var action = event.getParam("action");

        if (action == 'BACK') {
            navigate(event.getParam("action"));
            return;
        }

        var validateAttendeeInfoPromise = helper.validateAttendeeInfo(component, event, helper);
        validateAttendeeInfoPromise.then(
            $A.getCallback(function(result) {
                console.log('result from attendee validation ===============================', result);
                component.set('v.attendeeInfoValid', result);
                return helper.validateAccountInfo(component, event, helper);

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                alert('An error occurred: ' + error.message);
                console.log('ERROR: ', error);
            })
        ).then(
            $A.getCallback(function(result) {
                var attendeeInfoValid = component.get('v.attendeeInfoValid');
                console.log('result from account info validation ===============================', result);
                if (result && attendeeInfoValid) {
                    return helper.updateCaseRecord(component, event, helper);
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
                console.log('result from updatecase validation ===============================', result);
                if (result['success']) {
                    navigate(event.getParam("action"));
                } else {
                    helper.showToast('An error occurred please contact the support team', 'Error', 'error');
                }

                component.set('v.disableNext', false);


            }),
            $A.getCallback(function(error) {
                // Something went wrong
                alert('An error occurred : ' + error.message);
                console.log('ERROR: ', error);
            })
        ).catch(function(error) {
            $A.reportError("error message here", error);
        });


    }
})