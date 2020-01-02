/**************************************************************************************
Apex Class Name     : caseTrigger
Created Date        : 1/2016
Function            : calls method in caseTriggerHandler
*************************************************************************************/

trigger caseTrigger on Case(before insert, after insert, before update, after update) {
    System.debug('TRIGGER OPERATION TYPE >>>>>>>>> ' + Trigger.operationType);
    
    for(Case caseObj : Trigger.New) {
        system.debug('<<CASE>>' + Trigger.New);
        if(caseObj.RecordTypeId != CSConstants.DUMMY_CASE_RT_ID) {
            if (Trigger.isBefore) {
                if (Trigger.isInsert) { 
                    caseTriggerHandler.handleBeforeInsert(Trigger.New);
                } else if (Trigger.isUpdate) {
                    caseTriggerHandler.handleBeforeUpdate(Trigger.New, Trigger.oldMap);
                }  
            } else if (Trigger.isAfter) {
                if (Trigger.isInsert) {
                    //caseTriggerHandler.handleAfterInsert(Trigger.New, Trigger.newMap);
                    //change
                    List <Case> cases = new List <Case> ();
                    for (Case c: Trigger.new) {
                        cases.add(new Case(id = c.id));
                    }
                    Database.DMLOptions dmo = new Database.DMLOptions();
                    dmo.assignmentRuleHeader.useDefaultRule = true;
                    Database.update(cases, dmo);
                } else if (Trigger.isUpdate) {
                    caseTriggerHandler.handleAfterUpdate(Trigger.New, Trigger.oldMap);
                }
            }
        }
    }
}