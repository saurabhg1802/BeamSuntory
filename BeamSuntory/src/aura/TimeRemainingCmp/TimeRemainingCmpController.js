({
    init: function(component, event, helper) {
        helper.checkTimer(component, event, helper);
    },
    checkTimer: function(component, event, helper) {
        helper.checkTimer(component, event, helper);
    },
    handleTimerEvent: function(component, event, helper) {
        var startTimer = event.getParam('startTimer');
        component.set('v.startTimer', startTimer);


    },
    handlePromptOnChange: function(component, event, helper) {
        var continueSession = component.get('v.continueSession');

        if (continueSession == 'Yes') {
            helper.clearTimeout(component, event, helper);
            helper.resetTimer(component, event, helper);
        }
        if (continueSession == 'No') {
            helper.clearTimeout(component, event, helper);
            helper.resetTimer(component, event, helper);
            component.set('v.showPrompt', false);
            helper.timeHasExpired(component, event, helper);

        }
    },
    handleShowPromptChange: function(component, event, helper) {
        var showPrompt = component.get('v.showPrompt');
        if (showPrompt) {
            helper.startTimeoutForPrompt(component, event, helper);
        }
    }


})