trigger BI_CampaignTrigger on Campaign__c (after delete, before insert, before update, after insert, after update) {
	
	System.debug(LoggingLevel.INFO,'Entered BI_CampaignTrigger');
	if(trigger.isDelete) {
            BI_BudgetManagerLogic.handleCampaignAfterDelete(trigger.old);
    } else if (trigger.isAfter) {     		   
      	if (trigger.isInsert) {        		    	
      		BI_BudgetManagerLogic.handleCampaignAfterInsert(trigger.new);       		         
      	} else if (trigger.isUpdate) {
      		BI_BudgetManagerLogic.handleCampaignAfterUpdate(trigger.new, trigger.newMap, trigger.old, trigger.oldMap); 
      	} 
	} else if (trigger.isBefore) {
		if (trigger.isInsert) {
			BI_BudgetManagerLogic.handleCampaignBeforeInsert(trigger.new);	
		} else if(trigger.isUpdate){
			BI_BudgetManagerLogic.handleCampaignBeforeUpdate(trigger.oldMap, trigger.newMap);
		}
	}
}