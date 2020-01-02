({
    updateRemainingAmount: function(component, event, helper) {
        var runningTotalMap = component.get('v.runningTotalMap');
        var totalSplitLabelLimit = component.get('v.totalSplitLabelLimit');
        var allValues = Object.values(runningTotalMap);

        var allQuantities = allValues.map(function(value) {
            return value.quantity;
        });

        var total = allQuantities.reduce(function(acc, val) {
            if (isNaN(acc)) {
                acc = 0;
            }
            if (isNaN(val)) {
                val = 0;
            }
            return parseInt(acc, 10) + parseInt(val, 10);
        });

        if (isNaN(total)) {
            total = 0;
        }
        component.set('v.labelsRemaining', totalSplitLabelLimit - total);
        component.set('v.runningMaxLabelsAvailable', totalSplitLabelLimit - total);
    },
    createLabelCmp: function(component, event, helper) {
        var body = component.get("v.splitLabelBody");
        var allAuraIds = component.get('v.allAuraIds');
        // clear out body
        // other methods of destorying the components did not work
        var splitLabelLimit = component.get('v.splitLabelLimit');
        var splitLabelCount = component.get('v.splitLabelCount');

        if (splitLabelLimit == splitLabelCount) {
            return;
        } else {
            component.set('v.splitLabelCount', splitLabelCount + 1);
        }

        var auraId = new Date().getMilliseconds();
        allAuraIds.push(auraId);
        component.set('v.allAuraIds', allAuraIds);


        $A.createComponent(
            "c:SBP_SplitLabelCmp", {
                "brand": component.get('v.brand'),
                "recordId": component.get('v.recordId'),
                "labelsRemaining": component.getReference('v.labelsRemaining'),
                "labelId": auraId,
                "aura:id": auraId,
                "splitLabelCount": component.getReference('v.splitLabelCount'),
                "runningMaxLabelsAvailable": component.getReference("v.runningMaxLabelsAvailable")
            },
            function(newBrand, status, errorMessage) {
                //Add the new button to the body array
                if (status === "SUCCESS") {

                    body.push(newBrand);
                    component.set("v.splitLabelBody", body);
                    helper.defaultNewLabelValue(component, event, helper, auraId);
                } else if (status === "INCOMPLETE") {
                    console.log("No response from server or client is offline.")
                        // Show offline error
                } else if (status === "ERROR") {
                    console.log("Error: " + errorMessage);
                    // Show error message
                }
            }
        );
    },
    validateAuraIdMap: function(component, event, helper) {
        var runningTotalMap = component.get('v.runningTotalMap');
        var missingItems = false;
        var keys = Object.keys(runningTotalMap);

        for (var i in keys) {
            if (runningTotalMap[keys[i]].text == null || runningTotalMap[keys[i]].text == '') {
                console.log(keys[i]);
                console.log('missing text');
                missingItems = true;
                break;
            }
            if (runningTotalMap[keys[i]].quantity == null || runningTotalMap[keys[i]].quantity == '') {
                console.log(keys[i]);
                console.log('missing quantity');
                missingItems = true;
                break;
            }
        }
        return missingItems;
    },
    defaultNewLabelValue: function(component, event, helper, index) {
        var runningTotalMap = component.get('v.runningTotalMap');

        runningTotalMap[index] = {};
        runningTotalMap[index]['text'] = '';
        runningTotalMap[index]['quantity'] = '';

        component.set('v.runningTotalMap', runningTotalMap);
    }
})