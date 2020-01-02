trigger SampleKitTrigger on Sample_Kit__c (before update, before insert) {
	if (Trigger.isBefore) {
		if (Trigger.isUpdate) {
			SampleKitTriggerHandler.handleBeforeUpdate(Trigger.New, Trigger.oldMap);
		} else if (Trigger.isInsert) {
			SampleKitTriggerHandler.handleBeforeInsert(Trigger.New);
		}
	}

	/*else if (Trigger.isAfter ) {
		if (Trigger.isInsert) {
			SampleKitTriggerHandler.handleAfterInsert(Trigger.New, Trigger.newMap);
		} else if (Trigger.isUpdate) {
			SampleKitTriggerHandler.handleAfterUpdate(Trigger.New, Trigger.oldMap);
		}
	}
	*/
}