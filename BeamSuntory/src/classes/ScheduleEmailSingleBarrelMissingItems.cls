global class ScheduleEmailSingleBarrelMissingItems implements Schedulable {
	global void execute(SchedulableContext sc) {
		String query;
		Set<Id> caseRtIds = SBP_Constants.caseSingleBarrelRtIds;

		try {
			query = 'select Id '
			        + ', Purchase_Order_Uploaded__c'
			        + ', Bottle_Text_Entered__c'
			        + ', POS_Items_Selected__c'
			        + ', Barrel_Selected__c'
			        + ', ContactId'
			        + ', CcEmail__c'
			        + ', Brand__c'
			        + ', Submitter__c'
			        + ', Submitter__r.Name'
			        + ', Status'
			        + ', RecordTypeId FROM Case where Case.RecordTypeId IN :caseRtIds'
			        + '  AND (Purchase_Order_Uploaded__c = FALSE OR Bottle_Text_Entered__c = FALSE OR POS_Items_Selected__c = FALSE OR Barrel_Selected__c = FALSE)'
			        + '  AND Status != \'Closed\''
			        + '  AND Status != \'Closed - Abandoned\'';

			BatchEmailSingleBarrelMissingItems batch = new BatchEmailSingleBarrelMissingItems(query, caseRtIds);
			ID batchprocessid = Database.executeBatch(batch, 50);
		} catch (Exception ex) {
			CreateExceptionLog.insertErrorLog('BatchEmailSingleBarrelMissingItems', 'execute', String.valueOf(ex), 'Fatal');
		}
	}
}