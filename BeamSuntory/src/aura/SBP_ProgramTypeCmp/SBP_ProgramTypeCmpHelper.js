({
    selectProgramType: function(component, event, helper) {

        // get the selected record from list  
        var programType = component.get('v.programType');
        var auraId = component.get('v.auraId');

        // call the event   
        var compEvent = component.getEvent('programTypeSelectedEvent');
        // set the Selected sObject Record to the event attribute.  
        compEvent.setParams({
            'programType': programType,
            'auraId': auraId
        });
        // fire the event  
        compEvent.fire();
    },
    hoverOverProgramType: function(component, event, helper) {
        // get the selected record from list  
        var programType = component.get('v.programType');
        var auraId = component.get('v.auraId');

        // call the event   
        var compEvent = component.getEvent('programTypeHoverEvent');

        compEvent.setParams({
            'programType': programType,
            'auraId': auraId
        });
        // fire the event  
        compEvent.fire();
    },
    getStaticResource: function(component, event, helper) {
        var staticResourceName = component.get('v.staticResourceName');
        var staticResourceURL = $A.get('$Resource.' + staticResourceName);
        component.set('v.staticResourceName', staticResourceURL);
    }
})