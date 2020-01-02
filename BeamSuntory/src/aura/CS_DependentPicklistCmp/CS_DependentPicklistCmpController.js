({
    doInit: function (component, event, helper) {
        helper.init(component, event, helper);
    },

    onTypeCategoryFieldChange: function (component, event, helper) {
        helper.setCurrentDropdownFieldSelection(component, event, helper);
        helper.resetDependencies(component, event, helper, 'typeCategoryField', 'primaryCategoryField');
        helper.lookupDependentValues(component, event, helper, 'typeCategoryField', 'primaryCategoryField');
        helper.updateDependencies(component, event, helper, 'primaryCategoryField');
        helper.assignTranslatedValues(component, event, helper);
        helper.setPageValidity(component, event, helper);

    },
    onPrimaryCategoryFieldChange: function (component, event, helper) {
        helper.setCurrentDropdownFieldSelection(component, event, helper);
        helper.resetDependencies(component, event, helper, 'primaryCategoryField', 'secondaryCategoryField');
        helper.lookupDependentValues(component, event, helper, 'primaryCategoryField', 'secondaryCategoryField');
        helper.updateDependencies(component, event, helper, 'secondaryCategoryField');
        helper.assignTranslatedValues(component, event, helper);
        helper.setPageValidity(component, event, helper);

    },
    onSecondaryCategoryFieldChange: function (component, event, helper) {
        helper.setCurrentDropdownFieldSelection(component, event, helper);
        helper.resetDependencies(component, event, helper, 'secondaryCategoryField', 'tertiaryCategoryField');
        helper.lookupDependentValues(component, event, helper, 'secondaryCategoryField', 'tertiaryCategoryField');
        helper.updateDependencies(component, event, helper, 'tertiaryCategoryField');
        helper.assignTranslatedValues(component, event, helper);
        helper.setPageValidity(component, event, helper);
    },
    onTertiaryCategoryFieldChange: function (component, event, helper) {
        helper.assignTranslatedValues(component, event, helper);
        helper.setPageValidity(component, event, helper);
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