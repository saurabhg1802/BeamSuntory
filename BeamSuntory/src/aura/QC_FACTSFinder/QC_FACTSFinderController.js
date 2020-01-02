({
    init: function (component, event, helper) {
        helper.showSpinner(component, event, helper);
        helper.setCaseTableColumns(component, event, helper);
        helper.setIncidentTableColumns(component, event, helper);
        helper.init(component, event, helper);
    },

    handleRowAction: function (component, event, helper) {
        helper.goToCaseRecord(component, event);
    },

    handleCreateFACTS: function (component, event, helper) {
        helper.createNewFACTSCall(component, event);
    },

    handleSelectedRows: function (component, event, helper) {
        helper.populateSelectedRowsList(component, event);
    },

    handleToggleFilter: function (component, event, helper) {
        helper.toggleFilters(component, event);
    },

    handleUpdateTable: function (component, event, helper) {
        helper.buildQueryString(component, event);
        helper.updateTableColumns(component, event, helper);
    },

    handleAddToIncident: function (component, event, helper) {
        helper.addToIncident(component, event, helper);
    },

    handleIncidentRowSelection: function (component, event, helper) {
        var selectedRows = event.getParam('selectedRows');
        component.set('v.selectedIncident', selectedRows[0]['Id']);
    },

    handleGoToIncident: function (component, event, helper) {
        helper.goToIncidentRecord(component, event);
    },

    updateColumnSorting: function (component, event, helper) {
        var fieldName = event.getParam('fieldName');
        var sortDirection = event.getParam('sortDirection');
        component.set("v.sortedBy", fieldName);
        component.set("v.sortedDirection", sortDirection);
        helper.sortData(component, fieldName, sortDirection);
    }
})