trigger MasterOpportunityTrigger on Opportunity (before insert,before update) {
    
    //List<Opportunity> opportunitiesToUpdateName = new List<Opportunity>();
    List<Id> parentAccountIds = new List<id>();
    List<Id> parentBrandVarietyIds = new List<id>();
    
    
    for(Opportunity o : trigger.new){
        parentAccountIds.add(o.AccountId); 
        parentBrandVarietyIds.add(o.BrandVariety__c);    
    }
    
    Map<Id,Account> parentAccounts = new Map<Id,Account>([SELECT Id,Name,OwnerId,Owner.IsActive FROM Account WHERE Id IN:parentAccountIds]);
    Map<Id,Tags__c> parentBrandVarieties = new Map<Id,Tags__c>([SELECT Id,Name FROM Tags__c WHERE Id IN:parentBrandVarietyIds]);
    
    for(Opportunity o : trigger.new){
        if(o.StageName=='Open - Aperity Provided'){
            String oppName;
            if(parentAccounts.get(o.AccountId)!=null){
                oppName = parentAccounts.get(o.AccountId).Name + ' - ';
            } 
            if(parentBrandVarieties.get(o.BrandVariety__c)!=null){
                oppName = oppName  + parentBrandVarieties.get(o.BrandVariety__c).Name + ' ';
            }
            if(o.SizeDescription__c!=null && o.SizeDescription__c!=''){
                oppName =  oppName  + o.SizeDescription__c;
            }
            if(oppName!=null){
                o.Name = oppName.left(120);
            }
        }
        if(parentAccounts.get(o.AccountId)!=null && parentAccounts.get(o.AccountId).Owner.IsActive){
            o.OwnerId = parentAccounts.get(o.AccountId).OwnerId;   
        }
    }
    
}