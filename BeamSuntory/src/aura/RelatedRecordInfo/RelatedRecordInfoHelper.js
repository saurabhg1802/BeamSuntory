({
    getRecord: function (component, event, helper) {
        var action = component.get("c.getRelatedRecord");

        action.setParams({
            "recordId": component.get('v.recordId'),
            "fieldApiName": component.get('v.relatedApiName')
        });

        return new Promise(function (resolve, reject) {
            action.setCallback(this, function (response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var requestObject = response.getReturnValue();
                    console.log(requestObject);
                    resolve(requestObject['responseMap']);

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
    showSpinner: function (component, event, helper) {
        var spinner = component.find("record_info_spinner");
        $A.util.addClass(spinner, "slds-show");
        $A.util.removeClass(spinner, "slds-hide");
    },
    hideSpinner: function (component, event, helper) {
        var spinner = component.find("record_info_spinner");
        $A.util.addClass(spinner, "slds-hide");
        $A.util.removeClass(spinner, "slds-show");
    },
    pageDoneRendering: function (component, event, helper) {
        helper.hideSpinner(component, event, helper);
        component.set('v.doneRendering', true);

    },
    parseStringToList: function (component, event, helper) {
        var column1 = component.get('v.column1');
        var column2 = component.get('v.column2');
        var column1List = [];
        var column2List = [];
        if (!helper.isNullOrEmpty(column1)) {
            component.set('v.column1List', column1.split(','));
        }
        if (!helper.isNullOrEmpty(column2)) {
            component.set('v.column2List', column2.split(','));
        }

    },
    isNullOrEmpty: function (data) {
        if (data == '' || data == null || data == undefined) {
            return true;
        }
        return false;
    },
    showToast: function (message, title, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type,
            "mode": "dismissible"
        });
        toastEvent.fire();
    },

})