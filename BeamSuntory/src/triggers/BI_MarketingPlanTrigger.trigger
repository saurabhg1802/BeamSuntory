trigger BI_MarketingPlanTrigger on MarketingPlan__c (before insert, before update, after insert, after update, after delete, after undelete) {
	
	System.debug(LoggingLevel.INFO,'Entered BI_MarketingPlanTrigger');

	if(trigger.isBefore){
		if(trigger.isInsert){
			BI_BudgetManagerLogic.handleMarketingPlanBeforeInsert(trigger.new);
		} else if(trigger.isUpdate){
			BI_BudgetManagerLogic.handleMarketingPlanBeforeUpdate(trigger.oldMap, trigger.newMap);
		}

	} else if (trigger.isAfter) {   
		   
      	if (trigger.isInsert) {  
      		    	
      		BI_BudgetManagerLogic.handleMarketingPlanAfterInsert(trigger.new); 
      		         
      	} else if (trigger.isUpdate) {
      		
      		BI_BudgetManagerLogic.handleMarketingPlanAfterUpdate(trigger.new, trigger.newMap, trigger.old, trigger.oldMap); 
      		
      	} else if (trigger.isDelete) {
      		
      		BI_BudgetManagerLogic.handleMarketingPlanAfterDelete(trigger.old); 
      		
      	} else if (trigger.isUndelete) {
      		
      		BI_BudgetManagerLogic.handleMarketingPlanAfterUndelete(trigger.new); 
      		
      	}
	}	
}