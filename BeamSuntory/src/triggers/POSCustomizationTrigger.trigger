trigger POSCustomizationTrigger on POS_Customization__c (after insert, after update) {
	/*if (Trigger.isBefore) {
		if (Trigger.isInsert) {
			POSCustomizationTriggerHandler.handleBeforeInsert(Trigger.New);
		} else if (Trigger.isUpdate) {
			POSCustomizationTriggerHandler.handleBeforeUpdate(Trigger.New, Trigger.oldMap);
		}  else if (Trigger.isDelete) {
			POSCustomizationTriggerHandler.handleBeforeDelete(Trigger.Old, Trigger.oldMap);
		}

	}
	*/

	if (Trigger.isAfter ) {
		if (Trigger.isInsert) {
			POSCustomizationTriggerHandler.handleAfterInsert(Trigger.New, Trigger.newMap);
		} else if (Trigger.isUpdate) {
			POSCustomizationTriggerHandler.handleAfterUpdate(Trigger.New, Trigger.oldMap);
		}
	}
}