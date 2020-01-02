({
    init: function() {},
    firePassValueFieldEvent: function(component, event, helper, field, value, defaultValidity) {
        var eventVal;
        var eventField;
        var index = component.get('v.splitNum');

        // check for field
        if (field != null && field != '' && field != undefined) {
            eventField = field;
        } else {
            eventField = event.getSource().getLocalId();
        }
        // check for value
        if (value != null && value != '' && value != undefined) {
            eventVal = value;
        } else {
            eventVal = event.getParam("value");
        }

        var fieldIdAPINameMap = component.get('v.fieldIdAPINameMap');
        var action = '';

        // call the event   
        var compEvent = component.getEvent("passFieldValue");
        var isValid;
        if (defaultValidity) {
            isValid = false;
        } else {
            isValid = this.isFieldValid(component, event, helper, eventField);
        }

        // set the Selected item attribute
        compEvent.setParams({
            "field": fieldIdAPINameMap[eventField],
            "action": action,
            "value": eventVal,
            "index": index,
            "isValid": isValid
        });
        // fire the event  
        compEvent.fire();

    },
    isFieldValid: function(component, event, helper, auraId) {
        var field = component.find(auraId);
        var account = component.get('v.selectedAccountDistributorLookUpRecord');
        var isValid;
        console.log('Aura Id: ', auraId);
        if (auraId != 'distributor') {
            isValid = field.get('v.validity').valid;
        } else {
            if (account.Id != null && account.Id != undefined) {
                isValid = true;
            } else {
                isValid = false;
            }
        }
        return isValid;
    },
    defaultValidity: function(component, event, helper) {

    },
    getPicklistValues: function(component, event, helper) {
        var action = component.get("c.getSplitBarrelPickListValues");

        action.setParams({});

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var requestObject = response.getReturnValue();
                    console.log('requestObject ', requestObject);
                    resolve(requestObject);

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
    buildPickListForComboBox: function(component, event, helper, picklistField, attributeName) {
        var picklistMap = component.get('v.picklistMap');
        var values = [];

        for (var i in picklistMap[picklistField]) {
            var value = {
                label: picklistMap[picklistField][i],
                value: picklistMap[picklistField][i]
            };
            values.push(value);
        }
        component.set('v.' + attributeName, values);
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
    showNotice: function(component, event, helper, type, message, title) {
        component.find('split_barrel_prompt').showNotice({
            "variant": type,
            "header": title,
            "message": message
        });
    },
        showSpinner: function(component, event, helper) {
        var spinner = component.find("split_row_spinner");
        $A.util.addClass(spinner, "slds-show");
        $A.util.removeClass(spinner, "slds-hide");
    },
    hideSpinner: function(component, event, helper) {
        var spinner = component.find("split_row_spinner");
        $A.util.addClass(spinner, "slds-hide");
        $A.util.removeClass(spinner, "slds-show");
    },
    pageDoneRendering: function(component, event, helper) {
        helper.hideSpinner(component, event, helper);
        component.set('v.doneRendering', true);

    }
})