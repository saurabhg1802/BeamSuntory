trigger BI_TransferRequestTrigger on MarketingPlanAdjustments__c (after update) {
	System.debug(LoggingLevel.INFO,'Entered BI_TransferRequestTrigger');
	
	if (trigger.isAfter) {
		
		if (trigger.isUpdate) {
				
			BI_BudgetTransferLogic.handleBudgetTransferAfterUpdate(trigger.new, 
				trigger.newMap, 
				trigger.old, 
				trigger.oldMap);

		}
	}
}