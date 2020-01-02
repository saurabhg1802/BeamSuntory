({
    init: function (component, event, helper) {
        helper.init(component, event, helper);
        var primaryCategory = component.get('v.primaryCategory'); 
    },
    handleNavigate: function (component, event, helper) {
        var action = event.getParam("action");

        if (action === 'BACK') {
            helper.navigateToPage(component, event, helper);
        } else if (action === 'NEXT') {
            var isPageValid = helper.isPageValid(component, event, helper);

            if (!isPageValid) {
                helper.showToast(component.get('v.invalidFieldsError'), 'Error', 'error');
            } else {
                helper.navigateToPage(component, event, helper);
            }
        }
    },
})