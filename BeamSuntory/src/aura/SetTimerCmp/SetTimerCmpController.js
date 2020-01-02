({
    // When a flow executes this component, it calls the invoke method
    invoke: function(component, event, helper) {
        var startTimer = component.get('v.startTimer');
        var appEvent = $A.get("e.c:timeRemainingEvent");

        appEvent.setParams({
            "startTimer": startTimer
        });
        // fire the event  
        appEvent.fire();
    }
})