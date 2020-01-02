({
    createCase: function(component, event, helper) {
        var action = component.get("c.createNewCase");

        action.setParams({
            caseId: component.get('v.recordId')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var requestObject = response.getReturnValue();
                    resolve(requestObject['responseMap']);

                } else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            reject(Error("Error message: " + errors[0].message));
                        }
                    } else {
                        reject(Error("Unknown error"));
                    }
                }
            });
            $A.enqueueAction(action);
        });
    },
    createNewRecord: function(component, event, helper) {
        var createRecordEvent = $A.get("e.force:createRecord");
        var sObject = component.get('v.sObject');
        var obj = {};
        var defaultFieldValuesObj = {};

        obj['entityApiName'] = sObject;

        defaultFieldValuesObj['Case__c'] = component.get('v.caseId');
        defaultFieldValuesObj['Brand__c'] = component.get('v.case').Brand__c;
        defaultFieldValuesObj['Flavor__c'] = component.get('v.case').Flavor__c;
        defaultFieldValuesObj['RecordTypeId'] = component.get('v.recordTypeId');
        
        obj['defaultFieldValues'] = defaultFieldValuesObj;

        createRecordEvent.setParams(obj);
        createRecordEvent.fire();
    },
})