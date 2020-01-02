trigger Update_Campaign_Mirrored_Program on Program__c (after insert,after update) {
    
    List<Campaign__c> campaignsToUpdate = new List<Campaign__c>();
    Set<Id> sourceCampaignIds = new Set<Id>();
    Set<Id> checkDupeId = new Set<Id>();
    
    //This Process will only happen when immediately after a campaign's Mirrored_Program__c is updated
    //Map<Id,Campaign__c> campaignMap = new Map<Id,Campaign__c>([SELECT Id,Mirrored_Program__c FROM Campaign__c  WHERE LastModifiedDate = LAST_N_DAYS:1]); 
    
    for(Program__c p : trigger.new){
        if(p.SourceBICampaign__c!=null){
            sourceCampaignIds.add(p.SourceBICampaign__c);            
        } 
        if(trigger.isUpdate && trigger.oldMap.get(p.Id).SourceBICampaign__c!=null){
        	sourceCampaignIds.add(trigger.oldMap.get(p.Id).SourceBICampaign__c);
        }      
    }
    
    Map<Id,Campaign__c> campaignMap = new Map<Id,Campaign__c>([SELECT Id,Mirrored_Program__c FROM Campaign__c  WHERE Id IN:sourceCampaignIds]); 
    
    for(Program__c p : trigger.new){
        if(p.SourceBICampaign__c!=null ){						
    		if(campaignMap.get(p.SourceBICampaign__c)!=null && campaignMap.get(p.SourceBICampaign__c).Mirrored_Program__c!=p.Id && !checkDupeId.contains(p.SourceBICampaign__c)){	//To avoid "Duplicate id in list" error in test class
                Campaign__c c = new Campaign__c();
                c.id = p.SourceBICampaign__c;
                c.Mirrored_Program__c = p.Id;
            	campaignsToUpdate.add(c);
            	checkDupeId.add(p.SourceBICampaign__c);             
            }
            if(trigger.isUpdate && trigger.oldMap.get(p.Id).SourceBICampaign__c!=p.SourceBICampaign__c && !checkDupeId.contains(trigger.oldMap.get(p.Id).SourceBICampaign__c)){	   //To avoid "Duplicate id in list" error in test class
                Campaign__c c = new Campaign__c();
                c.id = trigger.oldMap.get(p.Id).SourceBICampaign__c;
                c.Mirrored_Program__c = null;                
                campaignsToUpdate.add(c);
                checkDupeId.add(trigger.oldMap.get(p.Id).SourceBICampaign__c);
            }
    	}
    }              
    
    //updating campaigns with new Mirrored_Program__c value
    if(campaignsToUpdate.size()>0){
        update campaignsToUpdate;
    }    
}