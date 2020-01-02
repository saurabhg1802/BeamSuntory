({
    
    init : function(component, event, helper) {
        var incoming = component.get("v.newFlightInfo.Incoming_Airline__c");
        if(incoming!=null)
        	component.set('v.alreadyUpdated',true);          
            
    },
	saveFlightInfo : function(component, event, helper) {
        var button = event.getSource();
        //var case_id = component.get("v.caseId");
        var alert_message = component.get("v.alertFlag");
        var AttendeeId = component.get("v.newFlightInfo.Id");
        var incoming_flight = component.get('v.newFlightInfo.Incoming_Airline__c');
        var incoming_flight_number = component.get('v.newFlightInfo.Incoming_Flight_Number__c');
        var incoming_Departure_City = component.get('v.newFlightInfo.Incoming_Departure_City__c');
        var incoming_Arrival_Time = component.get('v.newFlightInfo.Incoming_Arrival_Time__c');
        
        var outgoing_flight = component.get('v.newFlightInfo.Outgoing_Airline__c');
        var outgoing_flight_number = component.get('v.newFlightInfo.Outgoing_Flight_Number__c');
        var outgoing_Final_Destination = component.get('v.newFlightInfo.Outgoing_Final_Destination__c');
        var outgoing_Departure_Time = component.get('v.newFlightInfo.Outgoing_Departure_Time__c');
        var additional_Notes = component.get('v.newFlightInfo.Additional_Notes__c');
        
        var action = component.get("c.createFlightInfo");
        action.setParams({
            "Incoming_Airline" : incoming_flight,
            "Incoming_Flight_Number" : incoming_flight_number,
            "Incoming_Departure_City" : incoming_Departure_City,
            "Incoming_Arrival_Time" : incoming_Arrival_Time,
            "Outgoing_Airline" : outgoing_flight,
            "Outgoing_Flight_Number" : outgoing_flight_number,
            "Outgoing_Final_Destination" : outgoing_Final_Destination,
            "Outgoing_Departure_Time" : outgoing_Departure_Time,
            "Additional_Notes" : additional_Notes,
            "AttendeeId" : AttendeeId
        });
        
        action.setCallback(this, function(a) {
         component.set('v.alreadyUpdated', a.getReturnValue());
         component.set('v.alertFlag', a.getReturnValue()); 
           
        });
        
        var alertFlag= component.get('v.alertFlag');
        if(alertFlag){    
        button.set('v.disabled',true);    
        }
        
        $A.enqueueAction(action);
	}
})