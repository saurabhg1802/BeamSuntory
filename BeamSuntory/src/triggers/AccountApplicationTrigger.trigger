trigger AccountApplicationTrigger on Account_Application__c (before update,before insert) {
	if (Trigger.isBefore) {
		if (Trigger.isInsert) {
			AccountApplicationTriggerHandler.handleBeforeInsert(Trigger.New);
		} else if (Trigger.isUpdate) {
			AccountApplicationTriggerHandler.handleBeforeUpdate(Trigger.New, Trigger.oldMap);
		}  
	}

	/*else if (Trigger.isAfter ) {
		if (Trigger.isInsert) {
			//AccountApplicationTriggerHandler.handleAfterInsert(Trigger.New, Trigger.newMap);
		} else if (Trigger.isUpdate) {
			//AccountApplicationTriggerHandler.handleAfterUpdate(Trigger.New, Trigger.oldMap);
		}
	}
	*/
}