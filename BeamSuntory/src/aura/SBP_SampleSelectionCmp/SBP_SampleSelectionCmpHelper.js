({
    init: function(component, event, helper) {

    },
    getSampleRecords: function(component, event, helper) {
        var action = component.get("c.getSamples");
        console.log(component.get('v.recordId'));

        action.setParams({
            "recordId": component.get('v.recordId')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    var responseMap = retVal['responseMap'];

                    resolve(responseMap);
                } else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            reject(Error("Error message: " + errors[0].message));
                        }
                    } else {
                        reject(Error("Unknown error"));
                    }
                }
            });
            $A.enqueueAction(action);
        });
    },
    updateSampleSelection: function(component, event, helper) {
        var action = component.get("c.updateBarrelWithSelectedSample");
        console.log(component.get('v.recordId'));
        console.log(component.get('v.sampleIdSelected'));

        action.setParams({
            "recordId": component.get('v.recordId'),
            "sampleId": component.get('v.sampleIdSelected')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    var responseMap = retVal['responseMap'];

                    resolve(responseMap);
                } else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            reject(Error("Error message: " + errors[0].message));
                        }
                    } else {
                        reject(Error("Unknown error"));
                    }
                }
            });
            $A.enqueueAction(action);
        });
    },
    createCase: function(component, event, helper) {
        var action = component.get("c.createNewCase");
        console.log(component.get('v.recordId'));
        console.log(component.get('v.sampleIdSelected'));

        action.setParams({
            "recordId": component.get('v.recordId'),
            "sampleId": component.get('v.sampleIdSelected')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    var responseMap = retVal['responseMap'];

                    resolve(responseMap);
                } else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            reject(Error("Error message: " + errors[0].message));
                        }
                    } else {
                        reject(Error("Unknown error"));
                    }
                }
            });
            $A.enqueueAction(action);
        });
    },
    showToast: function(message, title, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type,
            "mode": "dismissible"
        });
        toastEvent.fire();
    },
    setColumns: function(component, event, helper) {
        var brand = component.get('v.brand');

        if (brand == 'Jim Beam') {
            component.set('v.columns', [{
                label: 'Label',
                fieldName: 'Barrel_Number__c',
                type: 'text'
            }, {
                label: 'Barreled On Date',
                fieldName: 'Barreled_Date__c',
                type: 'date'
            }]);
        } else {
            component.set('v.columns', [{
                label: 'Label',
                fieldName: 'Portal_Label__c',
                type: 'text'
            }, {
                label: 'Barreled On Date',
                fieldName: 'Barreled_Date__c',
                type: 'date'
            }]);
        }

    }
})