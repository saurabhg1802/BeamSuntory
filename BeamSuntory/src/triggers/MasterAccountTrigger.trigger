trigger MasterAccountTrigger on Account (after update,before update,before insert) {
    
    if(trigger.isAfter && trigger.isUpdate){
        Set<Id> modifiedOwnerAccIds = new Set<Id>() ; 
        Set<Id> modifiedNameAccIds = new Set<Id>() ; 
        Set<Id> modifiedAccIds = new Set<Id>() ; 
        Set<Id> newOwnerIds = new Set<Id>();
        List<Opportunity> OpportunitiesToUpdate = new List<Opportunity>();
        
        for(Account a : trigger.new){
            if(a.OwnerId!=trigger.oldMap.get(a.Id).OwnerId){
                modifiedOwnerAccIds.add(a.Id);
                newOwnerIds.add(a.OwnerId);
            }
            if(a.Name!=trigger.oldMap.get(a.Id).Name){
                modifiedNameAccIds.add(a.Id);
            }
        }
        modifiedAccIds.addAll(modifiedOwnerAccIds);
        modifiedAccIds.addAll(modifiedNameAccIds);
        List<Opportunity> relatedOpps = new List<Opportunity>();
        Set<Id> brandIds = new Set<Id>(); 
        
        for(Opportunity o:[SELECT Id,OwnerId,AccountId,BrandVariety__c,SizeDescription__c,StageName FROM Opportunity WHERE AccountId IN:modifiedAccIds]){
            relatedOpps.add(o);
            if(modifiedNameAccIds.contains(o.AccountId) && o.BrandVariety__c!=null ){
                brandIds.add(o.BrandVariety__c); 
            }
        }
        
        Map<Id,User> userStatusMap = new Map<Id,User>([SELECT Id,IsActive FROM User WHERE Id IN:newOwnerIds]);
        Map<Id,Tags__c> tagsMap = new Map<Id,Tags__c>([SELECT Id,Name FROM Tags__c WHERE Id IN:brandIds]);
        
        for(Opportunity o : relatedOpps){
            Opportunity opp = new Opportunity();
            opp.Id = o.Id;
            Boolean updateFlag = false;
            
            if(modifiedOwnerAccIds.contains(o.AccountId) && userStatusMap.get(trigger.newMap.get(o.AccountId).OwnerId).IsActive){
                  opp.OwnerId = trigger.newMap.get(o.AccountId).OwnerId;   
                  updateFlag = true;           
            }
            
            if(modifiedNameAccIds.contains(o.AccountId)){    
                String oppName;
                
                oppName = trigger.newMap.get(o.AccountId).Name + ' - ';
    
                if(tagsMap.get(o.BrandVariety__c)!=null){
                    oppName = oppName  + tagsMap.get(o.BrandVariety__c).Name + ' ';
                }
                if(o.SizeDescription__c!=null && o.SizeDescription__c!=''){
                    oppName = o.SizeDescription__c;
                }
                if(oppName!=null){
                    o.Name = oppName.left(120);
                }
                updateFlag = true;
            }
            
            if(updateFlag){
                OpportunitiesToUpdate.add(opp);
            }
        }
        
        if(OpportunitiesToUpdate.size()>0){
            update OpportunitiesToUpdate;
        }
        
    }
    
    if(trigger.isBefore && (trigger.isUpdate || trigger.isInsert)){
        //List<Id> accountsToUpdateIds = new List<Id>(); 
        List<Id> territoryTagIds = new List<Id>(); 
        List<String> territoryStrings = new List<String>(); 
        /*for(String mandatoryField : checkFieldList){
            if(fieldMap.containsKey(mandatoryField.trim())){
                String fieldValue = (String)string.valueOf(newObj.get(mandatoryField.trim()));
                system.debug('@@fieldValue'+fieldValue);
                if(fieldValue==null || fieldValue==''){
                    //String fieldLabel = oppFieldLabelMap.get(field.trim()).getDescribe().getLabel();
                    String fieldLabel = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap().get(mandatoryField.trim()).getDescribe().getLabel();
                    system.debug('@@fieldLabel'+fieldLabel);
                    blankLabels += fieldLabel+'; ';
                }
            }
        }*/
        for(Account a : trigger.new){
            /*for(String mandatoryField : checkFieldList){
                if(a.Territory__c=='NULL' || a.Territory__c=='null'){
                    a.Territory__c = '';
                }     
            } */ 
            
            if(a.Territory__c=='NULL' || a.Territory__c=='null'){
                a.Territory__c = '';
            }    
            
            if(a.TerritoryTag__c!=null && (a.Territory__c=='' || a.Territory__c == null)){
                territoryTagIds.add(a.TerritoryTag__c);
            }
            
            if(a.TerritoryTag__c==null && (a.Territory__c!='' && a.Territory__c != null)){
                territoryStrings.add(a.Territory__c);
            }
            
        }
        Map<Id,Tags__c> territoryTagsMap = new Map<Id,Tags__c>([SELECT Id, Name FROM Tags__c WHERE Id IN:territoryTagIds]);
        
        for(Account a : trigger.new){
            if(a.TerritoryTag__c!=null && (a.Territory__c=='' || a.Territory__c == null)){
                a.Territory__c = territoryTagsMap.get(a.TerritoryTag__c).Name;
            }           
        }   
    }
    
    
}