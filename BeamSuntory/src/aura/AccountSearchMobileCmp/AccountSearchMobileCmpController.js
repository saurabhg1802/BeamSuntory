({
    init: function (component, event, helper) {
        helper.init(component, event, helper);
    },
    handleSearchBySOQLRecords: function (component, event, helper) {
        helper.search(component, event, helper);
    },
    handleOnKeyUpFilter: function (component, event, helper) {
        var isEnterKey = event.keyCode === 13;
        var isInputValid = helper.isInputValid(component, event, helper);

        if (isEnterKey && isInputValid) {
            helper.search(component, event, helper);
        }
    },
    handleSelectedRecordChange: function (component, event, helper) {
        var selectedRecord = component.get('v.selectedRecord');

        if (helper.isNullOrEmpty(selectedRecord) || selectedRecord.length == 0) {
            helper.clearLocationFields(component, event, helper);
        } else {
            helper.setLocationFields(component, event, helper);
        }
    },
    handleRecordSelection: function (component, event, helper) {
        var selectedRecord = event.getParam('value');
        component.set('v.selectedRecord', selectedRecord);
        component.set('v.selectedRecordId', selectedRecord.Id);
        component.set('v.recordSelected', true);
        helper.showToast('Account Selected', 'Success', 'success');

        helper.clearFilterValues(component, event, helper);
        helper.clearSearchResults(component, event, helper);
        helper.clearResults(component, event, helper);
    },
    handleClearFilterValues: function (component, event, helper) {
        helper.clearFilterValues(component, event, helper);
        helper.clearSearchResults(component, event, helper);
        helper.clearResults(component, event, helper);
    },
    closeModal: function (component, event, helper) {
        helper.closeModal(component, event, helper);
    },
    clearSelectedValueMobile: function (component, event, helper) {
        component.set('v.selectedRecord', null);
    },

})