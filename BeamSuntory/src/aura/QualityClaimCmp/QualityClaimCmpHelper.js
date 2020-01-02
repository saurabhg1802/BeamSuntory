({
    init: function(component, event, helper) {
        var getPicklistValuesPromise = helper.getPicklistValues(component, event, helper);
        getPicklistValuesPromise.then(
            $A.getCallback(function(result) {
                helper.buildPicklistOptions(component, 'productSizeOptions', result['productSize']);
                helper.pageDoneRendering(component, event, helper);
            })
        );
    },
    // get picklist options for drop down fields in the form
    getPicklistValues: function(component, event, helper) {
        var action = component.get("c.getPicklistOptions");

        action.setParams({});

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    resolve(retVal);

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
    // pull in the user info to determine if the user has a contact record
    // associated to them
    getUserInfo: function(component, event, helper) {
        var action = component.get("c.getUserInformation");

        action.setParams({
            userId: $A.get("$SObjectType.CurrentUser.Id")
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    var responseMap = retVal['responseMap'];
                    component.set('v.userInfo', responseMap['userInfo']);
                    resolve(retVal);

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
        var numberOfCases = component.get('v.numberOfCases');
        var numberOfBottles = component.get('v.numberOfBottles');

        if (helper.isNullOrEmpty(numberOfBottles) && helper.isNullOrEmpty(numberOfCases)) {
            helper.showToast('Please enter number of bottles or cases.', 'Error', 'error');
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
    // is the object empty
    isEmpty: function(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
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

        if (issueType == 'Liquid' && issueTypeDefinition == 'Foreign Object') {
            component.set('v.healthConcern', true);
        }
    },
    isNullOrEmpty: function(data) {

        if (data == '' || data == null || data == undefined) {
            return true;
        }
        return false;
    }
})