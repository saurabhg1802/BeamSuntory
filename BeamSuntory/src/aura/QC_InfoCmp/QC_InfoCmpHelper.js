({
    init: function(component, event, helper) {
        var getPicklistValuesPromise = helper.getPicklistValues(component, event, helper);
        getPicklistValuesPromise.then(
            $A.getCallback(function(result) {
                var responseMap = result['responseMap'];
                var picklistMap = responseMap['picklistFields'];
                helper.buildPicklistOptions(component, 'productSizeOptions', picklistMap['productSize']);
                helper.buildPicklistOptions(component, 'bottlingPlantOptions', picklistMap['bottlingPlant']);
                helper.setDefaultValues(component, event, helper);

                return helper.getUserInfo(component, event, helper);
            })
        ).then(
            $A.getCallback(function(result) {
                var responseMap = result['responseMap'];
                var userInfo = responseMap['userInfo'];
                component.set('v.userInfo', responseMap['userInfo']);
                component.set('v.isBailmentUser', userInfo['isBailmentUser__c']);
                helper.setLookupVisibility(component, helper, userInfo);
                helper.isBeamInternalUser(component,event, helper);

                helper.setVisibleFields(component, event, helper);
                helper.setRequiredFields(component, event, helper);
                helper.setAccountRecordTypeNames(component, event, helper);
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
    // get picklist options for drop down fields in the form
    getPicklistValues: function(component, event, helper) {
        var action = component.get("c.getPicklistOptions");
        return helper.callAction(component, action);
    },
    // pull in the user info to determine if the user has a contact record
    // associated to them
    getUserInfo: function(component, event, helper) {
        var action = component.get("c.getUserInformation");

        action.setParams({
            userId: $A.get("$SObjectType.CurrentUser.Id")
        });

        return helper.callAction(component, action);
    },
    // creates valid options from the picklist values for the lightning components
    buildPicklistOptions: function(component, targetAttribute, values) {
        var options = [];

        for (var i in values) {
            options.push({
                'label': values[i],
                'value': values[i]
            });
        }
        component.set('v.' + targetAttribute, options);
    },
    isPageValid: function(component, event, helper) {
        var fieldTypes = component.get('v.fieldTypes');
        var sourceOfComplaint = component.get('v.sourceOfComplaint');
        var allFieldsValid = true;

        for (var i in fieldTypes) {
            var isValid = helper.validateFields(component, event, helper, fieldTypes[i]);
            if (!isValid) {
                allFieldsValid = false;
            }
        }
        if (sourceOfComplaint != 'Consumer') {
            if (!helper.valdiateQuantityType(component, event, helper)) {
                allFieldsValid = false
            }
            if (!helper.hasAccountInfoBeenEntered(component, event, helper)) {
                allFieldsValid = false;
            }
        }

        return allFieldsValid;
    },
    // validates the page by looping through all fields for a particular field type
    validateFields: function(component, event, helper, fieldType) {
        var fields = component.find(fieldType);
        var allValid = true;
        if (fields == undefined) {
            return true;
        }
        if (fields.length > 1) {
            allValid = fields.reduce(function(validSoFar, inputCmp) {
                inputCmp.showHelpMessageIfInvalid();
                return validSoFar && inputCmp.get('v.validity').valid;
            }, true);
        } else {
            allValid = component.find(fieldType).get('v.validity').valid;
        }

        return allValid;
    },
    // quantity type consists of 2 fields, bottles and cases
    // only only one needs to be filled out, but in some instances
    // both can be selected
    valdiateQuantityType: function(component, event, helper) {
        var numberOfBottles = component.get('v.numberOfBottles');
        var numberOfBottlesCmp = component.find('number_of_bottles');
        var numberOfCases = component.get('v.numberOfCases');
        var numberOfCasesCmp = component.find('number_of_cases');

        if (helper.isNullOrEmpty(numberOfBottles) && helper.isNullOrEmpty(numberOfCases)) {
            helper.showToast('Please enter number of bottles or cases.', 'Error', 'error');
            numberOfBottlesCmp.setCustomValidity('A quantity for Bottles or Cases is required');
            numberOfCasesCmp.setCustomValidity('A quantity for Bottles or Cases is required');
            component.find('number_of_bottles').reportValidity();
            component.find('number_of_cases').reportValidity();
            return false;
        }
        return true;
    },
    showSpinner: function(component, event, helper) {
        var spinner = component.find("quality_claim_spinner");
        $A.util.addClass(spinner, "slds-show");
        $A.util.removeClass(spinner, "slds-hide");
    },
    hideSpinner: function(component, event, helper) {
        var spinner = component.find("quality_claim_spinner");
        $A.util.addClass(spinner, "slds-hide");
        $A.util.removeClass(spinner, "slds-show");
    },
    pageDoneRendering: function(component, event, helper) {
        helper.hideSpinner(component, event, helper);
        component.set('v.doneRendering', true);
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
    navigateToPage: function(component, event, helper) {
        var navigate = component.get("v.navigateFlow");
        var action = event.getParam("action");

        navigate(event.getParam("action"));
    },
    setDefaultValues: function(component, event, helper) {
        helper.defaultHealthConcern(component, event, helper);
    },
    defaultHealthConcern: function(component, event, helper) {
        var issueType = component.get('v.issueType');
        var issueTypeDefinition = component.get('v.issueTypeDefinition');

        switch (issueType) {
            case 'Liquid':
                if (issueTypeDefinition == 'Foreign Object' || issueTypeDefinition == 'Allergy') {
                    component.set('v.healthConcern', true);
                    component.set('v.healthConcernDisabled', true);
                }
                break;
        }
    },
    isNullOrEmpty: function(data) {
        if (data == '' || data == null || data == undefined) {
            return true;
        }
        return false;
    },
    setVisibleFields: function(component, event, helper) {
        var fieldMap = component.get('v.fieldMap');
        var sourceOfComplaint = component.get('v.sourceOfComplaint');
        var visiblityArray = fieldMap[sourceOfComplaint]['visible'];

        for (var i in visiblityArray) {
            component.set('v.' + i, visiblityArray[i]);
        }
    },
    setRequiredFields: function(component, event, helper) {
        var fieldMap = component.get('v.fieldMap');
        var sourceOfComplaint = component.get('v.sourceOfComplaint');
        var requiredArray = fieldMap[sourceOfComplaint]['required'];

        for (var i in requiredArray) {
            component.set('v.' + i, requiredArray[i]);
        }
    },
    assignLocationFields: function(component, event, helper) {
        var selectedAccount = component.get('v.selectedAccount');

        component.set('v.locationName', selectedAccount.Name);
        component.set('v.locationStreet', selectedAccount.BillingStreet);
        component.set('v.locationCity', selectedAccount.BillingCity);
        component.set('v.locationState', selectedAccount.BillingState);
        component.set('v.locationCountry', selectedAccount.BillingCountry);
        component.set('v.locationPostalCode', selectedAccount.BillingPostalCode);

        helper.disableLocationFields(component, event, helper, true);
    },
    disableLocationFields: function(component, event, helper, disabledValue) {
        component.set('v.locationNameDisabled', disabledValue);
        component.set('v.locationStreetDisabled', disabledValue);
        component.set('v.locationCityDisabled', disabledValue);
        component.set('v.locationStateDisabled', disabledValue);
        component.set('v.locationCountryDisabled', disabledValue);
        component.set('v.locationPostalCodeDisabled', disabledValue);
    },
    assignAccountId: function(component, event, helper) {
        var selectedAccount = component.get('v.selectedAccount');
        component.set('v.accountId', selectedAccount.Id);
    },
    setAccountRecordTypeNames: function(component, event, helper) {
        var recordTypeNameMap = component.get('v.recordTypeNameMap');
        var sourceOfComplaint = component.get('v.sourceOfComplaint');

        component.set('v.recordTypeNames', recordTypeNameMap[sourceOfComplaint]);
    },
    hasAccountInfoBeenEntered: function(component, event, helper) {
        var selectedAccount = component.get('v.selectedAccount');
        var accountInfoEnteredCmp = component.get('v.accountInfoEntered');
        var locationFields = ['Name', 'Street', 'City', 'State', 'Country', 'PostalCode'];
        var accountInfoEntered = true;

        if (accountInfoEnteredCmp) {
            return true;
        }

        if (!helper.isNullOrEmpty(selectedAccount)) {
            if (!selectedAccount.hasOwnProperty('Id')) {
                helper.showToast('Account Information is Required', 'Error', 'error');
                accountInfoEntered = false;
            }
        } else {
            for (var i in locationFields) {
                var currentField = component.get('v.location' + locationFields[i]);
                if (helper.isNullOrEmpty(currentField)) {
                    helper.showToast('Account Information is Required', 'Error', 'error');
                    accountInfoEntered = false;
                    break;
                }
            }
        }

        return accountInfoEntered;
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
    },
    setLookupVisibility: function(component, helper, userInfo) {
        var userEmail = $A.get("$SObjectType.CurrentUser.Email");

        if (!helper.isNullOrEmpty(userInfo['ContactId'])) {
            component.set('v.showDistibutorLookup', true);
        } else {
            component.set('v.showAccountSearchModalCmp', userEmail.includes('beamsuntory.com'));
        }
    },
    isBeamInternalUser: function(component, event, helper) {
        var userEmail = $A.get("$SObjectType.CurrentUser.Email");
        component.set('v.isBeamInternal', userEmail.includes('beamsuntory.com'));
    },


})