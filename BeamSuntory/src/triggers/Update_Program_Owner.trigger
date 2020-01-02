trigger Update_Program_Owner on MarketingPlan__c (after update) {
    
    List<Program__c> programsToUpdate = new List<Program__c>();
    List<MarketingPlan__c> plansWithNewOwner = new List<MarketingPlan__c>();
    List<Id> changedIds = new List<Id>(); 
    Map<Id,Id> campaingPlanMap = new Map<Id,Id>();
    List<Id> relatedCampaignIds = new List<Id>();
    Map<Id,Id> programCampaingMap = new Map<Id,Id>();
    
    for(MarketingPlan__c m : trigger.new){
        //getting marketing plans for which owner is updated
        if(m.OwnerId!=trigger.oldMap.get(m.Id).OwnerId){
            plansWithNewOwner.add(m);
            changedIds.add(m.Id);
        }
    }

    //Fetching related campaigns
    if(changedIds.size()>0){
        for(Campaign__c c : [SELECT Id,ParentMarketingPlan__c FROM Campaign__c WHERE ParentMarketingPlan__c IN:changedIds]){
            campaingPlanMap.put(c.Id,c.ParentMarketingPlan__c);
            relatedCampaignIds.add(c.Id);
        }
     }   
    
    //fetiching related programs to update their owner
    if(relatedCampaignIds.size()>0){
        for(Program__c prog : [SELECT Id,OwnerId,SourceBICampaign__c FROM Program__c WHERE SourceBICampaign__c IN :relatedCampaignIds] ){
            Program__c p = new Program__c();
            p.Id = prog.Id;
            p.OwnerId = trigger.newMap.get(campaingPlanMap.get(prog.SourceBICampaign__c)).OwnerId;
            programsToUpdate.add(p);
        }
     }   
    
    //updating related programs with new owner
    if(programsToUpdate.size()>0){
        update programsToUpdate;
    }

}