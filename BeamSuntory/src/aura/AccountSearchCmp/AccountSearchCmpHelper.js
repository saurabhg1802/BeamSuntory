({
    init: function(component, event, helper) {
        helper.showSpinner(component, event, helper);
        helper.setDataTableColumns(component, event, helper);

        var loadRecentRecordsPromise = helper.loadRecentRecords(component, event, helper);
        loadRecentRecordsPromise.then(
            $A.getCallback(function(result) {
                component.set('v.recentRecords', result);
                component.set('v.filteredRecentRecords', result);
                helper.hideSpinner(component, event, helper);
            })
        ).catch(
            function(error) {
                var errorDetail;
                if (error.hasOwnProperty('message')) {
                    errorDetail = error.message;
                } else {
                    errorDetail = error;
                }
                console.log('Error ', error);
                console.log('Error Message ', errorDetail);
                helper.showToast(errorDetail, 'Error', 'error', 'sticky');
            }
        ).finally(
            function() {
                helper.pageDoneRendering(component, event, helper);
            }
        )

    },
    loadRecentRecords: function(component, event, helper) {
        var action = component.get("c.searchForRecentRecords");

        action.setParams({
            "userId": $A.get("$SObjectType.CurrentUser.Id"),
            "recordTypeDevNames": component.get('v.recordTypeNames')
        });

        return helper.callAction(component, action);
    },
    search: function(component, event, helper) {
        var isInputValid = helper.isInputValid(component, event, helper);
        var device = $A.get("$Browser.formFactor");
        var helper = this;

        if (isInputValid) {
            helper.showSpinner(component, event, helper);
            helper.setActiveTab(component, event, helper, 'All Accounts');
            helper.buildSOQLQuery(component, event, helper);

            var getRecordsPromise = helper.getRecords(component, event, helper);
            getRecordsPromise.then(
                $A.getCallback(function(result) {
                    if (result.length == 0) {
                        helper.showToast('No Results', '', 'info');
                        component.set('v.data', {});
                        component.set('v.filteredData', {});
                    } else {
                        component.set('v.data', result);
                        component.set('v.filteredData', result);
                        helper.hideSpinner(component, event, helper);
                    }
                })
            ).catch(
                function(error) {
                    var errorDetail;
                    if (error.hasOwnProperty('message')) {
                        errorDetail = error.message;
                    } else {
                        errorDetail = error;
                    }
                    console.log('Error ', error);
                    console.log('Error Message ', errorDetail);
                    helper.showToast(errorDetail, 'Error', 'error', 'sticky');
                }
            ).finally(
                function() {
                    helper.pageDoneRendering(component, event, helper);
                }
            )
        }
    },
    getRecords: function(component, event, helper) {
        var action = component.get("c.searchForRecordsSOQL");

        action.setParams({
            "searchQuery": component.get('v.searchQueryString')
        });

        return helper.callAction(component, action);
    },
    filterCurrentListOfRecords: function(component, event, helper) {
        var data = component.get('v.data');
        var records;
        var filteredRecordAttribute;
        var searchTerm = component.get('v.searchTerm');
        searchTerm = searchTerm.trim().replace(/\*/g).toLowerCase();
        var filteredRecords = [];
        var selectedTab = component.get('v.selectedTab');
        var recordAttribute;
        var numOfRecords;
        console.log('search term ', searchTerm);

        helper.showLoadingIcon(component, event, helper);
        helper.showSpinner(component, event, helper);
        if (!helper.isSearchInputValid(component, event, helper)) {
            helper.hideSpinner(component, event, helper);
            return;
        }

        // Cancel previous timeout if any
        let searchTimeout = component.get('v.searchTimeout');
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // find active tab
        if (selectedTab == 'My Recent Accounts') {
            recordAttribute = 'recentRecords';
            filteredRecordAttribute = 'filteredRecentRecords';
        } else if (selectedTab == 'All Accounts') {
            recordAttribute = 'data';
            filteredRecordAttribute = 'filteredData';
        }

        records = component.get('v.' + recordAttribute);
        numOfRecords = records.length;

        // if searchTerm is blank then pull in previously queried records
        if (searchTerm == '' || searchTerm == null || searchTerm.length < 2) {
            component.set('v.searchTimeout', null);
            component.set('v.' + filteredRecordAttribute, records);
            helper.hideSpinner(component, event, helper);
            return;
        }
        // Set new timeout
        searchTimeout = window.setTimeout(
            $A.getCallback(() => {
                // filter recent records
                console.log('In Set Timeout');
                console.time('search time');

                for (var i = 0; i < numOfRecords; i++) {
                    var name = records[i].Name;
                    var lowerCaseVal = name.trim().replace(/\*/g).toLowerCase();
                    if (lowerCaseVal.indexOf(searchTerm) !== -1) {
                        filteredRecords.push(records[i]);
                        continue;
                    }
                }

                component.set('v.' + filteredRecordAttribute, filteredRecords);
                console.timeEnd('search time');

                helper.hideSpinner(component, event, helper);
                // Clear timeout
                component.set('v.searchTimeout', null);
            }),
            500 // Wait for 500 ms before sending search request
        );
        component.set('v.searchTimeout', searchTimeout);
    },
    setSOQLQueryString: function(component, event, helper) {
        var fieldApiMap = component.get('v.fieldApiMap');
        var apiNames = Object.keys(fieldApiMap);
        var queryString = '';

        for (var i in apiNames) {
            var apiName = apiNames[i];
            var fieldVal = component.get('v.' + fieldApiMap[apiName]);
            fieldVal = fieldVal.replace("'", "\\\'");

            if (!helper.isNullOrEmpty(fieldVal)) {
                var fieldQuery;
                if (queryString.length >= 1) {

                    queryString += ' AND ';
                    fieldQuery = apiName + ' LIKE ' + '\'' + fieldVal.trim().replace(/\*/g).toLowerCase() + '%' + '\'';
                    queryString += fieldQuery;
                } else {
                    fieldQuery = apiName + ' LIKE ' + '\'' + fieldVal.trim().replace(/\*/g).toLowerCase() + '%' + '\'';
                    queryString += fieldQuery;
                }
            }
        }

        return queryString;
    },
    buildSOQLQuery: function(component, event, helper) {
        var searchTerm = helper.setSOQLQueryString(component, event, helper);
        var recordTypeCondition = helper.addRecordTypesToQuery(component, event, helper);
        //console.log(searchTerm);
        var query = "SELECT Id" +
            ", Name" +
            ", BillingStreet" +
            ", BillingCity" +
            ", BillingState" +
            ", BillingPostalCode" +
            ", BillingCountry FROM Account where " + searchTerm + " AND " + recordTypeCondition + " LIMIT 50";

        console.log(query);

        component.set('v.searchQueryString', query);
        return searchTerm;
    },
    showSpinner: function(component, event, helper) {
        var spinner = component.find("loadingSpinner");
        $A.util.removeClass(spinner, "slds-hide");
    },
    hideSpinner: function(component, event, helper) {
        var spinner = component.find("loadingSpinner");
        $A.util.addClass(spinner, "slds-hide");
    },
    pageDoneRendering: function(component, event, helper) {
        helper.hideSpinner(component, event, helper);
        component.set('v.doneRendering', true);
    },
    sortData: function(component, fieldName, sortDirection, attribute) {
        var data = component.get("v." + attribute);
        var reverse = sortDirection !== 'asc';
        //sorts the rows based on the column header that's clicked
        data.sort(this.sortBy(fieldName, reverse))
        component.set("v." + attribute, data);
    },
    sortBy: function(field, reverse, primer) {
        var key = primer ?
            function(x) {
                return primer(x[field])
            } :
            function(x) {
                return x[field]
            };
        //checks if the two rows should switch places
        reverse = !reverse ? 1 : -1;
        return function(a, b) {
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        }
    },

    updateColumnSorting: function(component, event, helper, attribute) {
        var fieldName = event.getParam('fieldName');
        var sortDirection = event.getParam('sortDirection');
        // assign the latest attribute with the sorted column fieldName and sorted direction
        component.set("v.sortedBy", fieldName);
        component.set("v.sortedDirection", sortDirection);
        helper.sortData(component, fieldName, sortDirection, attribute);
    },
    getActiveTabRecordsAttribute: function(component, event, helper) {
        var selectedTab = component.get('v.selectedTab');
        var attribute;

        if (selectedTab == 'My Recent Accounts') {
            attribute = 'recentRecords';
        } else if (selectedTab == 'All Accounts') {
            attribute = 'data';
        }
        return attribute;
    },
    isSearchInputValid: function(component, event, helper) {
        var searchCmp = component.find('enter_search');
        var isValid = true;
        if (searchCmp) {
            searchCmp.showHelpMessageIfInvalid();
            isValid = searchCmp.get('v.validity').valid;
        }

        return isValid;
    },
    showLoadingIcon: function(component, event, helper) {
        component.set('v.isSearching', true);
    },
    clearFilterValues: function(component, event, helper) {
        var fieldApiMap = component.get('v.fieldApiMap');
        var apiNames = Object.keys(fieldApiMap);
        for (var i in apiNames) {
            var apiName = apiNames[i];
            component.set('v.' + fieldApiMap[apiName], '');
        }
    },
    clearSearchResults: function(component, event, helper) {
        component.set('v.filteredData', null);
        component.set('v.data', null);
        component.set('v.filteredDataSize', 0);
    },
    setActiveTab: function(component, event, helper, tab) {
        component.set('v.selectedTab', tab)
    },
    isNullOrEmpty: function(data) {
        if (data == '' || data == null || data == undefined) {
            return true;
        }
        return false;
    },
    isInputValid: function(component, event, helper, fieldType) {
        var fieldApiMap = component.get('v.fieldApiMap');
        var apiNames = Object.keys(fieldApiMap);
        var isValid = false;

        for (var i in apiNames) {
            var apiName = apiNames[i];
            var fieldVal = component.get('v.' + fieldApiMap[apiName]);

            if (!helper.isNullOrEmpty(fieldVal)) {
                isValid = true;
                break;
            }
        }

        return isValid;
    },
    showToast: function(message, title, type, mode) {
        var toastEvent = $A.get("e.force:showToast");

        if (this.isNullOrEmpty(toastEvent)) {
            alert(message);
        } else {
            toastEvent.setParams({
                "title": title,
                "message": message,
                "type": type,
                "mode": mode || "dismissible"
            });
            toastEvent.fire();
        }
    },
    addRecordTypesToQuery: function(component, event, helper) {
        var recordTypeNames = component.get('v.recordTypeNames');
        var queryCondition = '(';

        for (var i = 0; i < recordTypeNames.length; i++) {
            if (recordTypeNames.length == 1) {
                queryCondition += 'RecordType.DeveloperName = ' + '\'' + recordTypeNames[i] + '\'' + ') ';
            } else if ((recordTypeNames.length - 1) != i) {
                queryCondition += 'RecordType.DeveloperName = ' + '\'' + recordTypeNames[i] + '\'' + ' OR ';
            } else {
                queryCondition += 'RecordType.DeveloperName = ' + '\'' + recordTypeNames[i] + '\'' + ')';
            }
        }
        return queryCondition;
    },

    setDataTableColumns: function(component, event, helper) {
        component.set('v.columns', [{
            label: '',
            type: 'button-icon',
            initialWidth: 50,
            typeAttributes: {
                label: 'Select',
                iconName: 'utility:add',
                variant: 'brand',
                name: 'select_account',
                title: 'Select Account'
            }
        }, {
            label: 'Name',
            fieldName: 'Name',
            type: 'text',
            sortable: true
        }, {
            label: 'Street',
            fieldName: 'BillingStreet',
            type: 'text',
            sortable: true
        }, {
            label: 'City',
            fieldName: 'BillingCity',
            type: 'text',
            sortable: true
        }, {
            label: 'State',
            fieldName: 'BillingState',
            type: 'text',
            sortable: true
        }, {
            label: 'Country',
            fieldName: 'BillingCountry',
            type: 'text',
            sortable: true
        }]);
    },

    callAction: function(component, action, callback) {
        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
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
    }
})