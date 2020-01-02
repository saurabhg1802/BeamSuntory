@isTest
private class SBP_BarrelSelectionCmpCtrlTest {
	@testSetup static void setup() {
		Profile p = [SELECT Id FROM Profile WHERE Name = 'System Administrator'];
		User u = new User(Alias = 'beamtu', Email = 'standarduser@testorg.com', Regional_Diplomat_Regions__c = 'Illinois;Indiana',
		                  EmailEncodingKey = 'UTF-8', LastName = 'Testing', LanguageLocaleKey = 'en_US',
		                  LocaleSidKey = 'en_US', ProfileId = p.Id,
		                  TimeZoneSidKey = 'America/Chicago', UserName = 'beamsuntorytestuser@test-user-system.com.test-only');
		insert u;

		Account testAccount = new Account();
		testAccount.Name = 'Test Account';
		testAccount.BillingState = 'IL';
		testAccount.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('OffPremise').getRecordTypeId();
		insert testAccount;


		Barrel_Order_Group__c bg = new Barrel_Order_Group__c();
		bg.Type__c = 'Trip and Tour';

		Barrel_Order_Group__c bg2 = new Barrel_Order_Group__c();
		bg2.Type__c = 'Trip and Tour';

		insert new List<Barrel_Order_Group__c> {bg, bg2};


		Case c = new Case();
		c.RecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Single_Barrel_Standard').getRecordTypeId();
		c.Type = 'Trip and Tour';
		c.Barrel_Order_Group__c = bg.Id;
		c.Brand__c = 'Knob Creek';
		c.Product_Type__c = 'Bourbon';
		c.ccEmail__c = 'test@test.com';
		c.AccountId = testAccount.Id;

		Case c2 = new Case();
		c2.RecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Single_Barrel_Proof_Specific').getRecordTypeId();
		c2.Type = 'Trip and Tour';
		c2.Barrel_Order_Group__c = bg2.Id;
		c2.Brand__c = 'Makers Mark';
		c2.AccountId = testAccount.Id;

		insert new List<Case> {c, c2};

		Barrel__c makersMark = new Barrel__c();
		makersMark.Brand__c = 'Makers Mark';
		makersMark.Ship_Date__c = null;
		makersMark.Case__c = c2.Id;
		makersMark.SKU__c = 'Test Barrel 2';
		makersMark.RecordTypeId = Schema.SObjectType.Barrel__c.getRecordTypeInfosByDeveloperName().get('Makers_Mark_Full_Barrel').getRecordTypeId();

		insert makersMark;
	}

	public static Case getCaseById(Id caseId) {
		return [select id from Case where Id = :caseId limit 1];
	}

	public static Case getCaseByBrand(String brand) {
		return [select id, Barrel_Selected__c, Status, Remote_Selection_Date__c from Case where Brand__c = :brand limit 1];
	}

	public static List<Case> getCurrentNumberOfCases() {
		return [select Id from Case];
	}

	public static List<Barrel__c> getCurrentNumberOfBarrels() {
		return [select Id from Barrel__c];
	}

	public static Account getTestAccount() {
		return [select id from Account where Name = 'Test Account'];
	}


	public static testMethod void createBarrelRecordTest() {
		Case c = getCaseByBrand('Knob Creek');
		List<Barrel__c> barrels = getCurrentNumberOfBarrels();

		Test.startTest();

		LightningComponentUtility.RequestStatus response = SBP_BarrelSelectionCmpCtrl.createBarrelRecord(String.valueOf(c.Id), 'Knob Creek', 'Bourbon');

		List<Barrel__c> barrelsUpdated = getCurrentNumberOfBarrels();
		Test.stopTest();


		System.assertEquals(barrels.size() + 1, barrelsUpdated.size(), 'One new barrel should be created');
		System.assertEquals(true, response.success, 'Operation should return successfully');
	}

	public static testMethod void createBarrelRecordErrorTest() {
		Test.startTest();

		LightningComponentUtility.RequestStatus response = SBP_BarrelSelectionCmpCtrl.createBarrelRecord('', 'Knob Creek', 'Bourbon');

		Test.stopTest();

		System.assertEquals(false, response.success, 'Operation should not return successfully');
	}

	public static testMethod void getRelatedBarrelInfoTest() {
		Case c = getCaseByBrand('Makers Mark');

		Test.startTest();

		LightningComponentUtility.RequestStatus response = SBP_BarrelSelectionCmpCtrl.getRelatedBarrel(String.valueOf(c.Id));

		Test.stopTest();

		System.assertNotEquals(NULL, response.responseMap.get('recordId'), 'Barrel Id should be returned');
		System.assertEquals(true, response.success, 'Operation should return successfully');
	}

	public static testMethod void getRelatedBarrelInfoErrorTest() {
		Test.startTest();

		LightningComponentUtility.RequestStatus response = SBP_BarrelSelectionCmpCtrl.getRelatedBarrel('');

		Test.stopTest();
		System.assertEquals(false, response.success, 'Operation should not return successfully');
	}
    
	public static testMethod void updateSampleKitDetailsTest() {
		Case c = getCaseByBrand('Knob Creek');

		Test.startTest();

        String sampleKitCompany = 'sampleKit Company';
        String sampleKitStreet = 'sampleKit Street';
        String sampleKitCity = 'sampleKit City';
        String sampleKitZip = '12356';
        String sampleKitState = 'sampleKit State';
        String sampleKitPhone = '0123456789';
        LightningComponentUtility.RequestStatus response = SBP_BarrelSelectionCmpCtrl.updateSampleKitDetails(String.valueOf(c.Id), sampleKitCompany, sampleKitStreet, sampleKitCity, sampleKitZip, sampleKitState, sampleKitPhone);

		Test.stopTest();

		System.assertNotEquals(NULL, response.responseMap.get('SampleKit'), 'Sample Kit Company/Attention should be returned');
		System.assertEquals(true, response.success, 'Operation should return successfully');
	}

    public static testMethod void updateSampleKitDetailsErrorTest() {
		Case c = getCaseByBrand('Knob Creek');

		Test.startTest();

        String sampleKitCompany = 'sampleKit Company';
        String sampleKitStreet = 'sampleKit Street';
        String sampleKitCity = 'sampleKit City';
        String sampleKitZip = '12356';
        String sampleKitState = 'sampleKit State';
        String sampleKitPhone = '0123456789';
        LightningComponentUtility.RequestStatus response = SBP_BarrelSelectionCmpCtrl.updateSampleKitDetails('', sampleKitCompany, sampleKitStreet, sampleKitCity, sampleKitZip, sampleKitState, sampleKitPhone);

		Test.stopTest();

		System.assertEquals(false, response.success, 'Operation should not return successfully');
	}
}