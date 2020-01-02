public class BI_CampaignControllerExtension {
	
	private final Campaign__c campaign;
	private ApexPages.StandardController standardController;
	
	public BI_CampaignControllerExtension(ApexPages.StandardController stdController) {
		this.standardController = stdController;
		this.campaign = (Campaign__c)stdController.getRecord();
		System.debug(LoggingLevel.INFO,this.campaign);
	}
	
	public PageReference generateIOFromPageLayout()
    {
        Id recordId = standardController.getId();
        
        set<Id> campaignIds = new set<Id>{ recordId };
        System.debug(LoggingLevel.INFO,'Campaign IDs: ' + campaignIds);
        
     	List<CampaignIOResult> results = BI_CampaignIntegrationLogic.generateIOCodes(campaignIds);
     	System.debug(LoggingLevel.INFO,'IO Results:' + results);
     	if (results != null && results.size() == 1 && results.get(0).IsSuccess) {
     		
     		//Redirect to the same page.
	 		PageReference pageRef = new PageReference('//' + recordId);	
	 		return pageRef;
	 		
     	} else {
     		
     		String errMessage = (results != null && results.size() == 1 && !String.isBlank(results.get(0).Message)) ? 
     			results.get(0).Message : 'An unexpected error occurred. Please try again or contact administrator.';
     			
 			ApexPages.addmessage(new ApexPages.message(ApexPages.severity.Error, errMessage)); 
 			return null;
     	}
    }	

    public PageReference generateWBSFromPageLayout()
    {
        Id recordId = standardController.getId();
        
        Set<Id> campaignIds = new Set<Id>{recordId};
        System.debug(LoggingLevel.INFO,'Campaign IDs: ' + campaignIds);
        
        List<CampaignWBSResult> results = BI_CampaignIntegrationLogic.generateWBSCodes(campaignIds);
        System.debug(LoggingLevel.INFO,'WBS Results:' + results);
        if (results != null && results.size() == 1 && results.get(0).IsSuccess) {
            
            //Redirect to the same page.
            PageReference pageRef = new PageReference('//' + recordId); 
            return pageRef;
            
        } else {
            
            String errMessage = (results != null && results.size() == 1 && !String.isBlank(results.get(0).Message)) ? 
                results.get(0).Message : 'An unexpected error occurred. Please try again or contact administrator.';
                
            ApexPages.addmessage(new ApexPages.message(ApexPages.severity.Error, errMessage)); 
            return null;
        }
    }   
}