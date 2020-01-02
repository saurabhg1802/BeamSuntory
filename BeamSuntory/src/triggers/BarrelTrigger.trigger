trigger BarrelTrigger on Barrel__c (before insert, before update) {
	if (Trigger.isBefore) {
		if (Trigger.isInsert) {
			BarrelTriggerHandler.handleBeforeInsert(Trigger.New);
		} else if (Trigger.isUpdate) {
			BarrelTriggerHandler.handleBeforeUpdate(Trigger.New, Trigger.oldMap);
		} 
	}

	/*else if (Trigger.isAfter ) {
		if (Trigger.isInsert) {
			BarrelTriggerHandler.handleAfterInsert(Trigger.New, Trigger.newMap);
		} else if (Trigger.isUpdate) {
			BarrelTriggerHandler.handleAfterUpdate(Trigger.New, Trigger.oldMap);
		}
	}
	*/
}