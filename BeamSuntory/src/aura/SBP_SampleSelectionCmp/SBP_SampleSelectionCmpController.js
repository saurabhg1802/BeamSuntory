({
    init: function(component, event, helper) {
        var getSampleRecordsPromise = helper.getSampleRecords(component, event, helper);
        getSampleRecordsPromise.then(
            $A.getCallback(function(result) {
                component.set('v.data', result['samples']);
                component.set('v.sampleSelected', result['sampleSelected']);
                component.set('v.caseType', result['caseType']);
                helper.setColumns(component, event, helper);
                component.set('v.doneRendering', true);

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                alert('An error occurred getting samples : ' + error.message);
            })
        );
    },
    updateSelectedText: function(component, event, helper) {
        var selectedRows = event.getParam('selectedRows');
        console.log(selectedRows);
        for (var i = 0; i < selectedRows.length; i++) {
            console.log('You selected: ' + selectedRows[i].Barrel__c);
            component.set('v.sampleIdSelected', selectedRows[i].Id);
            component.set('v.sampleBarrelIdSelected', selectedRows[i].Barrel__c);
        }
    },
    handleMakeSampleSelection: function(component, event, helper) {
        var selectedSample = component.get('v.sampleIdSelected');
        var areSamplesLeft = component.get('v.areSamplesLeft');

        if (selectedSample == null || selectedSample == '') {
            helper.showToast('Please select a sample', '', 'error');
            return;
        }
        console.log('ARE SAMPLES LEFT ', areSamplesLeft);

        if (areSamplesLeft) {
            var createCasePromise = helper.createCase(component, event, helper);
            createCasePromise.then(
                $A.getCallback(function(result) {
                    console.log('barrel Cloned ', result);
                    component.set('v.areSamplesLeft', result['areSamplesLeft']);
                    var navigate = component.get("v.navigateFlow");
                    navigate(event.getParam("action"));
                }),
                $A.getCallback(function(error) {
                    // Something went wrong
                    alert('An error occurred getting events : ' + error.message);
                })
            );
        } else {
            var updateSampleSelectionPromise = helper.updateSampleSelection(component, event, helper);
            updateSampleSelectionPromise.then(
                $A.getCallback(function(result) {
                    console.log('barrel Cloned ', result);
                    component.set('v.areSamplesLeft', result['areSamplesLeft']);
                    var navigate = component.get("v.navigateFlow");
                    navigate(event.getParam("action"));
                }),
                $A.getCallback(function(error) {
                    // Something went wrong
                    alert('An error occurred getting events : ' + error.message);
                })
            );
        }
    }


})