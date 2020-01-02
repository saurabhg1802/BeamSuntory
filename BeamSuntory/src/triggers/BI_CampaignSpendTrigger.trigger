trigger BI_CampaignSpendTrigger on Campaign_Spend__c (before insert, before update){
	System.debug(LoggingLevel.INFO,'Entered BI_CampaignSpendTrigger');
	if (trigger.isBefore) {     		   
      	if (trigger.isInsert) {        		    	
      		BI_BudgetManagerLogic.handleCampaignSpendBeforeInsert(trigger.new);       		         
      	} else if (trigger.isUpdate) {
      		BI_BudgetManagerLogic.handleCampaignSpendBeforeUpdate(trigger.oldMap, trigger.newMap); 
      	}
	}
}