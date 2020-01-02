({
    doInit : function(component, event, helper) {
     var getPicklistValuesPromise = helper.getPicklistValues(component, event, helper);
        getPicklistValuesPromise.then(
            $A.getCallback(function (result) {
                var responseMap = result['responseMap'];
                helper.buildPicklistOptions(component, 'recommendation', responseMap['picklistFields']['recommendation']);
                helper.buildPicklistOptions(component, 'impact', responseMap['picklistFields']['impact']);
            })
        )
    },

    getPicklistValues : function(component, event, helper) {
        var action = component.get("c.getPicklistOptions");

        return new Promise(function (resolve, reject) {
            action.setCallback(this, function (response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
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

    buildPicklistOptions: function (component, targetAttribute, values) {
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
        var fieldTypes = component.get("v.fieldTypes");
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

    navigateToPage: function(component, event, helper) {
        var navigate = component.get("v.navigateFlow");
        var action = event.getParam("action");

        navigate(event.getParam("action"));
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

    doComboboxSelect : function(component, event, helper) {
        var selectedOption = event.getParam("value");
        if (event.getSource().get("v.name") === "impact") {
            component.set("v.impactString", selectedOption);
        }
        if (event.getSource().get("v.name") === "recommendation") {
            component.set("v.recommendationString", selectedOption);
        }
    },
})