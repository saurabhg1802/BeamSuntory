({
    init: function(component, event, helper) {},
    updateRunningTotal: function(component, event, helper) {
        var runningTotalMap = component.get('v.runningTotalMap');
        var name = component.get('v.name');
        var count = component.get('v.count');

        if (runningTotalMap.hasOwnProperty(name)) {
            runningTotalMap[name]['Quantity__c'] = count;
        } else {
        	var newObj = {};
        	runningTotalMap[name] = {};
        	newObj['Type__c'] = name;
        	newObj['Quantity__c'] = count;
            runningTotalMap[name] = newObj;
        }

        console.log('runningTotalMap ', runningTotalMap);

        component.set('v.runningTotalMap', runningTotalMap);
    }
})