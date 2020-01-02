({

    doInit: function (component, event, helper) {
        // get the fields API name and pass it to helper function
        var controllingFieldAPI = component.get("v.controllingField");
        var dependingFieldAPI = component.get("v.dependentField");
        // call the helper function
        helper.init(component, event, helper);
    },

    onControllerFieldChange: function (component, event, helper) {
        helper.lookupDependentValues(component, event, helper);
        component.set('v.isCmpValid', helper.isPageValid(component, event, helper));
    },
})