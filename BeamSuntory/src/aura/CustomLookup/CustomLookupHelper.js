({
    searchHelper: function (component, event, helper, getInputkeyWord) {
        var methodToSearchWith = component.get('v.methodToSearchWith');
        console.log('METHOD ', methodToSearchWith);
        // call the apex class method
        var action = component.get("c." + methodToSearchWith);
        // set param to method
        action.setParams({
            'searchKeyWord': getInputkeyWord,
            'objectName': component.get("v.objectAPIName"),
            'parentId': component.get('v.parentId'),
            'limit': component.get('v.limit')
        });
        // set a callBack
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();
                // if storeResponse size is equal 0 ,display No Result Found... message on screen.                }
                if (storeResponse.length == 0) {
                    component.set("v.Message", 'No Result Found...');
                } else {
                    component.set("v.Message", '');
                }
                // set searchResult list with return value from server.
                component.set("v.listOfSearchRecords", storeResponse);
                helper.hideSpinner(component, event, helper);
                console.log('Records from apex ', storeResponse);
            }

        });
        // enqueue the Action
        $A.enqueueAction(action);

    },
    showSpinner: function (component, event, helper) {
        var spinner = component.find("custom_lookup_spinner");
        $A.util.addClass(spinner, "slds-show");
        $A.util.removeClass(spinner, "slds-hide");
    },
    hideSpinner: function (component, event, helper) {
        var spinner = component.find("custom_lookup_spinner");
        $A.util.addClass(spinner, "slds-hide");
        $A.util.removeClass(spinner, "slds-show");
    },
    showResults: function (component, event, helper) {
        var forOpen = component.find("searchRes");
        $A.util.addClass(forOpen, 'slds-is-open');
        $A.util.removeClass(forOpen, 'slds-is-close');
    },
    hideResults: function (component, event, helper) {
        var forOpen = component.find("searchRes");
        $A.util.removeClass(forOpen, 'slds-is-open');
        $A.util.addClass(forOpen, 'slds-is-close');
    }
})