({
    init: function(component, event, helper) {
        var getPicklistValuesPromise = helper.getPicklistValues(component, event, helper);
        getPicklistValuesPromise.then(
            $A.getCallback(function(result) {
                helper.buildPicklistOptions(component, 'productSizeOptions', result['productSize'], true);
                helper.buildPicklistOptions(component, 'issueTypeOptions', component.get('v.issueTypeValues'), true);
                helper.buildPicklistOptions(component, 'consumerIssueTypeOptions', component.get('v.consumerIssueTypeValues'), true);
                helper.buildPicklistOptions(component, 'sourceOfComplaintOptions', component.get('v.sourceOfComplaintValues'), false);
                
                helper.pageDoneRendering(component, event, helper);
            })
        );
    },
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
    buildPicklistOptions: function(component, targetAttribute, values, addNoneValue) {
        var options = [];
        if (values.length >= 1 && addNoneValue) {
            options.push({
                'label': '--None--',
                'value': null
            });
        }
        for (var i in values) {
            options.push({
                'label': values[i],
                'value': values[i]
            });
        }
        component.set('v.' + targetAttribute, options);
    },
    isPageValid: function(component, event, helper) {
        var fieldTypes = ['textField', 'emailField', 'phoneField', 'dropdownField', 'radioGroupField'];
        var allFieldsValid = true;
        for (var i in fieldTypes) {
            var isValid = helper.validateFields(component, event, helper, fieldTypes[i]);
            if (!isValid) {
                allFieldsValid = false
            }
        }

        return allFieldsValid;
    },
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
    isBeamInternalUser: function(component, event, helper) {
        var userEmail = $A.get("$SObjectType.CurrentUser.Email");
        console.log(userEmail);
        return userEmail.includes('beamsuntory.com');
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
    }
})