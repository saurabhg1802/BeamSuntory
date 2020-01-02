trigger GVSalesOrderTrigger on gvp__Sales_Order__c (before delete, before insert, before update, after delete, after insert, after update) {
  if (Trigger.isBefore) {
    //if(Trigger.isInsert){}
    //if(Trigger.isUpdate){}
  }
  if (Trigger.isAfter) {
    //if(Trigger.isInsert){}
    if(Trigger.isUpdate){
      GVSalesOrderTriggerHandler.handleAfterUpdate(Trigger.New, Trigger.oldMap);
    }
  }
}