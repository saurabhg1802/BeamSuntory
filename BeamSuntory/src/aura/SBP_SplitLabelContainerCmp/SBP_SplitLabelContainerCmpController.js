({
    init: function(component, event, helper) {},
    handleValueChange: function(component, event, helper) {
        var field = event.getParam('field');
        var value = event.getParam('value');
        var index = event.getParam('index');
        var action = event.getParam('action');
        console.log('field: ', field);
        console.log('value: ', value);
        console.log('index: ', index);
        var allAuraIds = component.get('v.allAuraIds');


        var labelsRemaining = component.get('v.labelsRemaining');

        var runningTotalMap = component.get('v.runningTotalMap');

        if (action == 'delete') {
            if (runningTotalMap.hasOwnProperty(index)) {
                runningTotalMap[index][field] = value;
                component.set('v.labelsRemaining', (labelsRemaining * 1) + (value * 1));
                delete runningTotalMap[index];
                if (allAuraIds.indexOf(index) > -1) {
                    var arrayIndex = allAuraIds.indexOf(index);
                    component.find(allAuraIds[arrayIndex]).destroy();
                    allAuraIds.splice(index, 1);
                }

                return;
            } else {
                delete runningTotalMap[index];
                if (allAuraIds.indexOf(index) > -1) {
                    var arrayIndex = allAuraIds.indexOf(index);
                    component.find(allAuraIds[arrayIndex]).destroy();
                    allAuraIds.splice(index, 1);
                }
                return;
            }
        }

        if (runningTotalMap.hasOwnProperty(index)) {
            console.log('field ', field);
            console.log('value ', value);
            runningTotalMap[index][field] = value;
        } else {
            runningTotalMap[index] = {};
            runningTotalMap[index][field] = value;
        }
        console.log('runningTotalMap ', runningTotalMap);
        component.set('v.runningTotalMap', runningTotalMap);
        helper.updateRemainingAmount(component, event, helper);
    },
    addLabel: function(component, event, helper) {
        helper.createLabelCmp(component, event, helper);
    },
    clearOutCmpBody: function(component, event, helper) {
        var allAuraIds = component.get('v.allAuraIds');
        var splitLabelBody = component.get('v.splitLabelBody');


        while (splitLabelBody.length > 0) {
            splitLabelBody.pop();
        }
        console.log(splitLabelBody.length);
        component.set('v.splitLabelBody', splitLabelBody);
        component.set('v.runningMaxLabelsAvailable', 40);
        component.set('v.numberOfLabels', 0);
        component.set('v.labelsRemaining', 40);
    },
    validateSplitLabels : function(component,event, helper){
        return helper.validateAuraIdMap(component,event,helper);
    }
})