({
    init: function (component, event, helper) {
        helper.init(component, event, helper);
    },
    handleSearchBySOQLRecords: function (component, event, helper) {
        helper.search(component, event, helper);
    },
    handleRecordSelection: function (component, event, helper) {
        var row = event.getParam('row');

        component.set('v.selectedRecord', row);
        component.set('v.selectedRecordId', row['Id']);
        component.set('v.recordSelected', true);
    },

    handleRecordSelectionOnMobile: function (component, event, helper) {
        var selectedRecord = event.getParam('value');
        component.set('v.selectedRecord', selectedRecord);
        component.set('v.selectedRecordId', selectedRecord.Id);
        component.set('v.recordSelected', true);
        helper.showToast('Account Selected', 'Success', 'success');

        helper.clearFilterValues(component, event, helper);
        helper.clearSearchResults(component, event, helper);
    },
    handleColumnSort: function (component, event, helper) {
        var selectedTab = component.get('v.selectedTab');

        if (selectedTab == 'My Recent Accounts') {
            helper.updateColumnSorting(component, event, helper, 'recentRecords');
        } else if (selectedTab == 'All Accounts') {
            helper.updateColumnSorting(component, event, helper, 'filteredData');
        }
    },
    handleFilterResults: function (component, event, helper) {
        var selectedTab = component.get('v.selectedTab');

        if (selectedTab == 'My Recent Accounts') {
            helper.filterResults(component, event, helper, 'filteredRecentRecords');
        } else if (selectedTab == 'All Accounts') {
            helper.filterResults(component, event, helper, 'filteredData');
        }
    },
    onSearchTermChange: function (component, event, helper, attribute) {
        helper.filterCurrentListOfRecords(component, event, helper);
    },
    handleClearFilterValues: function (component, event, helper) {
        helper.clearFilterValues(component, event, helper);
        helper.clearSearchResults(component, event, helper);
    },
    handleOnKeyUpFilter: function (component, event, helper) {
        var isEnterKey = event.keyCode === 13;
        var isInputValid = helper.isInputValid(component, event, helper);

        if (isEnterKey && isInputValid) {
            helper.search(component, event, helper);
        }
    },
    closeModal: function (component, event, helper) {
        helper.closeModal(component, event, helper);
    },
    clearSelectedValueMobile: function (component, event, helper) {
        component.set('v.selectedRecord', null);
    },

})