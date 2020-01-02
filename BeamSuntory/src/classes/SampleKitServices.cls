public class SampleKitServices {

	/**************************************************************************************************************
	Author:        Craig Austgen
	Company:       Slalom, LLC
	Description:	Once the Tracking information is entered on a sample kit then the related cases will be updated
					and start a milestone on the case giving the sales rep 30 days to make a sample selection in the
					customer community
	History
	<Date>      <Authors Name>     <Brief Description of Change>
	7/2018     	Craig Austgen       Initial Creation

	***************************************************************************************************************/
	public static void updateRelatedCaseWhenSampleKitIsShipped(List<Sample_Kit__c> samples, Map<Id, Sample_Kit__c> oldMap) {
		Set<Id> barrelGroupIds = new Set<Id>();
		Map<Id, Case> casesToUpdate = new Map<Id, Case>();

		for (Sample_Kit__c sk : samples) {
			Sample_Kit__c oldSampleKit = oldMap.get(sk.Id);
			if (String.isBlank(oldSampleKit.Tracking_Number__c) && String.isNotBlank(sk.Tracking_Number__c)) {
				barrelGroupIds.add(sk.Barrel_Order_Group__c);
			}
		}

		for (Case c : [select id, Sample_Kit_Shipped__c from Case where Barrel_Order_Group__c IN : barrelGroupIds]) {
			c.Sample_Kit_Shipped__c = true;
			casesToUpdate.put(c.Id, c);
		}

		if (!casesToUpdate.isEmpty()) {
			update casesToUpdate.values();
		}
	}

	/**************************************************************************************************************
	Author:        Craig Austgen
	Company:       Slalom, LLC
	Description:	pulls in the Submitter from the barrel order to set the recipient for the email alert that goes out
					once the tracking number is entered
	History
	<Date>      <Authors Name>     <Brief Description of Change>
	7/2018     	Craig Austgen       Initial Creation

	***************************************************************************************************************/
	public static void updateSubmitter(List<Sample_Kit__c> samples) {
		Set<Id> barrelGroupIds = new Set<Id>();
		Map<Id, Id> barrelOrderGroupToSubmitter = new Map<Id, Id>();

		for (Sample_Kit__c sk : samples) {
			if (sk.Submitter__c == null) {
				barrelGroupIds.add(sk.Barrel_Order_Group__c);
			}
		}

		for (Case c : [select id, Barrel_Order_Group__c, Submitter__c from Case where Barrel_Order_Group__c IN : barrelGroupIds]) {
			barrelOrderGroupToSubmitter.put(c.Barrel_Order_Group__c, c.Submitter__c );
		}

		for (Sample_Kit__c sk : samples) {
			if (barrelOrderGroupToSubmitter.containsKey(sk.Barrel_Order_Group__c)) {
				sk.Submitter__c = barrelOrderGroupToSubmitter.get(sk.Barrel_Order_Group__c);
			}
		}
	}
}