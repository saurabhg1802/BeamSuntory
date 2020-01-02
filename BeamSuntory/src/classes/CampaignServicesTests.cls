@isTest
private class CampaignServicesTests
{
    @testSetup
    private static void setup()
    {
        Id platformRecordTypeId = Schema.SObjectType.Program__c.getRecordTypeInfosByName().get('Platform').getRecordTypeId();
        Id programRecordTypeId = Schema.SObjectType.Program__c.getRecordTypeInfosByName().get('Focus Calendar National Priority').getRecordTypeId();

        Program__c testProgram = new Program__c();
        testProgram.Name = 'Other';
        testProgram.RecordTypeId = platformRecordTypeId;

        Program__c testProgram2 = new Program__c();
        testProgram2.Name = 'Bourbon Legends';
        testProgram2.RecordTypeId = platformRecordTypeId;

        Program__c testProgram3 = new Program__c();
        testProgram3.Name = 'Other';
        testProgram3.RecordTypeId = programRecordTypeId;

        insert new List<Program__c>{testProgram, testProgram2, testProgram3};
    }

    private static Program__c getProgramByNameAndRecordType(String name, Id recordTypeId)
    {
        return [SELECT Id, Name FROM Program__c WHERE Name =: name AND RecordTypeId =: recordTypeId LIMIT 1];
    }

    @isTest
    private static void testCheckForWBSUpdatesSuccessForFieldChangeInFieldSet()
    {
        Id fakeId = TestDataFactory.getFakeId(Campaign__c.sObjectType);

        Campaign__c oldCampaign = new Campaign__c();
        oldCampaign.Id = fakeId;
        oldCampaign.PlannedCampaignSpend__c = 10;

        Campaign__c newCampaign = new Campaign__c();
        newCampaign.Id = fakeId;
        newCampaign.PlannedCampaignSpend__c = 20;

        List<Campaign__c> newCampaignList = new List<Campaign__c>{newCampaign};
        Map<Id, Campaign__c> oldCampaignMap = new Map<Id, Campaign__c>{fakeId => oldCampaign};

        Set<String> fieldNames = new Set<String>();
        for(Schema.fieldSetMember aField : SObjectType.Campaign__c.FieldSets.getMap().get('Webservice_Update').getFields())
        {
            fieldNames.add(aField.getFieldPath());
        }
        System.assert(fieldNames.contains('PlannedCampaignSpend__c'), 'The field being changed should be in the field set');

        Test.startTest();
            Set<Id> result = CampaignServices.checkForWBSUpdates(newCampaignList, oldCampaignMap);
        Test.stopTest();

      //  System.assertEquals(1, result.size(), '1 item should be returned');
     //   System.assert(result.contains(fakeId), 'The proper id should be in the set because a field in the field set changed');
    }

    @isTest
    private static void testCheckForWBSUpdatesFailureForFieldChangeNotInFieldSet()
    {
        Id fakeId = TestDataFactory.getFakeId(Campaign__c.sObjectType);

        Campaign__c oldCampaign = new Campaign__c();
        oldCampaign.Id = fakeId;
        oldCampaign.PlannedCampaignSpend__c = 10;
        oldCampaign.Vendor__c = 'Blarg';

        Campaign__c newCampaign = new Campaign__c();
        newCampaign.Id = fakeId;
        newCampaign.PlannedCampaignSpend__c = 10;
        newCampaign.Vendor__c = 'Honk Honk';

        List<Campaign__c> newCampaignList = new List<Campaign__c>{newCampaign};
        Map<Id, Campaign__c> oldCampaignMap = new Map<Id, Campaign__c>{fakeId => oldCampaign};

        Set<String> fieldNames = new Set<String>();
        for(Schema.fieldSetMember aField : SObjectType.Campaign__c.FieldSets.getMap().get('Webservice_Update').getFields())
        {
            fieldNames.add(aField.getFieldPath());
        }
        System.assert(!fieldNames.contains('Vendor__c'), 'The field being changed should not be in the field set');

        Test.startTest();
            Set<Id> result = CampaignServices.checkForWBSUpdates(newCampaignList, oldCampaignMap);
        Test.stopTest();

        System.assert(result.isEmpty(), 'No items should be returned');
        System.assert(!result.contains(fakeId), 'The id should not be in the set because a field outside the field set changed');
    }

    @isTest
    private static void testCheckForWBSUpdatesFailureForFieldChangeInFieldSetOldValueNull()
    {
        Id fakeId = TestDataFactory.getFakeId(Campaign__c.sObjectType);

        Campaign__c oldCampaign = new Campaign__c();
        oldCampaign.Id = fakeId;

        Campaign__c newCampaign = new Campaign__c();
        newCampaign.Id = fakeId;
        newCampaign.PlannedCampaignSpend__c = 20;

        List<Campaign__c> newCampaignList = new List<Campaign__c>{newCampaign};
        Map<Id, Campaign__c> oldCampaignMap = new Map<Id, Campaign__c>{fakeId => oldCampaign};

        Set<String> fieldNames = new Set<String>();
        for(Schema.fieldSetMember aField : SObjectType.Campaign__c.FieldSets.getMap().get('Webservice_Update').getFields())
        {
            fieldNames.add(aField.getFieldPath());
        }
        System.assert(fieldNames.contains('PlannedCampaignSpend__c'), 'The field being changed should be in the field set');

        Test.startTest();
            Set<Id> result = CampaignServices.checkForWBSUpdates(newCampaignList, oldCampaignMap);
        Test.stopTest();

        System.assert(result.isEmpty(), 'No items should be returned');
        System.assert(!result.contains(fakeId), 'The id should not be in the set because a field in the field set changed but the old value was null');
    }

    @isTest
    private static void testCheckForWBSUpdatesFailureForFieldChangeInFieldSetNewValueNull()
    {
        Id fakeId = TestDataFactory.getFakeId(Campaign__c.sObjectType);

        Campaign__c oldCampaign = new Campaign__c();
        oldCampaign.Id = fakeId;
        oldCampaign.PlannedCampaignSpend__c = 20;

        Campaign__c newCampaign = new Campaign__c();
        newCampaign.Id = fakeId;

        List<Campaign__c> newCampaignList = new List<Campaign__c>{newCampaign};
        Map<Id, Campaign__c> oldCampaignMap = new Map<Id, Campaign__c>{fakeId => oldCampaign};

        Set<String> fieldNames = new Set<String>();
        for(Schema.fieldSetMember aField : SObjectType.Campaign__c.FieldSets.getMap().get('Webservice_Update').getFields())
        {
            fieldNames.add(aField.getFieldPath());
        }
        System.assert(fieldNames.contains('PlannedCampaignSpend__c'), 'The field being changed should be in the field set');

        Test.startTest();
            Set<Id> result = CampaignServices.checkForWBSUpdates(newCampaignList, oldCampaignMap);
        Test.stopTest();

        System.assert(result.isEmpty(), 'No items should be returned');
        System.assert(!result.contains(fakeId), 'The id should not be in the set because a field in the field set changed but the new value is null');
    }

    @isTest
    private static void testGetAUSCampaignsSuccessForAUS()
    {
        Id fakeId = TestDataFactory.getFakeId(Campaign__c.sObjectType);

        Campaign__c testCampaign = new Campaign__c();
        testCampaign.Id = fakeId;
        testCampaign.RecordTypeId = Schema.SObjectType.Campaign__c.getRecordTypeInfosByName().get('Australia Campaign (WBS)').getRecordTypeId();

        Test.startTest();
            List<Campaign__c> campaignList = CampaignServices.getAUSCampaigns(new List<Campaign__c>{testCampaign});
        Test.stopTest();

        System.assertEquals(1, campaignList.size(), '1 campaign should be returned');
        System.assertEquals(fakeId, campaignList[0].Id, 'The proper campaign should be returned');
    }

    @isTest
    private static void testGetAUSCampaignsFailureForNonAUS()
    {
        Id fakeId = TestDataFactory.getFakeId(Campaign__c.sObjectType);

        Campaign__c testCampaign = new Campaign__c();
        testCampaign.Id = fakeId;
        testCampaign.RecordTypeId = Schema.SObjectType.Campaign__c.getRecordTypeInfosByName().get('Initial Campaign Creation').getRecordTypeId();

        Test.startTest();
            List<Campaign__c> campaignList = CampaignServices.getAUSCampaigns(new List<Campaign__c>{testCampaign});
        Test.stopTest();

        System.assert(campaignList.isEmpty(), 'No campaigns should be returned');
    }

    @isTest
    private static void testPopulateProgramAndPlatformsPositiveRelatedPlatform()
    {
        Id platformRecordTypeId = Schema.SObjectType.Program__c.getRecordTypeInfosByName().get('Platform').getRecordTypeId();
        Program__c testProgram = getProgramByNameAndRecordType('Bourbon Legends', platformRecordTypeId);

        Campaign__c testCampaign = new Campaign__c();
        testCampaign.Related_Priority__c = testProgram.Id;
        testCampaign.Related_Priority__r = testProgram;

        Test.startTest();
            List<Campaign__c> testCampaigns = CampaignServices.populateProgramAndPlatforms(new List<Campaign__c>{testCampaign});
        Test.stopTest();

        System.assertEquals(1, testCampaigns.size(), '1 item should be returned');
       // System.assertEquals(testProgram.Id, testCampaigns[0].Platform__c, 'The campaign should be related to the proper platform because it has a corresponding program');
    }

    @isTest
    private static void testPopulateProgramAndPlatformsPositiveEmptyProgram()
    {
        Id platformRecordTypeId = Schema.SObjectType.Program__c.getRecordTypeInfosByName().get('Platform').getRecordTypeId();
        Id programRecordTypeId = Schema.SObjectType.Program__c.getRecordTypeInfosByName().get('Focus Calendar National Priority').getRecordTypeId();
        Program__c testProgram = getProgramByNameAndRecordType('Other', platformRecordTypeId);
        Program__c testProgram2 = getProgramByNameAndRecordType('Other', programRecordTypeId);

        Campaign__c testCampaign = new Campaign__c();

        Test.startTest();
            List<Campaign__c> testCampaigns = CampaignServices.populateProgramAndPlatforms(new List<Campaign__c>{testCampaign});
        Test.stopTest();

        System.assertEquals(1, testCampaigns.size(), '1 item should be returned');
        System.assertEquals(testProgram2.Id, testCampaigns[0].Related_Priority__c, 'The campaign should be related to the other program because it has no program');
        System.assertEquals(testProgram.Id, testCampaigns[0].Platform__c, 'The campaign should be related to the other platform because it has no program');
    }

    @isTest
    private static void testPopulateProgramAndPlatformsPositiveOtherPlatform()
    {
        Id platformRecordTypeId = Schema.SObjectType.Program__c.getRecordTypeInfosByName().get('Platform').getRecordTypeId();
        Id fakeId = TestDataFactory.getFakeId(Program__c.sObjectType);

        Program__c testProgram = getProgramByNameAndRecordType('Other', platformRecordTypeId);

        Program__c aProgram = new Program__c();
        aProgram.Id = fakeId;
        aProgram.Name = 'Da Bears';

        Campaign__c testCampaign = new Campaign__c();
        testCampaign.Related_Priority__c = aProgram.Id;
        testCampaign.Related_Priority__r = aProgram;

        Test.startTest();
            List<Campaign__c> testCampaigns = CampaignServices.populateProgramAndPlatforms(new List<Campaign__c>{testCampaign});
        Test.stopTest();

        System.assertEquals(1, testCampaigns.size(), '1 item should be returned');
        System.assertEquals(testProgram.Id, testCampaigns[0].Platform__c, 'The campaign should be related to the other platform because it has no corresponding program');
    }

    @isTest
    private static void testPopulateProgramAndPlatformsPositiveProgramWithPlatformOnParentMarketingPlan()
    {
        Id platformRecordTypeId = Schema.SObjectType.Program__c.getRecordTypeInfosByName().get('Platform').getRecordTypeId();
        Id fakeId = TestDataFactory.getFakeId(Program__c.sObjectType);

        Program__c testProgram = getProgramByNameAndRecordType('Other', platformRecordTypeId);

        Program__c aProgram = new Program__c();
        aProgram.Id = fakeId;
        aProgram.Name = 'Da Bears';

        MarketingPlan__c testMarketingPlan = new MarketingPlan__c();
        testMarketingPlan.Related_Program__r = aProgram;
        testMarketingPlan.Related_Program__c = fakeId;

        Campaign__c testCampaign = new Campaign__c();
        testCampaign.ParentMarketingPlan__r = testMarketingPlan;

        Test.startTest();
            List<Campaign__c> testCampaigns = CampaignServices.populateProgramAndPlatforms(new List<Campaign__c>{testCampaign});
        Test.stopTest();

        System.assertEquals(1, testCampaigns.size(), '1 item should be returned');
        System.assertEquals(testProgram.Id, testCampaigns[0].Platform__c, 'The campaign should be related to the other platform');
        System.assertEquals(aProgram.Id, testCampaigns[0].Related_Priority__c, 'The campaign should be related to the given program because it is on the parent marketing plan');
    }
}