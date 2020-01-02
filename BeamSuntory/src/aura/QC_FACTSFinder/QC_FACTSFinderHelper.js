({
    init: function (component, event, helper) {
        var getDataPromise = helper.getData(component, event);
        getDataPromise.then(
            $A.getCallback(function (result) {
                var responseMap = result['responseMap'];
                var caseRecord = responseMap['caseRecord'];
                var cases = responseMap['cases'];
                var incidents = responseMap['incidents'];

                component.set('v.caseRecord', caseRecord);
                if (caseRecord['Incident__c'] != null) {
                    component.set('v.caseHasIncident', true);
                }

                component.set("v.data", helper.removeCurrentCaseFromMap(component, cases, caseRecord));

                component.set("v.incidentData", incidents);

            })
        ).catch(
            function (error) {
                helper.showToast(error, 'Error', 'error');
            }
        ).finally(
            function () {
                helper.pageDoneRendering(component, event, helper);
            }
        )
    },

    removeCurrentCaseFromMap: function (component, cases, caseRecord) {
        var index = -1;
        for (var i in cases) {
            if (cases[i]['Id'] === component.get('v.recordId') || cases[i]['Id'] === caseRecord['Id']) {
                index = i;
            }
        }
        if (index > -1) {
            cases.splice(index, 1);
        }

        return cases;
    },

    setCaseTableColumns: function (component, event, helper) {
        component.set('v.columns', [{
                type: 'button-icon',
                initialWidth: 50,
                typeAttributes: {
                    title: 'View Case',
                    label: 'View Case',
                    iconName: 'utility:new_window',
                    variant: 'container'
                }
            },
            {
                label: 'Case Number',
                fieldName: 'CaseNumber',
                type: 'text',
                sortable: true
            }, //, typeAttributes: {label: {fieldName: 'CaseNumber'}}},
            {
                label: 'Lot Code',
                fieldName: 'Lot_Code__c',
                type: 'text',
                sortable: true
            },
            {
                label: 'Bottling Plant',
                fieldName: 'Bottling_Plant__c',
                type: 'text',
                sortable: true
            },
            {
                label: 'SKU',
                fieldName: 'Beam_Suntory_Item_Number__c',
                type: 'text',
                sortable: true
            },
            {
                label: 'Created Date',
                fieldName: 'CreatedDate',
                type: "date-local",
                typeAttributes: {
                    month: "2-digit",
                    day: "2-digit"
                },
                sortable: true
            },
        ]);
    },

    setIncidentTableColumns: function (component, event, helper) {
        component.set('v.incidentColumns', [{
                type: 'button-icon',
                initialWidth: 50,
                typeAttributes: {
                    title: 'View Incident',
                    label: 'View Incident',
                    iconName: 'utility:new_window',
                    variant: 'container'
                }
            },
            {
                label: 'Incident Number',
                fieldName: 'Name',
                type: 'text',
                sortable: true
            },
            {
                label: 'Lot Code(s)',
                fieldName: 'Lot_Code_s__c',
                type: "text",
                sortable: true
            },
            {
                label: 'SKU(s)',
                fieldName: 'Beam_Suntory_Item_Number__c',
                type: "text",
                sortable: true
            },
            {
                label: 'Bottling Plant(s)',
                fieldName: 'Bottling_Plant__c',
                type: "text",
                sortable: true
            },
            {
                label: 'Status',
                fieldName: 'Status__c',
                type: "text",
                sortable: true
            },
        ]);
    },

    addToIncident: function (component, event, helper) {
        if (component.get('v.selectedIncident')) {
            component.set('v.addToIncidentDisabled', true);
            var action = component.get("c.addToIncident");

            action.setParams({
                currentCaseId: component.get('v.recordId'),
                factsIncidentId: component.get('v.selectedIncident')
            });

            action.setCallback(this, function (response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var action = event.getParam('action');
                    window.open('/' + component.get('v.selectedIncident'), '_blank');
                    helper.showToast("Case successfully added to Incident.", "Success!", "success");
                } else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " +
                                errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
            });
            $A.enqueueAction(action);
        } else {
            helper.showToast("Please select an Incident.", "Error", "error");
        }
    },

    goToIncidentRecord: function (component, event) {
        var row = event.getParam('row');

        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": row.Id,
            "slideDevName": "detail"
        });
        navEvt.fire();
    },

    getData: function (component, event) {
        var action = component.get("c.loadInitialData");
        action.setParams({
            recordId: component.get('v.recordId')
        });

        return new Promise(function (resolve, reject) {
            action.setCallback(this, function (response) {
                var state = response.getState();
                var retVal = response.getReturnValue();
                if (state === "SUCCESS") {
                    console.log('Results from Apex: ', retVal);

                    // check for error from Apex Class
                    if (retVal.hasOwnProperty('success')) {
                        if (!retVal['success']) {
                            reject("Error message: " + retVal['message']);
                        }
                    }
                    resolve(retVal);

                } else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            reject("Error message: " + errors[0].message);
                        }
                    } else {
                        reject("Unknown error");
                    }
                }
            });
            $A.enqueueAction(action);
        });
    },

    buildQueryString: function (component, event) {
        var caseRecord = component.get('v.caseRecord');
        if (caseRecord['Incident__c'] != null) {
            component.set('v.queryString', '');
        } else {
            var queryString = 'SELECT CaseNumber, Id, RecordTypeId, CreatedDate, AccountId, Incident__c, Complaint_Source__c'

            var filters = component.get('v.filters');
            var needsAnd = false;
            var firstValid = true;
            var indexLastValid = 0;

            if (filters.length == 0) {
                queryString += ' ';
            }

            for (var i = 0; i < filters.length; i++) {
                queryString += ', ';
                queryString += filters[i];
                if (i == filters.length - 1) {
                    queryString += ' ';
                }
                if (caseRecord[filters[i]]) {
                    indexLastValid = i;
                }
            }
            queryString += 'FROM Case WHERE ';

            for (var j = 0; j < filters.length; j++) {
                if (caseRecord[filters[j]]) {
                    needsAnd = true;
                    if (firstValid) {
                        queryString += '(';
                        firstValid = false;
                    }
                    if (filters[j] === 'Lot_Code__c') {
                        queryString += filters[j];
                        queryString += " LIKE '";
                        if (caseRecord[filters[j]] === null) {
                            caseRecord[filters[j]] = '';
                        }
                        if (caseRecord[filters[j]].length > 0 && caseRecord[filters[j]].length < 8) {
                            queryString += caseRecord[filters[j]].substring(0, caseRecord[filters[j]].length);
                        }
                        if (caseRecord[filters[j]].length >= 8) {
                            queryString += caseRecord[filters[j]].substring(0, 8);
                        }
                        queryString += '%';
                        queryString += "'";
                    } else {
                        queryString += filters[j];
                        queryString += " = '";
                        queryString += caseRecord[filters[j]];
                        queryString += "'";
                    }
                    if (j != indexLastValid) {
                        queryString += ' OR ';
                    }
                }
            }
            if (needsAnd) {
                queryString += ') AND ';
            }
            queryString += 'RecordTypeId = ';
            queryString += "'";
            queryString += caseRecord['RecordTypeId'];
            queryString += "'";
            queryString += " AND Incident__c = NULL";
            queryString += " AND Status != 'Closed'";

            component.set('v.queryString', queryString);
        }
    },

    goToCaseRecord: function (component, event) {
        var row = event.getParam('row');

        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": row.Id,
            "slideDevName": "detail"
        });
        navEvt.fire();
    },

    toggleFilters: function (component, event) {
        var fieldMap = component.get('v.fieldMap');
        var pressedButton = event.getSource().getLocalId();

        var filters = component.get('v.filters');

        if (fieldMap[pressedButton].state) {
            fieldMap[pressedButton].state = false;
            fieldMap[pressedButton].variant = 'inverse';
            //pull api out of filters if it's there
            if (filters.includes(fieldMap[pressedButton].api)) {
                filters.splice(filters.indexOf(fieldMap[pressedButton].api), 1);
            }
        } else {
            fieldMap[pressedButton].state = true;
            fieldMap[pressedButton].variant = 'neutral';
            //push api into filters
            filters.push(fieldMap[pressedButton].api);
        }
        component.set('v.fieldMap', fieldMap);
        component.set('v.filters', filters);
    },

    createNewFACTSCall: function (component, event) {
        if (component.get('v.selected').length == 0) {
            var singleCase = component.get('v.caseRecord');
            var row = [];
            row.push(singleCase);
            component.set('v.selected', row);
        }
        component.set('v.showFlow', true);
    },

    populateSelectedRowsList: function (component, event) {
        var selectedRows = event.getParam('selectedRows');
        var setRows = [];
        for (var i = 0; i < selectedRows.length; i++) {
            setRows.push(selectedRows[i]);
        }
        setRows.unshift(component.get('v.caseRecord'));
        component.set('v.selected', setRows);
    },

    sortData: function (cmp, fieldName, sortDirection) {
        var data = cmp.get("v.data");
        var reverse = sortDirection !== 'asc';
        data.sort(this.sortBy(fieldName, reverse))
        cmp.set("v.data", data);
    },

    sortBy: function (field, reverse, primer) {
        var key = primer ?
            function (x) {
                return primer(x[field])
            } :
            function (x) {
                return x[field]
            };
        reverse = !reverse ? 1 : -1;
        return function (a, b) {
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        }
    },

    updateTableColumns: function (component, event, helper) {
        var filters = component.get('v.filters');
        var biCol = {
            type: 'button-icon',
            initialWidth: 50,
            typeAttributes: {
                title: 'View Case',
                label: 'View Case',
                iconName: 'utility:new_window',
                variant: 'container'
            }
        };
        var cnCol = {
            label: 'Case Number',
            fieldName: 'CaseNumber',
            type: 'text',
            sortable: true
        };
        //columns will be variable based on number of params passed
        var lcCol = {
            label: 'Lot Code',
            fieldName: 'Lot_Code__c',
            type: 'text',
            sortable: true
        };
        var bfCol = {
            label: 'Bottling Plant',
            fieldName: 'Bottling_Plant__c',
            type: 'text',
            sortable: true
        };
        var pCol = {
            label: 'Brand',
            fieldName: 'Brand__c',
            type: 'text',
            sortable: true
        };
        var psCol = {
            label: 'Product Size',
            fieldName: 'Product_Size__c',
            type: 'text',
            sortable: true
        };
        var skuCol = {
            label: 'SKU',
            fieldName: 'Beam_Suntory_Item_Number__c',
            type: 'text',
            sortable: true
        };
        var tCol = {
            label: 'Type',
            fieldName: 'Type',
            type: 'text',
            sortable: true
        };
        var iCol = {
            label: 'Issue',
            fieldName: 'Issue__c',
            type: 'text',
            sortable: true
        };
        var dateCol = {
            label: 'Created Date',
            fieldName: 'CreatedDate',
            type: "date-local",
            typeAttributes: {
                month: "2-digit",
                day: "2-digit"
            },
            sortable: true
        };
        //hold the columns to be included
        var columnsToSet = [];
        columnsToSet.push(biCol);
        columnsToSet.push(cnCol);

        for (var i = 0; i < filters.length; i++) {
            //now figure out which columns to include
            if (filters[i].includes('Lot_Code__c')) {
                columnsToSet.push(lcCol);
                continue;
            }
            if (filters[i].includes('Bottling_Plant__c')) {
                columnsToSet.push(bfCol);
                continue;
            }
            if (filters[i].includes('Brand__c')) {
                columnsToSet.push(pCol);
                continue;
            }
            if (filters[i].includes('Product_Size__c')) {
                columnsToSet.push(psCol);
                continue;
            }
            if (filters[i].includes('Beam_Suntory_Item_Number__c')) {
                columnsToSet.push(skuCol);
                continue;
            }
            if (filters[i].includes('Type')) {
                columnsToSet.push(tCol);
                continue;
            }
            if (filters[i].includes('Issue__c')) {
                columnsToSet.push(iCol);
                continue;
            }
        }
        if (!columnsToSet.includes(dateCol)) {
            columnsToSet.push(dateCol);
        }
        //set columns before query
        component.set('v.columns', columnsToSet);
        var updateTableDataPromise = helper.updateTableData(component, event, helper);
        updateTableDataPromise.then(
            $A.getCallback(function (result) {
                var index = -1;
                for (var i in result) {
                    if (result[i]['Id'] === component.get('v.recordId') ||
                        result[i]['Id'] === component.get('v.caseRecord')['Id']) {
                        index = i;
                    }
                }
                if (index > -1) {
                    result.splice(index, 1);
                }
                component.set('v.data', result);
            })
        );
    },

    updateTableData: function (component, event, helper) {
        var action = component.get("c.executeQuery");
        action.setParams({
            queryString: component.get('v.queryString')
        });

        return new Promise(function (resolve, reject) {
            action.setCallback(this, function (response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var casesResult = response.getReturnValue();
                    resolve(casesResult);
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

    showToast: function (message, title, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type,
            "mode": "dismissible"
        });
        toastEvent.fire();
    },
    showSpinner: function (component, event, helper) {
        var spinner = component.find("facts_spinner");
        $A.util.addClass(spinner, "slds-show");
        $A.util.removeClass(spinner, "slds-hide");
    },
    hideSpinner: function (component, event, helper) {
        var spinner = component.find("facts_spinner");
        $A.util.addClass(spinner, "slds-hide");
        $A.util.removeClass(spinner, "slds-show");
    },
    pageDoneRendering: function (component, event, helper) {
        helper.hideSpinner(component, event, helper);
        component.set('v.doneRendering', true);
    },
})