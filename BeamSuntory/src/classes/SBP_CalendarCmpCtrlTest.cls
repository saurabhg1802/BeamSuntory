@isTest
private class SBP_CalendarCmpCtrlTest {
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

		Account retailAccount = new Account();
		retailAccount.Name = 'Retail Account';
		retailAccount.BillingState = 'IL';
		retailAccount.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('OffPremise').getRecordTypeId();

		insert new List<Account> {testAccount, retailAccount};


		Barrel_Order_Group__c bg = new Barrel_Order_Group__c();
		bg.Type__c = 'Trip and Tour';

		Barrel_Order_Group__c bg2 = new Barrel_Order_Group__c();
		bg2.Type__c = 'Trip and Tour';

		insert new List<Barrel_Order_Group__c> {bg, bg2};

		Plant_Event__c event = createEvent('Knob Creek', 'AM', Date.today().addDays(10), true);


		Case c = new Case();
		c.RecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Single_Barrel_Standard').getRecordTypeId();
		c.Type = 'Trip and Tour';
		c.Barrel_Order_Group__c = bg.Id;
		c.Brand__c = 'Knob Creek';
		c.Product_Type__c = 'Bourbon';
		c.ccEmail__c = 'test@test.com';
		c.Plant_Event__c = event.Id;
		c.AccountId = testAccount.Id;

		Case c2 = new Case();
		c2.RecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Single_Barrel_Proof_Specific').getRecordTypeId();
		c2.Type = '';
		c2.Barrel_Order_Group__c = bg2.Id;
		c2.Brand__c = 'Makers Mark';
		c2.AccountId = testAccount.Id;

		insert new List<Case> {c, c2};



	}

	public static Case getCaseById(Id caseId) {
		return [select id from Case where Id = :caseId limit 1];
	}

	public static Barrel_Number__c getBarrelNumberByBrand(String brand) {
		return [select id, Brand__c, Next_Barrel_Number__c from Barrel_Number__c where Brand__c = :brand limit 1];
	}

	public static Case getCaseByBrand(String brand) {
		return [select id, Barrel_Selected__c, Status, Type, Plant_Event__c from Case where Brand__c = :brand limit 1];
	}

	public static Barrel__c getBarrelBySku(String sku) {
		return [select id, Selection_Date__c, Barrel_Number__c from Barrel__c where SKU__c = :sku limit 1];
	}

	public static List<Case> getCurrentNumberOfCases() {
		return [select Id from Case];
	}

	public static Account getTestAccount() {
		return [select id from Account where Name = 'Test Account'];
	}

	public static List<Plant_Event__c> getEvents() {
		return [select id from Plant_Event__c];
	}

	public static Plant_Event__c createEvent(String brand, String timeOfday, Date tripDate, Boolean autoCreate) {
		Plant_Event__c plantEvent = new Plant_Event__c();
		plantEvent.Scheduled_Date__c = tripDate;
		plantEvent.Brand__c = brand;
		plantEvent.Time_Of_Day__c = timeOfday;
        plantEvent.Type__c = 'Blackout';
            
		if (autoCreate) {
			insert plantEvent;
		}

		return plantEvent;
	}

	public static Time_Interval__c createTimeInterval(String brand, Date startDate, Date endDate, Integer numOfGroups, String type, Boolean autoCreate) {
		Time_Interval__c timeInterval = new Time_Interval__c();
		timeInterval.Brand__c = brand;
		timeInterval.Start_Date__c = startDate;
		timeInterval.End_Date__c = endDate;
		timeInterval.Type__c = type;
		timeInterval.Max_Number_of_Groups__c = numOfGroups;
		timeInterval.isActive__c = true;
		timeInterval.Trip_Group__c = 1;
		if (autoCreate) {
			insert timeInterval;
		}

		return timeInterval;
	}



	public static testMethod void getEventsTest() {
		List<Plant_Event__c> events = new List<Plant_Event__c>();
		for (Integer i = 0; i < 10; i++) {
			events.add(createEvent('Knob Creek', 'AM', Date.today().addDays(i), false));
		}
		insert events;

		//String jsonAttendees = '[{"Plant_Event__c":"' + plantEvent.Id + '","First_Name__c":"Test","Last_Name__c":"Attendee"}]';

		Test.startTest();

		LightningComponentUtility.RequestStatus response = SBP_CalendarCmpCtrl.getEvents(new List<String> {'Knob Creek'});


		Test.stopTest();

		System.assertEquals(11, response.responseMap.get('numberOfEvents'), '11 events should exist');
		System.assertEquals(true, response.success, 'Operation should return successfully');
	}

	public static testMethod void getSingleBarrelCalendarCustomMetadataTest() {


		Test.startTest();

		LightningComponentUtility.RequestStatus response = SBP_CalendarCmpCtrl.getSingleBarrelCalendarCustomMetadata();

		Test.stopTest();

		System.assertNotEquals(NULL, response.responseMap.get('brandInfoMap'), 'Custom metadata should be returned');
	}

	public static testMethod void sortTimePeriodsBasedOnDayTest() {
		List<Plant_Event__c> events = new List<Plant_Event__c>();
		Map<String, Map<String, Integer>> dateToTimePeriod = new Map<String, Map<String, Integer>>();

		for (Integer i = 0; i < 5; i++) {
			events.add(createEvent('Knob Creek', 'AM', Date.today().addDays(i), false));
		}

		events.add(createEvent('Makers Mark', 'AM', Date.today(), false));

		insert events;

		Test.startTest();

		Map<String, Map<String, Integer>> response = SBP_CalendarCmpCtrl.sortTimePeriodsBasedOnDay();

		Test.stopTest();

		System.assertNotEquals(NULL, response, 'Dates should be sorted');
	}

	public static testMethod void getEventDataByDayTest() {
		List<Plant_Event__c> events = new List<Plant_Event__c>();
		Map<String, Map<String, Integer>> dateToTimePeriod = new Map<String, Map<String, Integer>>();

		for (Integer i = 0; i < 5; i++) {
			events.add(createEvent('Knob Creek', 'AM', Date.today().addDays(i), false));
		}

		events.add(createEvent('Makers Mark', 'AM', Date.today(), false));

		insert events;

		Test.startTest();

		Map<String, Map<String, SBP_CalendarCmpCtrl.PlantEventObj>> response = SBP_CalendarCmpCtrl.getEventDataByDay();

		Test.stopTest();

		System.assertNotEquals(NULL, response, '');
	}

	public static testMethod void getCurrentLimitPerDayTest() {
		List<Plant_Event__c> events = new List<Plant_Event__c>();
		Map<String, Map<String, Integer>> dateToTimePeriod = new Map<String, Map<String, Integer>>();

		for (Integer i = 0; i < 5; i++) {
			events.add(createEvent('Knob Creek', 'AM', Date.today().addDays(i), false));
		}

		events.add(createEvent('Makers Mark', 'AM', Date.today(), false));

		insert events;

		Test.startTest();

		Map<String, Map<String, Map<String, Boolean>>> response = SBP_CalendarCmpCtrl.getCurrentLimitPerDay();

		Test.stopTest();

		System.assertNotEquals(NULL, response, '');
	}

	public static testMethod void getSeasonalEventsTest() {
		List<Plant_Event__c> events = new List<Plant_Event__c>();
		List<Time_Interval__c> timeIntervals = new List<Time_Interval__c>();
        List<Time_Interval__c> group1 = new List<Time_Interval__c>();
        List<Time_Interval__c> group2 = new List<Time_Interval__c>();

		timeIntervals.add(createTimeInterval('El Tesoro', Date.today(), Date.today().addDays(20), 10, 'Season Program Length', false));
		timeIntervals.add(createTimeInterval('El Tesoro', Date.today(), Date.today().addDays(20), 10, 'Season Program Length', false));

		insert timeIntervals;

		Test.startTest();

		LightningComponentUtility.RequestStatus response = SBP_CalendarCmpCtrl.getSeasonalEvents('El Tesoro');
        //LightningComponentUtility.RequestStatus response1 = SBP_CalendarCmpCtrl.getSeasonalEvents('El Tesoro');

		Test.stopTest();

		System.assertEquals(2, response.responseMap.get('numOfEvents'), '2 Time intervals should be creted');

	}

	public static testMethod void getRelatedEventTest() {
		Case c = getCaseByBrand('Knob Creek');

		Test.startTest();

		LightningComponentUtility.RequestStatus response = SBP_CalendarCmpCtrl.getRelatedEvent(String.valueOf(c.Id));

		Test.stopTest();

		System.assertNotEquals(NULL, response.responseMap.get('recordId'), 'Record Id should be returned');
		System.assertEquals(true, response.success, 'Operation should return successfully');
	}

	public static testMethod void getOnHoldDatesTest() {

		Time_Interval__c timeInterval = createTimeInterval('Makers Mark', Date.today(), Date.today().addDays(10), 0, 'Date Hold', true);

		Test.startTest();

		LightningComponentUtility.RequestStatus response = SBP_CalendarCmpCtrl.getOnHoldDates('Makers Mark');

		Test.stopTest();

		System.assertEquals(10, response.responseMap.get('remainingDayAvailable'), '10 days should be remaining');
	}

	public static testMethod void getOnHoldDatesEightRemainTest() {
		List<Plant_Event__c> events = new List<Plant_Event__c>();

		Time_Interval__c timeInterval = createTimeInterval('Makers Mark', Date.today(), Date.today().addDays(3), 0, 'Date Hold', false);
		timeInterval.Submitter__c = UserInfo.getUserId();
		insert timeInterval;

		for (Integer i = 0; i < 2; i++) {
			Plant_Event__c event = createEvent('Makers Mark', 'AM', Date.today().addDays(i), false);
			event.Time_Interval__c = timeInterval.Id;
			events.add(event);
		}

		insert events;

		Test.startTest();

		LightningComponentUtility.RequestStatus response = SBP_CalendarCmpCtrl.getOnHoldDates('Makers Mark');

		Test.stopTest();

		System.assertEquals(5, response.responseMap.get('remainingDayAvailable'), '5 days should be remaining');
	}

	public static testMethod void createOnHoldDatesTest() {

		Test.startTest();

		LightningComponentUtility.RequestStatus response = SBP_CalendarCmpCtrl.createOnHoldDates('Makers Mark', '2018-11-01', '2018-11-04');


		Test.stopTest();

		System.assertEquals(FALSE, response.responseMap.get('dateRangeRejected'), 'Time slot should be available');
	}

	public static testMethod void updateCaseTest() {
		Case c = getCaseByBrand('Makers Mark');
		Plant_Event__c event = createEvent('Makers Mark', 'AM', Date.today().addDays(1), true);

		System.assertEquals(NULL, c.Plant_Event__c);
		System.assertEquals(NULL, c.Type);

		Test.startTest();

		LightningComponentUtility.RequestStatus response = SBP_CalendarCmpCtrl.updateCase(String.valueOf(event.Id), 'Trip and Tour', String.valueOf(c.Id));

		Case updateCase = [select id, Type, Plant_Event__c from Case where Id = :c.Id];

		Test.stopTest();

		System.assertEquals('Trip and Tour', updateCase.Type, 'Type should be updated');
		System.assertNotEquals(NULL, updateCase.Plant_Event__c, 'Plant event should be added to case');
		System.assertEquals(true, response.success, 'Operation should return successfully');
	}

	public static testMethod void updateCaseErrorTest() {
		Plant_Event__c event = createEvent('Makers Mark', 'AM', Date.today().addDays(1), true);

		Test.startTest();

		LightningComponentUtility.RequestStatus response = SBP_CalendarCmpCtrl.updateCase(String.valueOf(event.Id), 'Trip and Tour', '');


		Test.stopTest();

		System.assertEquals(false, response.success, 'Operation should not return successfully');
	}

	public static testMethod void insertEventFromDateHoldScreenTest() {
		List<Plant_Event__c> events = [Select id from Plant_Event__c];


		Time_Interval__c timeInterval = createTimeInterval('Makers Mark', Date.today(), Date.today().addDays(3), 0, 'Date Hold', false);
		timeInterval.Submitter__c = UserInfo.getUserId();
		insert timeInterval;
		Id userId = UserInfo.getUserId();

		String eventJson = '{ "Plant__c": "Loretto", '
		                   + '    "Brand__c": "Makers Mark", '
		                   + '    "Include_Boxed_Lunches__c": "true", '
		                   + '    "Time_of_Day__c": "AM", '
		                   + '    "Scheduled_Date__c": "2018-10-01", '
		                   + '    "Initiator__c": "' + userId + '", '
		                   + '    "Time_Interval__c": "' + timeInterval.Id + '"}';

		Test.startTest();

		LightningComponentUtility.RequestStatus response = SBP_CalendarCmpCtrl.insertEvent(eventJson, 'Makers Mark');

		List<Plant_Event__c> updatedEvents = [Select id from Plant_Event__c];

		Test.stopTest();

		System.assertEquals(events.size() + 1, updatedEvents.size(), eventJson);
	}

	public static testMethod void upsertEventsTest() {
		List<Plant_Event__c> events = [Select id from Plant_Event__c];


		Time_Interval__c timeInterval = createTimeInterval('Makers Mark', Date.today(), Date.today().addDays(3), 0, 'Date Hold', false);
		timeInterval.Submitter__c = UserInfo.getUserId();
		insert timeInterval;
		Id userId = UserInfo.getUserId();

		String eventJson = 	'{"startDateTime":"2018-10-02"'
		                        + ',"endDateTime":"2018-10-02"'
		                        + ',"description":null'
		                        + ',"plant":"Clermont"'
		                        + ',"brand":"Knob Creek"'
		                        + ',"timeOfDay":"AM"'
		                        + ',"scheduledDate":"2018-10-02"'
		                        + ',"initiatorId":"' + userId + '"'
		                        + ',"boxedLunches":false'
		                        + ',"isBottling":true'
		                        + ',"waitingOptionsVal":"Cocktail Bar"'
		                        + ',"isTour":false}';



		Test.startTest();

		LightningComponentUtility.RequestStatus response = SBP_CalendarCmpCtrl.upsertEvents(eventJson, 'Loretto', 'Makers Mark');

		List<Plant_Event__c> updatedEvents = [Select id from Plant_Event__c];

		Test.stopTest();

		System.assertEquals(events.size() + 1, updatedEvents.size(), eventJson);
	}











}