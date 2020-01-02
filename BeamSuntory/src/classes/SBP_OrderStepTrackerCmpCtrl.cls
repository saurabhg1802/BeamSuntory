public class SBP_OrderStepTrackerCmpCtrl {

	/**************************************************************************************************************
	Method name:    getOrderSteps
	Object:         Case
	RecordType:
	Date:           2/2018
	Details and Notes:

	***************************************************************************************************************/
	@AuraEnabled
	public static LightningComponentUtility.RequestStatus getOrderSteps(Id recordId, String sObjectType) {
		Boolean success = true;
		String message = null;
		Map<String, Object> responseMap = new Map<String, Object>();

		try {

			if (sObjectType == 'Case') {
				Case c = [select id, POS_Items_Selected__c, Purchase_Order_Uploaded__c, Barrel_Selected__c, Bottle_Text_Entered__c from Case where Id = :recordId limit 1];
				responseMap.put('record', c);
			} 

		} catch (Exception e) {
			System.debug(LoggingLevel.INFO, e.getMessage());
			message = e.getMessage();
			success = false;

		}

		LightningComponentUtility.RequestStatus requestStatus = new LightningComponentUtility.RequestStatus(success, message, responseMap);
		System.debug(LoggingLevel.INFO, requestStatus);
		return requestStatus;
	}


}