({
    init: function(component, event, helper) {
        var getCaseRecordPromise = helper.getCaseRecord(component, event, helper);
        getCaseRecordPromise.then(
            $A.getCallback(function(result) {
                console.log('case ', result);

                component.set('v.case', result['case']);
                if(result['case']['Type'] == 'Remote Selection'){
                    component.set('v.showComponent', true);
                }
                component.set('v.showInput', result['showInput']);
                component.set('v.dateStatus', result['dateStatus']);

                if (result['showInput']) {
                    return helper.getRejectedSelectionDates(component, event, helper);
                }

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        ).then(
            $A.getCallback(function(result) {
                console.log(result['caseHistory']);
                component.set('v.caseHistory', result['caseHistory']);
            }),
            $A.getCallback(function(error) {
                // Something went wrong
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        )
    },
    handleButtonClick: function(component, event, helper) {
        var updateCaseRecordPromise = helper.updateCaseRecord(component, event, helper);
        updateCaseRecordPromise.then(
            $A.getCallback(function(result) {
            	helper.showToast('Date has been requested!','Success', 'success');
            	component.set('v.showInput', false);
            	component.set('v.dateStatus', 'Pending Approval');

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        );
    }
})