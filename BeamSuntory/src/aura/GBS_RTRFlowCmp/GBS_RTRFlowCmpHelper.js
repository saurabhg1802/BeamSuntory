({
    init: function (component, event, helper) {
        helper.pageDoneRendering(component, event, helper);
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
            component.find(fieldType).showHelpMessageIfInvalid();
            allValid = component.find(fieldType).get('v.validity').valid;
        }

        return allValid;
    },
    showSpinner: function (component, event, helper) {
        var spinner = component.find("spinner");
        $A.util.addClass(spinner, "slds-show");
        $A.util.removeClass(spinner, "slds-hide");
    },
    hideSpinner: function (component, event, helper) {
        console.log('hiding spinner');
        var spinner = component.find("spinner");
        $A.util.addClass(spinner, "slds-hide");
        $A.util.removeClass(spinner, "slds-show");
    },
    pageDoneRendering: function (component, event, helper) {
        helper.hideSpinner(component, event, helper);
        component.set('v.isDoneRendering', true);
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
    navigateToPage: function (component, event, helper) {
        var navigate = component.get("v.navigateFlow");
        var action = event.getParam("action");

        navigate(event.getParam("action"));
    },
    isNullOrEmpty: function (data) {
        if (data == '' || data == null || data == undefined) {
            return true;
        }
        return false;
    }

})