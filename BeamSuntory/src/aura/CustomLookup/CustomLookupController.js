({
    onfocus: function (component, event, helper) {
        helper.showSpinner(component, event, helper);
        var forOpen = component.find("searchRes");
        $A.util.addClass(forOpen, 'slds-is-open');
        $A.util.removeClass(forOpen, 'slds-is-close');
        // Get Default 5 Records order by createdDate DESC
        var getInputkeyWord = '';
        helper.searchHelper(component, event, helper, getInputkeyWord);
    },
    onLoseFocus: function (component, event, helper) {
        helper.hideSpinner(component, event, helper);
        helper.searchHelper(component, event, helper, getInputkeyWord);

    },
    keyPressController: function (component, event, helper) {
        // get the search Input keyword
        var getInputkeyWord = component.get("v.SearchKeyWord");
        // check if getInputKeyWord size id more then 0 then open the lookup result List and
        // call the helper
        // else close the lookup result List part.
        if (getInputkeyWord.length > 0) {
            helper.showSpinner(component, event, helper);
            helper.searchHelper(component, event, helper, getInputkeyWord);
        } else {
            component.set("v.listOfSearchRecords", []);
            helper.hideSpinner(component, event, helper);
        }

    },

    // function for clear the Record Selaction
    clear: function (component, event, helper) {
        var getInputkeyWord = component.get("v.SearchKeyWord");

        console.log('clearing values');
        component.set("v.SearchKeyWord", null);
        component.set("v.listOfSearchRecords", []);
        component.set("v.selectedRecord", {});

    },

    // This function call when the end User Select any record from the result list.
    handleComponentEvent: function (component, event, helper) {
        // get the selected Account record from the COMPONETN event
        var selectedAccountGetFromEvent = event.getParam("recordByEvent");
        component.set("v.selectedRecord", selectedAccountGetFromEvent);
        helper.hideSpinner(component, event, helper);
    },
    // automatically call when the component is done waiting for a response to a server request.
    hideSpinner: function (component, event, helper) {
        helper.hideSpinner(component, event, helper);
    },
    // automatically call when the component is waiting for a response to a server request.
    showSpinner: function (component, event, helper) {
        helper.showSpinner(component, event, helper);
    },
    udpateAccountVariable: function (component, event, helper) {
        var acct = component.get("v.selectedRecord");
        component.set("v.acctId", acct.Id);
    },

})