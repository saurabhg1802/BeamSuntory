({
    init: function (component, event, helper) {
        var options = component.get('v.options');
        if (!helper.isNullOrEmpty(options)) {
            helper.pageDoneRendering(component, event, helper);
            return;
        }
        var getPicklistValuesPromise = helper.getPicklistValues(component, event, helper);
        getPicklistValuesPromise.then(
            $A.getCallback(function (result) {
                var responseMap = result['responseMap'];
                helper.buildPicklistOptions(component, 'options', responseMap['picklistValues']);
            })
        ).catch(
            function (error) {
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
            function () {
                helper.pageDoneRendering(component, event, helper);
            }
        )
    },
    // get picklist options for drop down fields in the form
    getPicklistValues: function (component, event, helper) {
        var action = component.get("c.getPicklistOptions");
        action.setParams({
            fieldApiName: component.get('v.dropDownApiName'),
            objectApiName: component.get('v.objectApiName')
        });
        return helper.callAction(component, action);
    },
    // creates valid options from the picklist values for the lightning components
    buildPicklistOptions: function (component, targetAttribute, valueMap) {
        var options = [];
        var keys = Object.keys(valueMap);

        for (let val of valueMap) {
            options.push({
                'label': val.label,
                'value': val.value
            });
        }
        component.set('v.' + targetAttribute, options);
    },
    isPageValid: function (component, event, helper) {
        var fieldTypes = component.get('v.fieldTypes');
        var allFieldsValid = true;

        for (var i in fieldTypes) {
            var isValid = helper.validateFields(component, event, helper, fieldTypes[i]);
            if (!isValid) {
                allFieldsValid = false;
            }
        }

        return allFieldsValid;
    },
    // validates the page by looping through all fields for a particular field type
    validateFields: function (component, event, helper, fieldType) {
        var fields = component.find(fieldType);
        var allValid = true;
        if (fields == undefined) {
            return true;
        }
        if (fields.length > 1) {
            allValid = fields.reduce(function (validSoFar, inputCmp) {
                inputCmp.showHelpMessageIfInvalid();
                return validSoFar && inputCmp.get('v.validity').valid;
            }, true);
        } else {
            allValid = component.find(fieldType).get('v.validity').valid;
        }

        return allValid;
    },

    showSpinner: function (component, event, helper) {
        var spinner = component.find("quality_claim_spinner");
        $A.util.addClass(spinner, "slds-show");
        $A.util.removeClass(spinner, "slds-hide");
    },
    hideSpinner: function (component, event, helper) {
        var spinner = component.find("quality_claim_spinner");
        $A.util.addClass(spinner, "slds-hide");
        $A.util.removeClass(spinner, "slds-show");
    },
    pageDoneRendering: function (component, event, helper) {
        helper.hideSpinner(component, event, helper);
        component.set('v.doneRendering', true);
    },
    showToast: function (message, title, type, mode) {
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
    isNullOrEmpty: function (data) {
        if (data == '' || data == null || data == undefined) {
            return true;
        }
        return false;
    },
    callAction: function (component, action, callback) {
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
    setValidity: function (component, event, helper) {
        var validity = component.find('number_input').get('v.validity');
        component.set('v.validity', validity);
    },
    checkValidity: function (component, event, helper) {
        var numberInputValid = component.find('number_input').get('v.validity').valid;

        if (!numberInputValid) {
            component.find('number_input').showHelpMessageIfInvalid();
        }

    }

})