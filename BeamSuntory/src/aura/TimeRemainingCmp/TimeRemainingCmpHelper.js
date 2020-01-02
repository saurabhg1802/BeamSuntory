({
    timeHasExpired: function(component, event, helper) {
        var resetFlow = $A.get("e.force:navigateToURL");
        resetFlow.setParams({
            "url": 'https://craigdev-beam.cs20.force.com/customer/s/singlebarrel'
        });
        resetFlow.fire();
    },
    initiateCountdown: function(component, event, helper) {
        var jsonString = component.get('v.targetTimeString');
        var timeoutIds = component.get('v.timeoutIds');


        if (jsonString != null && jsonString != '') {
            component.set('v.targetTime', JSON.parse(jsonString));
            component.set('v.showTimer', true);
        } else {
            var targetTime = new Date();
            targetTime.setMinutes(targetTime.getMinutes() + component.get('v.expirationTimeMinutes'));
            component.set('v.targetTime', targetTime);
            component.set('v.showTimer', true);
        }

        var pageTimeoutId = window.setTimeout($A.getCallback(function() {
            component.set('v.showPrompt', true);
        }), component.get('v.expirationTimeMilliseconds'));

        timeoutIds.push(pageTimeoutId);
        component.set('v.timeoutIds', timeoutIds);
    },
    checkTimer: function(component, event, helper) {
        var startTimer = component.get('v.startTimer');

        if (startTimer) {
            helper.initiateCountdown(component, event, helper);
        } else {
            helper.clearTimeout(component, event, helper);
        }

    },
    resetTimer: function(component, event, helper) {
        component.set('v.showPrompt', false);
        var pageTimeoutId = component.get('v.pageTimeoutId');

        component.set('v.promptSecondsRemaining', 10);
        component.set('v.promptMilliSecondsRemaining', 10000);
        component.set('v.continueSession', null);
        component.set('v.timeoutIds', []);

        helper.initiateCountdown(component, event, helper);
    },
    startTimeoutForPrompt: function(component, event, helper) {
        var continueSession = component.get('v.continueSession');
        var timeoutIds = component.get('v.timeoutIds');

        helper.countDownPromptTimeRemaining(component, event, helper);

        var promptTimeoutId = window.setTimeout($A.getCallback(function() {
            if (continueSession == 'No' || continueSession == null || continueSession == '') {
                helper.timeHasExpired(component, event, helper);
                component.set('v.showPrompt', false);
            }
        }), 10000);

        timeoutIds.push(promptTimeoutId);
        component.set('v.timeoutIds', timeoutIds);
    },
    countDownPromptTimeRemaining: function(component, event, helper) {
        var promptSecondsRemaining = component.get('v.promptSecondsRemaining');
        var promptMilliSecondsRemaining = component.get('v.promptMilliSecondsRemaining');
        var newSecondsRemaining = promptSecondsRemaining - 1;
        var showPrompt = component.get('v.showPrompt');
        var timeoutIds = component.get('v.timeoutIds');

        if (newSecondsRemaining > 0 && showPrompt) {
            var interval = window.setTimeout(
                $A.getCallback(function() {
                    component.set('v.promptSecondsRemaining', newSecondsRemaining);
                    component.set('v.promptMilliSecondsRemaining', promptMilliSecondsRemaining - 1000);
                    helper.countDownPromptTimeRemaining(component, event, helper)
                }), 1000);

            timeoutIds.push(interval);
            component.set('v.timeoutIds', timeoutIds);
        }
    },
    clearTimeout: function(component, event, helper) {
        var promptTimeoutId = component.get('v.promptTimeoutId');
        var timeoutIds = component.get('v.timeoutIds');

        for (var i in timeoutIds) {
            window.clearTimeout(timeoutIds[i]);
        }
    },

})