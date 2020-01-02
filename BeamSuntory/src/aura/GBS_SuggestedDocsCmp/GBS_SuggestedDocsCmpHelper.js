({
    init: function (component, event, helper) {
        var getLinksPromise = helper.getLinks(component, event, helper);
        getLinksPromise.then(
            $A.getCallback(function (result) {
                component.set('v.links', result['links']);
            })
        ).catch(
            function (error) {
                console.log('Error ', error);
            }
        ).finally(
            function () {
                helper.pageDoneRendering(component, event, helper);
            }
        )
    },
    getLinks: function (component, event, helper) {
        var action = component.get("c.getSuggestedDocs");

        action.setParams({
            picklistValue: component.get('v.picklistValue'),
            businessFunction: component.get('v.businessFunction')

        });
        return new Promise(function (resolve, reject) {
            action.setCallback(this, function (response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    console.log('Results from Apex Controller: ', retVal);
                    var responseMap = retVal['responseMap'];
                    resolve(responseMap);

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

    isNullOrEmpty: function (data) {
        if (data == '' || data == null || data == undefined) {
            return true;
        }
        return false;
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

})