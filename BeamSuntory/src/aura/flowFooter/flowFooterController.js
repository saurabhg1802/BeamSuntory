({
    init: function(component, event, helper) {
        // Figure out which buttons to display
        var availableActions = component.get('v.availableActions');
        //console.log(availableActions);
        for (var i = 0; i < availableActions.length; i++) {
            if (availableActions[i] == "PAUSE") {
                component.set("v.canPause", true);
            } else if (availableActions[i] == "BACK") {
                component.set("v.canBack", true);
            } else if (availableActions[i] == "NEXT") {
                component.set("v.canNext", true);
            } else if (availableActions[i] == "FINISH") {
                component.set("v.canFinish", true);
            }
        }
    },

    onButtonPressed: function(component, event, helper) {
        // Figure out which action was called
        var actionClicked = event.getSource().getLocalId();
        var performAction = component.get('v.performAction');
        //console.log('flow footer');
        //console.log(actionClicked);
        //console.log(performAction);

        if (performAction) {
            // Call that action
            var navigate = component.getEvent("navigateFlowEvent");
            navigate.setParam("action", actionClicked);
            navigate.fire();
        }

    }
})