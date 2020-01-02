({
    doInit: function (component, event, helper) {
        helper.init(component, event, helper);
    },

    onChange: function (component, event, helper) {
        var fieldToAuraIdMap = component.get('v.fieldToAuraIdMap');
        var auraId = event.getSource().getLocalId();
        var currentField = fieldToAuraIdMap[auraId];

        helper.setCurrentDropdownFieldSelection(component, event, helper);
        helper.resetDependencies(component, event, helper, currentField.current, currentField.next);
        helper.lookupDependentValues(component, event, helper, currentField.current, currentField.next);
        helper.updateDependencies(component, event, helper, currentField.next);
    },

    handleNavigate: function (component, event, helper) {
        var isPageValid = helper.isPageValid(component, event, helper);
        helper.assignTranslatedValues(component, event, helper);

        if (!isPageValid) {
            helper.showToast('Please make a selection for each field', 'Error', 'error');
        } else {
            helper.navigateToPage(component, event, helper);
        }
    },
})