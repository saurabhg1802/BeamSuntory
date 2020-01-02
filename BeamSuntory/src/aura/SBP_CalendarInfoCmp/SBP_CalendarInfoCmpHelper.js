({
    openModal: function(component, event) {
        var modal = component.find('modal');
        var backdrop = component.find('backdrop');

        //$A.util.addClass(modal, 'slds-fade-in-open');
        //$A.util.addClass(backdrop, 'slds-backdrop--open');
        document.getElementById("modal").classList.add("slds-fade-in-open");
        document.getElementById("backdrop").classList.add("slds-backdrop--open");
    },
    closeModal: function(component, event) {
        var modal = component.find('modal');
        var backdrop = component.find('backdrop');

        //$A.util.removeClass(modal, 'slds-fade-in-open');
        //$A.util.removeClass(backdrop, 'slds-backdrop--open');
        document.getElementById("modal").classList.remove("slds-fade-in-open");
        document.getElementById("backdrop").classList.remove("slds-backdrop--open");
    },
    insertEvent: function(component, event, helper) {
        var action = component.get("c.insertEvent");
        var eventObject = helper.buildEvent(component, event, helper);
        console.log(component.get('v.brand'));
        console.log(JSON.stringify(eventObject));

        action.setParams({
            'sEventObj': JSON.stringify(eventObject),
            'brand': component.get('v.brand')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var requestObject = response.getReturnValue();
                    console.log(requestObject);
                    var responseMap = requestObject['responseMap'];
                    resolve(responseMap);

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
    updateCaseRecord: function(component, event, helper) {
        var action = component.get("c.updateCase");
        var programType;

        if(component.get('v.programType') == 'Date Hold'){
        	programType = 'Trip and Tour';
        }

        action.setParams({
        	'eventId' : component.get('v.eventId'),
            'programType': programType,
            'caseId': component.get('v.caseId'),
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var requestObject = response.getReturnValue();
                    console.log(requestObject);
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
    buildEvent: function(component, event, helper) {
        var evObj = {
            "Plant__c": component.get('v.brand'),
            "Brand__c": component.get('v.brand'),
            "Include_Boxed_Lunches__c": component.get('v.boxedLunchVal'),
            "Time_of_Day__c": component.get('v.selectedTimeSlot'),
            "Scheduled_Date__c": moment(component.get('v.selectedDate')).format("YYYY-MM-DD"),
            "Initiator__c": $A.get("$SObjectType.CurrentUser.Id"),
            "Time_Interval__c": component.get('v.selectedTimeInterval')
        };

        return evObj;
    },
    resetModal: function(component,event, helper){
    	component.set('v.showBoxedLunches', false);
    	component.set('v.boxedLunchVal', false);
    	component.set('v.descriptionVal', '');
    	component.set('v.numberOfAttendees', 0);
    }

})