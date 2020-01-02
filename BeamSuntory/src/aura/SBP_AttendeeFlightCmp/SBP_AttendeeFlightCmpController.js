({
    init: function(component, event, helper) {
        var case_id = component.get("v.caseId");
        var action1 = component.get("c.getBrand");
        var action = component.get("c.getAttendeeList");
        
        action1.setParams({
            "case_Id": case_id
        });
        
        action1.setCallback(this, function(response) {
			component.set('v.brand', response.getReturnValue());
        });
        
        action.setParams({
            "case_Id": case_id
        });
     
        action.setCallback(this, function(a) {
			component.set('v.attendeeList', a.getReturnValue());
            
        });
         /*action.setCallback(this, function(a) {
             var ac;
             var state = a.getState();
             if (state === "SUCCESS") {
        	 	component.set('v.attendeeList', a.getReturnValue()[true]);
             }
             if(a.getReturnValue()[true] == null || a.getReturnValue()[true].length == 0)
             {
                 component.set('v.message', "Either Brand is not El Tesoro or No attendees available to enter Travel info");
             }
             
         });*/
        $A.enqueueAction(action1);
        $A.enqueueAction(action);
    },


})