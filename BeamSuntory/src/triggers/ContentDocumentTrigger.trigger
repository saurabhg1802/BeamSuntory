trigger ContentDocumentTrigger on ContentDocument (before delete) {
    if (Trigger.isBefore) {
        if (Trigger.isDelete) {
            System.debug('---ContentDocument Trigger is Fired---');
            ContentDocumentTriggerHandler.handleBeforeDelete(Trigger.Old, Trigger.oldMap);
        }
    }

}