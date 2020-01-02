({
    init: function (component, event, helper) {
        var getPicklistValuesPromise = helper.getPicklistValues(component, event, helper);
        getPicklistValuesPromise.then(
            $A.getCallback(function (result) {
                var responseMap = result['responseMap'];
                var picklistMap = responseMap['picklistFields'];
                helper.buildPicklistOptions(component, 'countries', picklistMap['countries']);
            })
        ).catch(
            function (errorMessage) {
                helper.showToast(errorMessage, 'Error', 'error', 'sticky');
            }
        ).finally(
            function (errorMessage) {
                helper.pageDoneRendering(component, event, helper);
            }
        )
    },
    getPicklistValues: function (component, event, helper) {
        var action = component.get("c.getPicklistOptions");
        return helper.callAction(component, action);
    },
    buildPicklistOptions: function (component, targetAttribute, values, addNoneValue) {
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
    isPageValid: function (component, event, helper) {
        var isPicklistCmpValid = component.get('v.isPicklistCmpValid');
        var isTypeCmpValid = component.get('v.isTypeCmpValid');

        if (isPicklistCmpValid && isTypeCmpValid) {
            return true;
        }
        return false;
    },

    isBeamInternalUser: function (component, event, helper) {
        var userEmail = $A.get("$SObjectType.CurrentUser.Email");
        console.log(userEmail);
        return userEmail.includes('beamsuntory.com') || userEmail.includes('makersmark.com');
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
    isEmpty: function (obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    },
    showToast: function (message, title, type, mode) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type,
            "mode": mode || "dismissible"
        });
        toastEvent.fire();
    },
    navigateToPage: function (component, event, helper) {
        var navigate = component.get("v.navigateFlow");
        var action = event.getParam("action");

        navigate(event.getParam("action"));
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
    }
})