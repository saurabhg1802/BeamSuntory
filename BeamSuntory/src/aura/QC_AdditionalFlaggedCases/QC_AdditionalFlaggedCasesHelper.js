({
    init : function(component, event, helper) {
        var setDatatableInfoPromise = helper.setDatatableInfo(component, event);
        setDatatableInfoPromise.then(
            $A.getCallback(function(result) {
                component.set('v.data', result);
            })
        );
    },

    setColumns : function(component, event, helper) {
        component.set('v.columns', [
            {type: 'button-icon', initialWidth: 50, typeAttributes: { title: 'View Case', label: 'View Case', iconName: 'utility:new_window', variant: 'container'}},
            {label: 'Case Number', fieldName: 'CaseNumber', type: 'text'},
            {label: 'Lot Code', fieldName: 'Lot_Code__c', type: 'text'},
            {label: 'Created Date', fieldName: 'CreatedDate', type: "date-local", 
                typeAttributes:{
                    month: "2-digit",
                    day: "2-digit"
                }
            },
        ]);
    },

    setDatatableInfo : function(component, event, helper) {

        var action = component.get("c.getAdditionalCases");

        //pull in record id
        action.setParams({ parentIncidentId : component.get("v.parentIncidentId") });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var datatableInfo = response.getReturnValue();
                    resolve(datatableInfo);
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

    setRemainingCases : function(component, event, helper) {
        var remainingCases = component.get("v.data");
        for (var i = 0; i < component.get("v.selectedCases").length; i++) {
            for (var j = 0; j < component.get("v.data").length; j++) {
                if (component.get("v.selectedCases")[i]['Id'] === component.get("v.data")[j]['Id']) {
                    remainingCases.splice(j, 1);
                }
            }
        }
        component.set("v.data", remainingCases);
    },

    addAdditionalCases : function(component, event, helper) {
        component.set('v.loaded', false);
        
        var action = component.get("c.insertCases");

        action.setParams({ parentIncidentId : component.get("v.parentIncidentId"), casesToAdd : component.get("v.selectedCases") });

        return new Promise(function(resolve, reject) {

            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    resolve(response.getReturnValue());
                }

                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + 
                                     errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
            });
            $A.enqueueAction(action);
        });
    },

	goToCaseRecord : function(component, event) {
		var action = event.getParam('action');
        var row = event.getParam('row');
        window.open('/' + row.Id, '_blank');
	},
        
    showToast: function(message, title, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type,
            "mode": "dismissible"
        });
        toastEvent.fire();
    },
})