@isTest
private class SBP_AccountInfoCmpCtrlTest {
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

		Account intAccount = new Account();
		intAccount.Name = 'Single Barrel International Account';
		intAccount.BillingState = 'IL';
		intAccount.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('OffPremise').getRecordTypeId();

		Account retailAccount = new Account();
		retailAccount.Name = 'Retail Account';
		retailAccount.BillingState = 'IL';
		retailAccount.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('OffPremise').getRecordTypeId();

		insert new List<Account> {testAccount, retailAccount, intAccount};

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
		c.Barrel_Selected__c = false;
		c.Retail_Account__c = retailAccount.Id;
		c.Product_Type__c = 'Bourbon';
		c.ccEmail__c = 'test@test.com';
		c.AccountId = testAccount.Id;

		Case c2 = new Case();
		c2.RecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Single_Barrel_Proof_Specific').getRecordTypeId();
		c2.Type = 'Trip and Tour';
		c2.Barrel_Order_Group__c = bg2.Id;
		c2.Retail_Account__c = retailAccount.Id;
		c2.Brand__c = 'Makers Mark';
		c2.AccountId = testAccount.Id;

		insert new List<Case> {c, c2};


		Barrel__c knobCreek = new Barrel__c();
		knobCreek.Brand__c = 'Knob Creek';
		knobCreek.Case__c = c.Id;
		knobCreek.SKU__c = 'Test Barrel';
		knobCreek.RecordTypeId = Schema.SObjectType.Barrel__c.getRecordTypeInfosByDeveloperName().get('Knob_Creek_Full_Barrel').getRecordTypeId();
		knobCreek.Product_Type__c = 'Bourbon';

		Barrel__c makersMark = new Barrel__c();
		makersMark.Brand__c = 'Makers Mark';
		makersMark.Ship_Date__c = null;
		makersMark.Case__c = c2.Id;
		makersMark.SKU__c = 'Test Barrel 2';
		makersMark.RecordTypeId = Schema.SObjectType.Barrel__c.getRecordTypeInfosByDeveloperName().get('Makers_Mark_Full_Barrel').getRecordTypeId();

		insert new List<Barrel__c> {knobCreek, makersMark};

		Barrel_Recipe__c recipe1 = new Barrel_Recipe__c();
		recipe1.Brand__c = 'Makers Mark';
		insert recipe1;

		List<Stave__c> staves = new List<Stave__c>();
		staves.add(new Stave__c(Barrel_Recipe__c = recipe1.Id, Type__c = 'Baked American Pure 2', Quantity__c = 2));
		staves.add(new Stave__c(Barrel_Recipe__c = recipe1.Id, Type__c = 'Seared French Cuvee', Quantity__c = 2));
		staves.add(new Stave__c(Barrel_Recipe__c = recipe1.Id, Type__c = 'Maker\'s 46', Quantity__c = 2));
		staves.add(new Stave__c(Barrel_Recipe__c = recipe1.Id, Type__c = 'Roasted French Mocha', Quantity__c = 2));
		staves.add(new Stave__c(Barrel_Recipe__c = recipe1.Id, Type__c = 'Toasted French Spice', Quantity__c = 2));

		insert staves;

		Account_Barrel_Recipe__c abr = new Account_Barrel_Recipe__c();
		abr.Account__c = retailAccount.Id;
		abr.Barrel_Recipe__c = recipe1.Id;
		insert abr;

	}

	public static Case getCaseById(Id caseId) {
		return [select id from Case where Id = :caseId limit 1];
	}

	public static Account_Barrel_Recipe__c getBarrelRecipeByAccountName(String accountName) {
		return [select id, Barrel_Recipe__c from Account_Barrel_Recipe__c where Account__r.Name = :accountName limit 1];
	}

	public static Case getCaseByBrand(String brand) {
		return [select id, Barrel_Selected__c, AccountId, Retail_Account__c, Status, Remote_Selection_Date__c from Case where Brand__c = :brand limit 1];
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


	public static testMethod void getSingleBarrelLabelsTest() {
		Test.startTest();

		LightningComponentUtility.RequestStatus response = SBP_AccountInfoCmpCtrl.getSingleBarrelLabels();

		Test.stopTest();

		System.assertNotEquals(NULL, response.responseMap.get('labelMap'), 'There should be labels');
		System.assertEquals(true, response.success, 'Operation should return successfully');
	}

	public static testMethod void updateCaseTest() {
		Case c = getCaseByBrand('Knob Creek');

		Test.startTest();

		String jsonCases = '[{"Id":"' + c.Id + '",'
		                   + '"CcEmail__c":"",'
		                   + '"Remote_Selection_Date__c":null,'
		                   + '"Type":"Distiller\'s Choice",'
		                   + '"Premise__c":"On Premise",'
		                   + '"AccountId":"' + c.AccountId + '",'
		                   + '"Retail_Account__c":"' + c.Retail_Account__c + '",'
		                   + '"Split_Order__c":false}]';


		LightningComponentUtility.RequestStatus response = SBP_AccountInfoCmpCtrl.updateCase(jsonCases);

		Test.stopTest();

		System.assertNotEquals(NULL, response.responseMap.get('cases'), 'Case should be updated');
		System.assertEquals(true, response.success, 'Operation should return successfully');
	}

	public static testMethod void updateCaseNoRetailAccountInJsonTest() {
		Case c = getCaseByBrand('Knob Creek');

		Test.startTest();

		String jsonCases = '[{"Id":"' + c.Id + '",'
		                   + '"CcEmail__c":"",'
		                   + '"Remote_Selection_Date__c":null,'
		                   + '"Type":"Distiller\'s Choice",'
		                   + '"Premise__c":"On Premise",'
		                   + '"AccountId":"' + c.AccountId + '",'
		                   + '"Retail_Account__c":null,'
		                   + '"Split_Order__c":false}]';


		LightningComponentUtility.RequestStatus response = SBP_AccountInfoCmpCtrl.updateCase(jsonCases);

		Test.stopTest();

		System.assertNotEquals(NULL, response.responseMap.get('cases'), 'Case should be updated');
		System.assertEquals(true, response.success, 'Operation should return successfully');
	}

	public static testMethod void updateCaseNoRetailBarrelRelatedToCaseTest() {
		Case c = getCaseByBrand('Knob Creek');

		Test.startTest();

		Case c2 = new Case();
		c2.RecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Single_Barrel_Standard').getRecordTypeId();
		c2.Type = 'Trip and Tour';
		c2.Brand__c = 'Knob Creek';
		c2.Barrel_Selected__c = false;
		c2.Product_Type__c = 'Bourbon';
		c2.ccEmail__c = 'test@test.com';
		insert c2;

		String jsonCases = '[{"Id":"' + c2.Id + '",'
		                   + '"CcEmail__c":"",'
		                   + '"Remote_Selection_Date__c":null,'
		                   + '"Type":"Distiller\'s Choice",'
		                   + '"Premise__c":"On Premise",'
		                   + '"AccountId":"' + c.AccountId + '",'
		                   + '"Retail_Account__c":null,'
		                   + '"Split_Order__c":false}]';


		LightningComponentUtility.RequestStatus response = SBP_AccountInfoCmpCtrl.updateCase(jsonCases);

		Test.stopTest();

		System.assertNotEquals(NULL, response.responseMap.get('cases'), 'Case should be updated');
		System.assertEquals(true, response.success, 'Operation should return successfully');
	}



	public static testMethod void getPicklistValuesTest() {

		Test.startTest();

		Map<String, List<String>> fieldMap = SBP_AccountInfoCmpCtrl.getSingleBarrelPicklistValues();

		Test.stopTest();

		System.assertNotEquals(NULL, fieldMap.get('premise'), 'Premise shoudl not be empty');
	}






}