({
    init: function (component, event, helper) {
        helper.init(component, event, helper);
        helper.setValidity(component, event, helper);
    },
    handleChange: function (component, event, helper) {
        helper.setValidity(component, event, helper);
        helper.checkValidity(component, event, helper);
    }
})