({
    init: function(component, event, helper) {
        helper.init(component, event, helper);
    },
    selectPosItem: function(component, event, helper) {
        helper.toggleButton(component, event, helper);
        helper.selectPosItem(component, event, helper, false);
    },
    handleButtonClick: function(component, event, helper) {
        helper.toggleButton(component, event, helper);
    },
    handleOptionChange: function(component, event, helper) {
        helper.handleOptionChange(component, event, helper);
    },
    handleMenuInsertTextChange: function(component, event, helper) {
        helper.selectPosItem(component, event, helper, true);
    },
    hanldeHidePOSItems : function(component,event, helper){
        component.set('v.optionVal', '');
    },

})