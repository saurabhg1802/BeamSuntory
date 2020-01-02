({
    init: function (component, event, helper) {
        helper.init(component, event, helper);
    },
    handleNavigate: function (component, event, helper) {
        var action = event.getParam("action");

        if (action == 'BACK') {
            helper.navigateToPage(component, event, helper);
        } else {
            var isPageValid = helper.isPageValid(component, event, helper);

            if (!isPageValid && action != 'BACK') {
                helper.showToast('Invalid Fields', 'Error', 'error');
            } else {
                helper.navigateToPage(component, event, helper);
            }
        }
    },
    handleAccountSelected: function (component, event, helper) {
        var selectedAccount = component.get('v.selectedAccount');

        if (!helper.isNullOrEmpty(selectedAccount)) {
            helper.assignLocationFields(component, event, helper);
            helper.assignAccountId(component, event, helper);
        } else {
            helper.disableLocationFields(component, event, helper, false);
            component.set('v.locationName', null);
            component.set('v.locationStreet', null);
            component.set('v.locationCity', null);
            component.set('v.locationState', null);
            component.set('v.locationCountry', null);
            component.set('v.locationPostalCode', null);
            component.set('v.accountId', null);

        }
    }
})