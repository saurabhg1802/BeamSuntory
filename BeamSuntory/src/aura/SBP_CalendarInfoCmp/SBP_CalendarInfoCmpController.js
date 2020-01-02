({
    init: function(component, event, helper) {

    },
    openModal: function(component, event, helper) {
        var day = component.get('v.selectedDay');
        var month = component.get('v.selectedMonth');
        var year = component.get('v.selectedYear');
        var dateVal = new Date(year, month - 1, day);

        component.set('v.selectedDate', dateVal);

        console.log(dateVal);

        if (dateVal.getDay() == 1 || dateVal.getDay() == 2) {
            component.set('v.showBoxedLunches', true);
        }
        helper.openModal(component, event);

    },
    closeModal: function(component, event, helper) {
        helper.closeModal(component, event);
        helper.resetModal(component,event, helper);
    },
    handleNavigate: function(component, event, helper) {

        var insertEventPromise = helper.insertEvent(component, event, helper);
        insertEventPromise.then(
            $A.getCallback(function(result) {
                if (result['newEvent'].Id != null) {
                    console.log('closing modal');

                    component.set('v.eventId', result['newEvent'].Id);
                    var updateCaseRecordPromise = helper.updateCaseRecord(component, event, helper);
                    return updateCaseRecordPromise;
                }

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                alert('An error occurred : ' + error.message);
            })
        ).then(
            $A.getCallback(function(result) {
                console.log(result);
                helper.closeModal(component, event);
                component.set('v.moveToNextScreen', true);
            }),
            $A.getCallback(function(error) {
                // Something went wrong
                alert('An error occurred : ' + error.message);
            })
        ).catch(function(error) {
            $A.reportError("error message here", error);
        });

    },
})