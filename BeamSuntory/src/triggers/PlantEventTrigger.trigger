trigger PlantEventTrigger on Plant_Event__c (before insert, after insert, before delete, before update) {
	if (Trigger.isBefore) {
		if (Trigger.isInsert) {
			//PlantEventTriggerHandler.handleBeforeInsert(Trigger.New);
		} else if (Trigger.isUpdate) {
			PlantEventTriggerHandler.handleBeforeUpdate(Trigger.New, Trigger.oldMap);
		}  else if (Trigger.isDelete) {
			//PlantEventTriggerHandler.handleBeforeDelete(Trigger.Old, Trigger.oldMap);
		}
	}

	else if (Trigger.isAfter) {
		if (Trigger.isInsert) {
			//PlantEventTriggerHandler.handleAfterInsert(Trigger.New, Trigger.newMap);
		} else if (Trigger.isUpdate) {
			//PlantEventTriggerHandler.handleAfterUpdate(Trigger.New, Trigger.oldMap);
		}
	}
}