({
    init : function(component, event, helper){
        helper.init(component, event, helper);
    },
    onAccountSearchChange: function(component, event, helper) {
        helper.validateAccount(component, event, helper);
    },

    navigateToFlow: function(component, event, helper) {
        var baseUrl = component.get('v.baseUrl');
        var selectedAccountLookUpRecord = component.get("v.selectedAccountLookUpRecord");
        window.location.href = baseUrl +'/apex/CSFlow?acctId=' + selectedAccountLookUpRecord.Id;
    },



})