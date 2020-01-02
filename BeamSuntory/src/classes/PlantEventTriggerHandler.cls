public class PlantEventTriggerHandler {

	/*public static void handleBeforeInsert(List<Plant_Event__c> events) {

	}
	*/

	public static void handleBeforeUpdate(List<Plant_Event__c> events, Map<Id, Plant_Event__c> oldEvents) {
		PlantEventServices.updateRelatedCaseWhenTripIsToday(events, oldEvents);
	}
/*
	public static void handleBeforeDelete(List<Plant_Event__c> events, Map<Id, Plant_Event__c> oldEvents) {
	}

	public static void handleAfterInsert(List<Plant_Event__c> events, Map<Id, Plant_Event__c> oldEvents) {

	}
	public static void handleAfterUpdate(List<Plant_Event__c> events, Map<Id, Plant_Event__c> oldEvents) {

	}
	*/


}