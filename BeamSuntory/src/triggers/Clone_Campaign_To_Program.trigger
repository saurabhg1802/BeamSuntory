trigger Clone_Campaign_To_Program on Campaign__c (after insert, after update) {
   
    System.debug('before if::::');
    Id programRecordTypeId;
    Id AccountRecordTypeId;
    if(!Test.isRunningTest())
   { 
    if(Trigger.isUpdate)
    {
        for(Campaign__c cmp:Trigger.new)
        System.debug('Value of Mirrored Program=====>'+cmp.Mirrored_Program__c);
    }
try{
    List<Campaign__c> campaignsToClone = new List<Campaign__c>(); 
    List<Id>  marketingPlanIds = new List<Id>();
    List<Id> brandIds = new List<Id>();
    Map<Id,Id> brandQualityMap = new Map<Id,Id>();
    List<Program__c> programsToInsert = new List<Program__c>();
    List<Program__c> programsToUpdate = new List<Program__c>();

    
    //Fetching the record typeId for new programs to create
    programRecordTypeId = [SELECT Id FROM RecordType Where DeveloperName='Brand_Investment_Programs' AND SObjectType='Program__c'].Id;
    System.debug('record type id is:::'+programRecordTypeId);
    //Fetching CampaignToProgramTranspose__c settings values
    Map<String,CampaignToProgramTranspose__c> campaignToProgramMap = CampaignToProgramTranspose__c.getAll();
    
    Map<String,CampaignToProgramTranspose__c> programTransposeMap = new Map<String,CampaignToProgramTranspose__c>();
    
    //Preparing CampaignToProgramTranspose__c settings map with GL_Descreption as key
    for(CampaignToProgramTranspose__c c : campaignToProgramMap.values()){
        System.debug('inside for CampaignToProgramTranspose__c');    
        programTransposeMap.put(c.GL_Description__c,c);
    }
    
    //Preparing list of campaigns which needs to be cloned
    for(Campaign__c c : trigger.new){
    System.debug('inside for trigger.new:::');
        if(trigger.isUpdate){
        System.debug('inside if trigger.isUpdate:::');
            system.debug(trigger.oldMap.get(c.Id).Mirrored_Program__c+'from trigger mirror program'+ c.Mirrored_Program__c);
        }    
        if(trigger.isInsert || (trigger.isUpdate && c.Mirrored_Program__c!=trigger.oldMap.get(c.Id).Mirrored_Program__c)){            //Prevented duplicate creation of program
        System.debug('inside if trigger.isInsert:::');
            if((c.Region__c != 'National Accounts Region' && c.Region__c != 'Canada' && c.Region__c != 'Mexico') && (c.Territory__c !='NA Off-Premise' && c.Territory__c !='NA On-Premise')){
            System.debug('inside if Region__c :::');
                campaignsToClone.add(c);
                System.debug('inside if Region__c  campaignsToClone size is:::'+campaignsToClone.size());
                if(c.ParentMarketingPlan__c!=null ){
                    //preparing parent marketing id list to query marketing plan
                    marketingPlanIds.add(c.ParentMarketingPlan__c);
                }
                if(c.Brand_Quality__c!=null){
                    //preparing Brand_Quality__c id list to query tag
                    brandIds.add(c.Brand_Quality__c);
                }
            }
        }
    }
    
    //Querying tags for getting PL4_Brand__c value
    Map<Id,Tags__c> qualityMap = new Map<Id,Tags__c>([SELECT Id,PL4_Brand__c FROM Tags__c WHERE Id IN:brandIds]);
   //system.debug('##qualityMap'+qualityMap);

    //Querying marketing plans for getting owner and territory
    Map<Id,MarketingPlan__c> marketingPlanMap = new Map<Id,MarketingPlan__c>([SELECT Id,OwnerId,Territory__c FROM MarketingPlan__c WHERE Id IN:marketingPlanIds]);
    

    
    //Preparing the program records for insert or update
    for(Campaign__c c : campaignsToClone){
    System.debug('inside for campaignsToClone:::');   
        Program__c p = new Program__c();

        system.debug('@@qualityMap.get(c.Brand_Quality__c).PL4_Brand__c'+qualityMap.get(c.Brand_Quality__c).PL4_Brand__c+'@qualityMap.get(c.Brand_Quality__c).PL4_Brand__c'+qualityMap.get(c.Brand_Quality__c));
        if(qualityMap.get(c.Brand_Quality__c)!=null){
            p.Brand__c = qualityMap.get(c.Brand_Quality__c).PL4_Brand__c;
        }
        
        p.BrandQuality__c = c.Brand_Quality__c;
        p.SpendDescription__c = c.GLDescription__c;
        p.ProgrammingType__c = (programTransposeMap.get(c.GLDescription__c) == null) ? null : programTransposeMap.get(c.GLDescription__c).ProgrammingType__c;
        p.ProgramFocus__c = (programTransposeMap.get(c.GLDescription__c) == null) ? null : programTransposeMap.get(c.GLDescription__c).ProgramFocus__c;
        p.Channel__c = (programTransposeMap.get(c.GLDescription__c) == null) ? null : programTransposeMap.get(c.GLDescription__c).ChannelType__c;
        system.debug('@@programTransposeMap.get(c.GLDescription__c).ChannelType__c'+programTransposeMap.get(c.GLDescription__c));
        
        p.Budget__c = c.PlannedCampaignSpend__c;
        p.Name = c.Name;
        p.Distributor__c = c.Distributor__c;
        p.EndDate__c = c.InitialEndDate__c;
        p.IOCode__c = c.IOCode__c;
        if(c.ParentMarketingPlan__c!=null){
            p.OwnerId = marketingPlanMap.get(c.ParentMarketingPlan__c).OwnerId;     
        }
        p.RecordtypeId = programRecordTypeId ;
        System.debug('Record type id is::::'+p.RecordtypeId);
        p.Funds__c = 'BI';
        p.Parent__c = c.Related_Priority__c;        
        p.StartDate__c = c.InitialStartDate__c;
        if(c.ParentMarketingPlan__c!=null){
            p.Territory__c = marketingPlanMap.get(c.ParentMarketingPlan__c).Territory__c;
        }
        p.SourceBICampaign__c = c.Id;
        
        //p.NationalAccount__c = c.NationalAccount__c;      //to be used later
        
        if(c.Mirrored_Program__c==null){    // if Mirrored_Program__c not populated then program will be inserted else will be updated
            system.debug('inside if c.Mirrored_Program__c==null');
            programsToInsert.add(p);
            System.debug('programsToInsert size is:::'+programsToInsert.size());
        }
        else{
            p.Id = c.Mirrored_Program__c;
            //p.Distributor__c = c.Distributor__c;
            System.debug('Record type id is::::'+p.RecordtypeId);
            programsToUpdate.add(p);
            System.debug('programsToUpdate size is:::'+programsToUpdate.size());
        }
    }
    
    //inserting program for campaign clone
    if(programsToInsert.size()>0){
        system.debug('inside trigger insert');
        insert programsToInsert;
    }
    
    //updating cloned program
    if(programsToUpdate.size()>0){
        system.debug('inside trigger update');
        //System.debug('Record type id is::::'+p.RecordtypeId);
        update programsToUpdate;
        
    }
       }catch(Exception e){
           System.debug('exception has been caught:::');
       }
}
   System.debug('end of if:::'+programRecordTypeId);
       
}