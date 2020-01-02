({
    init: function() {

    },
    createSplitRowCmp: function(component, event, helper) {
        var body = component.get("v.splitBarrelBody");

        while (body.length > 0) {
            body.pop();
        }

        var numberOfSplits = component.get('v.numberOfSplits');
        console.log(numberOfSplits);
        for (var i = 0; i < numberOfSplits; i++) {

            $A.createComponent(
                "c:SBP_SplitBarrelRowCmp", {
                    "splitNum": i,
                    "aura:id": 'split-' + i,
                    "runningMaxCasesAvailable": component.getReference("v.runningMaxCasesAvailable")

                },
                function(splitBarrelRow, status, errorMessage) {
                    //Add the new button to the body array
                    if (status === "SUCCESS") {
                        body.push(splitBarrelRow);
                        component.set("v.splitBarrelBody", body);
                    } else if (status === "INCOMPLETE") {
                        console.log("No response from server or client is offline.")
                            // Show offline error
                    } else if (status === "ERROR") {
                        console.log("Error: " + errorMessage);
                        // Show error message
                    }
                }
            );
        }
    },
    buildSplitBarrelRecordMap: function(component, event, helper, index, field, value, action) {
        var splitBarrelRecordsMap = component.get('v.splitBarrelRecordsMap');
        var runningTotalMap = component.get('v.runningTotalMap');

        var rowId = 'split' + index;
        console.log(field);

        if (splitBarrelRecordsMap.hasOwnProperty(rowId)) {
            // get list of all fields in map for this row
            console.log('existing value >>>>>>>>');
            if (value == null || value == '' || (Object.keys(value).length === 0 && typeof value != 'number')) {
                delete splitBarrelRecordsMap[rowId][field];
            } else {
                splitBarrelRecordsMap[rowId][field] = value;
            }
        } else {
            if (value == null || value == '') {
                delete splitBarrelRecordsMap[rowId][field];
            } else {
                splitBarrelRecordsMap[rowId] = {};
                splitBarrelRecordsMap[rowId][field] = value;
            }
        }

        // update percent map
        if (field === 'Number_of_Cases__c') {
            console.log('field is AMOUNT');
            runningTotalMap[rowId] = value;
            component.set('v.runningTotalMap', runningTotalMap);
            this.updateRemainingAmount(component, event, helper);
        }

        component.set('v.splitBarrelRecordsMap', splitBarrelRecordsMap);
    },
    createRecords: function(component, event, helper) {
        var splitBarrelRecordsMap = component.get('v.splitBarrelRecordsMap');
        var splitBarrelValidFieldsMap = component.get('v.splitBarrelValidFieldsMap');
        var action = component.get("c.insertSplitBarrelRecords");
        console.log(JSON.stringify(Object.values(splitBarrelRecordsMap)));

        action.setParams({
            "jsonBarrels": JSON.stringify(Object.values(splitBarrelRecordsMap)),
            "caseId": component.get('v.caseId')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(data) {
                var state = data.getState();
                if (state == 'SUCCESS') {
                    var returnVal = data.getReturnValue();
                    resolve(returnVal);
                    console.log(returnVal);

                } else if (state == 'ERROR') {
                    console.log(data.getError());
                } else {
                    console.log(data.getError());
                }
            });
            $A.enqueueAction(action);
        });
    },
    updateRemainingAmount: function(component, event, helper) {
        var runningTotalMap = component.get('v.runningTotalMap');
        var maxCasesAvailable = component.get('v.maxCasesAvailable');
        var allValues = Object.values(runningTotalMap);

        var total = allValues.reduce(function(acc, val) {
            if (isNaN(acc)) {
                acc = 0;
            }
            if (isNaN(val)) {
                val = 0;
            }
            return parseInt(acc, 10) + parseInt(val, 10);
        });

        if (isNaN(total)) {
            total = 0;
        }
        component.set('v.casesRemaining', maxCasesAvailable - total);
        component.set('v.runningMaxCasesAvailable', maxCasesAvailable - total);
    },
    validateRemainingAmount: function(component, event, helper) {
        var casesRemaining = component.get('v.casesRemaining');
        if (casesRemaining < 0) {
            helper.showToast('Please review your selections ', 'Error', 'error');
            return false;
        } else {
            return true;
        }
    },
    setFieldValidity: function(component, event, helper, index, field, isValid) {
        var splitBarrelValidFieldsMap = component.get('v.splitBarrelValidFieldsMap');
        var rowId = 'split' + index;
        if (splitBarrelValidFieldsMap.hasOwnProperty(rowId)) {
            splitBarrelValidFieldsMap[rowId][field] = isValid;
        } else {
            splitBarrelValidFieldsMap[rowId] = {};
            splitBarrelValidFieldsMap[rowId][field] = isValid;
        }
        component.set('v.splitBarrelValidFieldsMap', splitBarrelValidFieldsMap);
    },
    validateFields: function(component, event, helper) {
        var splitBarrelValidFieldsMap = component.get('v.splitBarrelValidFieldsMap');
        var isValid = true;
        var rows = Object.keys(splitBarrelValidFieldsMap);

        for (var i in rows) {
            var currentRow = rows[i];
            console.log('ROW ------------- ', currentRow);
            var fields = Object.keys(splitBarrelValidFieldsMap[currentRow]);

            for (var y = 0; y < fields.length; y++) {
                console.log('FIELD -------------- ,', fields[y]);
                console.log('CHECK VALIDITY ', splitBarrelValidFieldsMap[currentRow][fields[y]]);
                if (!splitBarrelValidFieldsMap[currentRow][fields[y]]) {
                    isValid = false;
                }
            }
        }

        if (!isValid) {
            helper.showToast('Please fill out all required fields', 'Error', 'error');
        }

        return isValid;
    },
    resetRows: function(component, event, helper) {
        component.set('v.splitBarrelValidFieldsMap', {});
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
    showNotice: function(component, event, helper, type, message, title) {
        component.find('stave_selection_prompt').showNotice({
            "variant": type,
            "header": title,
            "message": message
        });
    },



})