({
    init: function(component, event, helper) {
        helper.hideSpinner(component, event, helper);
        helper.isCmpValid(component, event, helper);
    },
    search: function(component, event, helper) {
        var isInputValid = helper.isInputValid(component, event, helper);
        var helper = this;

        if (isInputValid) {
            helper.showSpinner(component, event, helper);
            helper.buildSOQLQuery(component, event, helper);

            var getRecordsPromise = helper.getRecords(component, event, helper);
            getRecordsPromise.then(
                $A.getCallback(function(result) {
                    if (result.length == 0) {
                        helper.showToast('No Results', '', 'info');
                    } else {
                        component.set('v.data', result);
                        component.set('v.filteredData', result);
                        helper.buildRecordList(component, event, helper);
                        var elmnt = document.getElementById("mobile_results");
                        elmnt.scrollIntoView();
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
        component.set('v.filteredData', {});
        component.set('v.data', {});

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
    buildResults: function(component, event, helper) {
        var body = component.get('v.tileBody');
        var records = component.get('v.filteredData');

        while (body.length > 0) {
            body.pop();
        }
        for (var i in records) {
            $A.createComponent(
                "c:MobileSearchResultsTileCmp", {
                    "recordMap": records[i]
                },
                function(record, status, errorMessage) {
                    if (status === "SUCCESS") {
                        body.push(record);
                        component.set("v.tileBody", body);

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
    buildRecordList: function(component, event, helper) {
        var nameAttribute = component.get('v.nameAttribute');
        var filteredData = component.get('v.filteredData');
        var newList = [];

        for (var i in filteredData) {
            var currentRecord = filteredData[i];
            var apiNames = Object.keys(currentRecord);
            var fields = [];
            for (var x in apiNames) {
                var apiName = apiNames[x];

                fields.push({
                    label: apiName,
                    value: currentRecord[apiName]
                });
            }
            newList.push({
                name: currentRecord['Name'],
                fields: fields,
                record: currentRecord
            });
        }
        console.log('newList', newList);
        component.set('v.filteredData', newList);
        helper.buildResults(component, event, helper);
    },
    clearResults: function(component, event, helper) {
        var body = component.get('v.tileBody');

        while (body.length > 0) {
            body.pop();
        }
        component.set('v.tileBody', body);
    },
    collapseAccordion: function(component, event, helper) {
        component.find("accordion").set('v.activeSectionName', null);
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
    hasAccountInfoBeenEntered: function(component, event, helper) {
        var selectedAccount = component.get('v.selectedRecord');
        var locationFields = ['Name', 'Street', 'City', 'State', 'Country', 'PostalCode'];
        var accountInfoEntered = true;
        if (!helper.isNullOrEmpty(selectedAccount)) {
            if (!selectedAccount.hasOwnProperty('Id')) {
                accountInfoEntered = false;
            }
        } else {
            for (var i in locationFields) {
                var currentField = component.get('v.location' + locationFields[i]);
                if (helper.isNullOrEmpty(currentField)) {
                    accountInfoEntered = false;
                    break;
                }
            }
        }

        component.set('v.accountInfoEntered', accountInfoEntered);

        return accountInfoEntered;
    },
    isCmpValid: function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");

        component.set('v.validate', function() {
            if (helper.hasAccountInfoBeenEntered(component, event, helper)) {
                component.set('v.accountInfoEntered', true);
                return {
                    isValid: true
                };
            } else {
                //If the component is invalid, return the isValid parameter as false and return an error message.
                return {
                    isValid: false,
                    errorMessage: (function() {
                        helper.showToast('Account Information is Required', 'Error', 'error');
                        return 'Account Information is Required';
                    })()
                };
            }
        });
    },
    setLocationFields: function(component, event, helper) {
        var selectedRecord = component.get('v.selectedRecord');

        component.set('v.locationName', selectedRecord.Name);
        component.set('v.locationStreet', selectedRecord.BillingStreet);
        component.set('v.locationCity', selectedRecord.BillingCity);
        component.set('v.locationState', selectedRecord.BillingState);
        component.set('v.locationCountry', selectedRecord.BillingCountry);
        component.set('v.locationPostalCode', selectedRecord.BillingPostalCode);
        component.set('v.disabledLocationInputFields', true);

    },
    clearLocationFields: function(component, event, helper) {
        var selectedRecord = component.get('v.selectedRecord');

        component.set('v.locationNameDisabled', null);
        component.set('v.locationStreetDisabled', null);
        component.set('v.locationCityDisabled', null);
        component.set('v.locationStateDisabled', null);
        component.set('v.locationCountryDisabled', null);
        component.set('v.locationPostalCodeDisabled', null);
        component.set('v.disabledLocationInputFields', false);
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