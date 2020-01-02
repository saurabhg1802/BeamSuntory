public class PlantEventServices {

	/**************************************************************************************************************
	Author:        Craig Austgen
	Company:       Slalom, LLC
	Description:	Once the trip is equal to today a time based workflow will update this record to reflect that 
					the trip is occuring today, and then update any cases related to this event which will trigger
					a milestone on the case record
	History
	<Date>      <Authors Name>     <Brief Description of Change>
	7/2018     	Craig Austgen       Initial Creation

	***************************************************************************************************************/

	public static void updateRelatedCaseWhenTripIsToday(List<Plant_Event__c> events, Map<Id, Plant_Event__c> oldMap) {
		Set<Id> eventIds = new Set<Id>();
		Map<Id, Case> caseMap = new Map<Id, Case>();

		for (Plant_Event__c event : events) {
			Plant_Event__c oldEvent = oldMap.get(event.Id);
			if (!oldEvent.isTripToday__c && event.isTripToday__c && event.Scheduled_Date__c == Date.today()) {
				eventIds.add(event.Id);
			}
		}

		for (Case c : [select id, isTripToday__c from Case where Plant_Event__c IN :eventIds]) {
			c.isTripToday__c = true;
			caseMap.put(c.Id, c);
		}

		if (!caseMap.isEmpty()) {
			update caseMap.values();
		}
	}

}