public class CampaignServices
{
    public static List<Campaign__c> getAUSCampaigns(List<Campaign__c> campaigns)
    {
        List<Campaign__c> campaignsToReturn = new List<Campaign__c>();
        Id australiaRecordTypeId = Schema.SObjectType.Campaign__c.getRecordTypeInfosByName().get('Australia Campaign (WBS)').getRecordTypeId();

        for(Campaign__c campaign : campaigns)
        {
            if(campaign.RecordTypeId == australiaRecordTypeId)
            {
                campaignsToReturn.add(campaign);
            }
        }

        return campaignsToReturn;
    }

    public static Set<Id> checkForWBSUpdates(List<Campaign__c> newCampaigns, Map<Id, Campaign__c> oldCampaignMap)
    {
        List<Schema.fieldSetMember> fieldsToCheck = SObjectType.Campaign__c.FieldSets.getMap().get('Webservice_Update').getFields();
        Set<Id> campaignIds = new Set<Id>();
        for(Campaign__c campaign : newCampaigns)
        {
            Campaign__c oldCampaign = oldCampaignMap.get(campaign.Id);
          If(String.isNotBlank(campaign.WBSCode__c)){
            for(Schema.fieldSetMember field : fieldsToCheck)
            {
                Object oldValue = oldCampaign.get(field.getFieldPath());
                Object newValue = campaign.get(field.getFieldPath());
                if(oldValue != null && newValue != null && oldValue != newValue)
                {
                    campaignIds.add(campaign.Id);
                    break;
                }
            }
          }
        }

        if(!campaignIds.isEmpty())
        {
            if(!Test.isRunningTest())
            {
                BI_WBSCalloutUtility.makeCallout(campaignIds);
            }
        }
        return campaignIds;
    }

    public static List<Campaign__c> populateProgramAndPlatforms(List<Campaign__c> campaigns)
    {
        List<Campaign__c> campaignsToReturn = new List<Campaign__c>();

       
        Id platformRecordTypeId = Schema.SObjectType.Program__c.getRecordTypeInfosByName().get('Platform').getRecordTypeId();
        Id programRecordTypeId = Schema.SObjectType.Program__c.getRecordTypeInfosByName().get('Focus Calendar National Priority').getRecordTypeId();
        Id platformId ;

        List<Program__c> relatedPlatforms = [SELECT Id, Name FROM Program__c WHERE RecordTypeId =: platformRecordTypeId];

        Map<String, Id> nameToPlatformIdMap = new Map<String, Id>();
        for(Program__c program : relatedPlatforms)
        {
            nameToPlatformIdMap.put(program.Name, program.Id);
        }

        Program__c otherProgram = [SELECT Id, Name FROM Program__c WHERE Name = 'Other' AND RecordTypeId =: programRecordTypeId LIMIT 1];
        Map<String,ProgramToPlatformMap__c> pmp = ProgramToPlatformMap__c.getall();

      for(Campaign__c campaign : campaigns)
        {
                
                if(campaign.Related_Priority__c == null)
                {
                    Id parentProgramId = campaign.ParentProgram__c;
                    if(parentProgramId == null)
                    {
                        parentProgramId = campaign.ParentMarketingPlan__r.Related_Program__c;
                    }
                    if(parentProgramId != null)
                    {
                        campaign.Related_Priority__c = parentProgramId;
                        String programName = campaign.ParentProgramName__c;

                        if (pmp.get(programName)!= null) {
                            platformId = nameToPlatformIdMap.get(pmp.get(programName).platform__c);  
                        }
                        if (platformId == null) {
                            platformId = nameToPlatformIdMap.get(programName);  
                        }
                        if(platformId != null)
                        {
                            campaign.Platform__c = platformId;
                        }
                        else
                        {
                            campaign.Platform__c = nameToPlatformIdMap.get('Other');
                        }
                    }
                    else
                    {
                        campaign.Related_Priority__c = otherProgram.Id;
                        campaign.Platform__c = nameToPlatformIdMap.get('Other');
                    }
                }
                else
                {
                    String programName = campaign.Program_Name__c;
                    
                    //Id platformId = nameToPlatformIdMap.get(programName);

                    //try custom setting for the custom mapping  otherwise  
                    //try to find matching  platform  to  program name 
                    // Otherwise set to Other
                    if (pmp.get(programName)!= null) {
                        platformId = nameToPlatformIdMap.get(pmp.get(programName).platform__c);  
                    }
                    if (platformId == null) {
                        platformId = nameToPlatformIdMap.get(programName);  
                    }
                    
                    if(platformId != null)
                    {
                        campaign.Platform__c = platformId;
                    }
                    else
                    {
                        campaign.Platform__c = nameToPlatformIdMap.get('Other');
                    }
                }
                campaignsToReturn.add(campaign);
        } 
        return campaignsToReturn;
    }
}