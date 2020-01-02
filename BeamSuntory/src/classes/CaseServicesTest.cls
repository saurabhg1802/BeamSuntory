@isTest(SeeAllData = false)
public class CaseServicesTest {
    public static final String CASE_RT_Standard = 'Standard Case';
    public static final String ACCOUNT_RT_Distributor = 'Distributor';
    public static final String Vendor_Community_Profile = 'Vendor Community';
    public static final String Admin_Profile = 'System Administrator';
    public static final String Admin_Role = 'Application Admin';

    private static Id caseRTId {
        get{
            if (caseRTId == null) {
                caseRTId = Schema.SObjectType.Case.getRecordTypeInfosByName().get(CASE_RT_Standard).getRecordTypeId();
            }
            return caseRTId;
        }
        set;
    }
    private static Id accountRTId {
        get{
            if (accountRTId == null) {
                accountRTId = Schema.SObjectType.Account.getRecordTypeInfosByName().get(ACCOUNT_RT_Distributor).getRecordTypeId();
            }
            return accountRTId;
        }
        set;
    }

    public static List<Case> createChildCaseRecords(String recordTypeName, String status, Id parentId, Integer numOfChildRecords, Boolean autoCreate) {
        Id recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get(recordTypeName).getRecordTypeId();
        List<Case> casesToInsert = new List<Case>();
        Case parentCase = new Case();
        Database.DMLOptions dmo = new Database.DMLOptions();
        dmo.AssignmentRuleHeader.useDefaultRule = true;

        for (Integer i = 0; i < numOfChildRecords; i++) {
            Case c = new Case();
            c.Status = status;
            c.ParentId = parentId;
            c.RecordTypeId = recordTypeId;
            //c.setOptions(dmo);
            casesToInsert.add(c);
        }

        if (autoCreate) {
            insert casesToInsert;
        }

        return casesToInsert;
    }


    public static List<Case> getCasesById(Set<Id> caseIds) {
        return [select id
                , All_Sub_Cases_Closed__c
                , Shipping_Plant__c
                , AccountId
                , isReOpened__c
                , Expedited_Claim__c
                , BusinessHoursId
                , BusinessHours.Name
                , Product_Destination_Country__c
                , Owner.Name
                , OwnerId
                , EntitlementId
                , Financial_Disposition__c
                , Return_SAP_Number__c
                , Return_SAP_number_missing__c
                , Billing_SAP_number_missing__c
                , Billing_SAP_Number__c
                , Entitlement.Name from Case where Id IN :caseIds];
    }

    public static List<CaseMilestone> getCaseMilestoneByCaseId(Id caseId) {
        return [select Id
                , StartDate
                , TargetDate
                , CompletionDate
                , MilestoneTypeId
                , MilestoneType.Name
                , IsCompleted
                , BusinessHoursId
                , CaseId
                , Case.Status
                , Case.RecordTypeId
                , TargetResponseInMins
                , TargetResponseInHrs
                , TargetResponseInDays
                , TimeRemainingInMins
                , IsViolated FROM CaseMilestone where CaseId = :caseId];
    }

    public static List<Entitlement> getEntitlementsOnAccount(Id acctId) {
        return [select id from Entitlement where AccountId = :acctId];
    }


    public static testMethod void testBusinessHoursBucketerOnHold() {
        //Define the next business day (Monday)
        caseServices.testDay = '1';

        Test.startTest();
        //Setup the stop statuses
        Stop_Status__c ss = new Stop_Status__c(Name = 'On Hold');
        insert ss;
        caseServices.runTrigger = true;

        //Insert new case
        Case c = new Case();
        c.Status = 'New';
        c.Last_Status_Change__c = System.Now();
        c.RecordTypeId = caseRTId;
        insert c;

        Test.stopTest();
    }

    public static testMethod void testBusinessHoursBucketerNew() {

        //Define the next business day (Monday)
        caseServices.testDay = '1';

        Test.startTest();
        //Setup the stop statuses
        Stop_Status__c ss = new Stop_Status__c(Name = 'On Hold');
        insert ss;
        caseServices.runTrigger = true;

        //Insert new case
        Case c = new Case();
        c.Status = 'New';
        c.Last_Status_Change__c = System.Now();
        c.RecordTypeId = caseRTId;
        insert c;

        caseServices.runTrigger = false;

        c.Status = 'On Hold';
        update c;
        caseServices.runTrigger = false;

        Test.stopTest();
    }


    public static testMethod void testBusinessHoursBucketerClosed() {

        //Define the next business day (Monday)
        caseServices.testDay = '1';

        Test.startTest();
        //Setup the stop statuses
        Stop_Status__c ss = new Stop_Status__c(Name = 'On Hold');
        insert ss;
        caseServices.runTrigger = true;

        //Insert new case
        Case c = new Case();
        c.Status = 'New';
        c.Last_Status_Change__c = System.Now();
        c.RecordTypeId = caseRTId;
        insert c;

        Case updatedCase = [select Time_With_Customer__c, Time_With_Support__c, Case_Age_In_Business_Hours__c from Case where Id = :c.Id];
        System.assert(updatedCase.Time_With_Customer__c != null);
        System.assert(updatedCase.Time_With_Support__c != null);
        System.assert(updatedCase.Case_Age_In_Business_Hours__c == null);

        //Update Case with Closed Status
        c.Status = 'Closed';
        update c;
        caseServices.runTrigger = true;

        Test.stopTest();

        updatedCase = [select Time_With_Customer__c, Time_With_Support__c, Case_Age_In_Business_Hours__c from Case where Id = :c.Id];
        System.assert(updatedCase.Time_With_Customer__c != null);
        System.assert(updatedCase.Time_With_Support__c != null);
        System.assert(updatedCase.Case_Age_In_Business_Hours__c == null);
    }

    public static testMethod void testSLATimesOnInsert() {

        //Setup default business hours
        BusinessHours bh = [Select Id, TimeZoneSidKey, SundayStartTime, SundayEndTime, MondayStartTime, MondayEndTime, TuesdayStartTime, TuesdayEndTime, WednesdayStartTime, WednesdayEndTime, ThursdayStartTime, ThursdayEndTime, FridayStartTime, FridayEndTime, SaturdayStartTime, SaturdayEndTime From BusinessHours Where IsDefault = TRUE];

        //Setup test user
        Profile p = [SELECT Id FROM Profile WHERE Name = 'System Administrator'];
        User u = new User(Alias = 'beamtu', Email = 'standarduser@testorg.com',
                          EmailEncodingKey = 'UTF-8', LastName = 'Testing', LanguageLocaleKey = 'en_US',
                          LocaleSidKey = 'en_US', ProfileId = p.Id,
                          TimeZoneSidKey = 'America/Chicago', UserName = 'beamsuntorytestuser@test-user-system.com.test-only');

        //Define the next business day (Monday)
        caseServices.testDay = '1';

        System.runAs(u) {

            //Insert a case
            Case c = new Case();
            c.Status = 'New';
            c.Last_Status_Change__c = System.Now();
            c.RecordTypeId = caseRTId;
            insert c;

            Case case_test = [select CaseNumber, CreatedDate, SLA_Start_Time__c, SLA_End_Time__c from Case where Id = :c.Id];
            System.assert(case_Test.SLA_Start_Time__c != null);
            System.assert(case_Test.SLA_End_Time__c != null);

        }
    }

    public static testMethod void testInsertUpdateWeekly_Monday() {
        caseServices.runTrigger = false;
        //Setup the stop statuses
        Stop_Status__c ss = new Stop_Status__c(Name = 'On Hold');
        insert ss;

        Test.startTest();
        //Define the next business day (Tuesday)
        caseServices.testDay = '1';

        Case c = new Case();
        c.Status = 'New';
        c.Last_Status_Change__c = System.Now();
        c.RecordTypeId = caseRTId;
        insert c;
        caseServices.runTrigger = false;

        c.Status = 'On Hold';
        c.Update_SLA_Times__c = TRUE;
        update c;
        caseServices.runTrigger = true;

        Test.stopTest();


        c.Status = 'Closed';
        c.Update_SLA_Times__c = TRUE;
        update c;
    }

    public static testMethod void testInsertUpdateWeekly_Tuesday() {

        //Define the next business day (Tuesday)
        caseServices.testDay = '2';

        Case c = new Case();
        c.Status = 'New';
        c.Last_Status_Change__c = System.Now();
        c.RecordTypeId = caseRTId;
        insert c;
        caseServices.runTrigger = true;

        Test.startTest();

        c.Update_SLA_Times__c = TRUE;
        update c;

        Test.stopTest();
    }

    public static testMethod void testInsertUpdateWeekly_Wednesday() {

        //Define the next business day (Tuesday)
        caseServices.testDay = '3';

        Case c = new Case();
        c.Status = 'New';
        c.Last_Status_Change__c = System.Now();
        c.RecordTypeId = caseRTId;
        insert c;
        caseServices.runTrigger = true;

        Test.startTest();

        c.Update_SLA_Times__c = TRUE;
        update c;

        Test.stopTest();
    }

    public static testMethod void testInsertUpdateWeekly_Thursday() {

        //Define the next business day (Tuesday)
        caseServices.testDay = '4';

        Case c = new Case();
        c.Status = 'New';
        c.Last_Status_Change__c = System.Now();
        c.RecordTypeId = caseRTId;
        insert c;
        caseServices.runTrigger = true;

        Test.startTest();

        c.Update_SLA_Times__c = TRUE;
        update c;

        Test.stopTest();
    }

    public static testMethod void testInsertUpdateWeekly_Friday() {
        caseServices.runTrigger = false;
        //Define the next business day (Tuesday)
        caseServices.testDay = '5';

        Case c = new Case();
        c.Status = 'New';
        c.Last_Status_Change__c = System.Now();
        c.RecordTypeId = caseRTId;
        insert c;
        caseServices.runTrigger = true;

        Test.startTest();

        c.Update_SLA_Times__c = TRUE;
        update c;

        Test.stopTest();
    }

    public static testMethod void testInsertUpdateWeekly_Saturday() {

        //Define the next business day (Tuesday)
        caseServices.testDay = '6';

        Case c = new Case();
        c.Status = 'New';
        c.Last_Status_Change__c = System.Now();
        c.RecordTypeId = caseRTId;
        insert c;
        caseServices.runTrigger = true;

        Test.startTest();

        c.Update_SLA_Times__c = TRUE;
        update c;

        Test.stopTest();
    }

    public static testMethod void testInsertUpdateWeekly_Sunday() {

        //Define the next business day (Tuesday)
        caseServices.testDay = '7';

        Case c = new Case();
        c.Status = 'New';
        c.Last_Status_Change__c = System.Now();
        c.RecordTypeId = caseRTId;
        insert c;
        caseServices.runTrigger = true;

        Test.startTest();

        c.Update_SLA_Times__c = TRUE;
        update c;

        Test.stopTest();
    }

    public static testMethod void testCaseEmailSuppliedEmail() {

        Case c = new Case();
        c.Status = 'New';
        c.Last_Status_Change__c = System.Now();
        c.RecordTypeId = caseRTId;
        c.SuppliedEmail = 'test@testmailer.com';
        insert c;


    }

    public static testMethod void testCaseEmailNoContact() {

        Profile p0 = [SELECT Id FROM Profile WHERE Name = :Admin_Profile];
        UserRole r = [SELECT Id FROM UserRole WHERE Name = :Admin_Role];
        User u0 = new User(Alias = 'beamtu2', Email = 'standarduser2@testorg22.com',
                           EmailEncodingKey = 'UTF-8', LastName = 'Testing', LanguageLocaleKey = 'en_US',
                           LocaleSidKey = 'en_US', ProfileId = p0.Id, UserRoleId = r.Id,
                           TimeZoneSidKey = 'America/Chicago', UserName = 'beamsuntorytestuser2@test-user-system.com.test-only');
        insert u0;

        Test.startTest();

        System.runAs(u0) {
            Account a = new Account();
            a.RecordTypeId = accountRTId;
            a.Name = 'Test Account';
            insert a;

            system.debug('Account Owner: ' + a.OwnerId);

            Contact con = new Contact();
            con.LastName = 'Tester';
            con.AccountId = a.Id;
            con.Email = 'test@test.com';
            insert con;

            Profile p = [SELECT Id FROM Profile WHERE Name = :Vendor_Community_Profile];
            User u = new User(Alias = 'beamtu', ContactId = con.Id, Email = 'standarduser@testorg123.com',
                              EmailEncodingKey = 'UTF-8', LastName = 'Testing', LanguageLocaleKey = 'en_US',
                              LocaleSidKey = 'en_US', ProfileId = p.Id,
                              TimeZoneSidKey = 'America/Chicago', UserName = 'beamsuntorytestuser@test-user-system.com.test-only');
            insert u;

            Case c = new Case();
            c.Status = 'New';
            c.Last_Status_Change__c = System.Now();
            c.RecordTypeId = caseRTId;
            c.ContactId = con.Id;
            insert c;

            Test.stopTest();

            system.debug('Contact Id: ' + c.ContactId);
            system.debug('Supplied Email: ' + c.SuppliedEmail);

        }

    }

    public static testMethod void testCaseLanguageNoContact() {

        Test.startTest();
        Profile p0 = [SELECT Id FROM Profile WHERE Name = :Admin_Profile];
        UserRole r = [SELECT Id FROM UserRole WHERE Name = :Admin_Role];
        User u0 = new User(Alias = 'beamtu2', Email = 'standarduser2@testorg.com',
                           EmailEncodingKey = 'UTF-8', LastName = 'Testing', LanguageLocaleKey = 'en_US',
                           LocaleSidKey = 'en_US', ProfileId = p0.Id, UserRoleId = r.Id,
                           TimeZoneSidKey = 'America/Chicago', UserName = 'beamsuntorytestuser2@test-user-system.com.test-only');
        insert u0;

        System.runAs(u0) {
            Case c = new Case();
            c.Status = 'New';
            insert c;
        }

        Test.stopTest();
    }

    public static testMethod void testUpdateFlagsOnStatusChangeStopStatus() {
        caseServices.runTrigger = false;
        Stop_Status__c WOTP = new Stop_Status__c(Name = 'Waiting on 3rd Party', CurrencyISOCode = 'USD');
        insert WOTP;

        Test.startTest();

        List<CaseStatus> closedCaseStatusList = [SELECT MasterLabel FROM CaseStatus WHERE IsClosed = true];

        Id gmdmCaseRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('GMDM').getRecordTypeId();
        Case c = new Case();
        c.Status = 'Logged';
        c.New_Activity__c = true;
        c.RecordTypeId = caseRTId;
        insert c;
        caseServices.runTrigger = true;

        Case currCase = [SELECT Id, New_Activity__c, Status FROM Case WHERE Id = : c.Id];
        System.assertEquals(1, [SELECT COUNT() FROM Case WHERE Id = : c.Id]);
        System.assertEquals('Logged', currCase.Status);
        System.assertEquals(true, currCase.New_Activity__c);

        currCase.Status = WOTP.Name;
        update currCase;
        currCase = [SELECT Id, New_Activity__c, Status FROM Case WHERE Id = : c.Id];
        System.assertEquals(WOTP.Name, currCase.Status);
        System.assertEquals(false, currCase.New_Activity__c);

        Test.stopTest();

    }

    public static testMethod void testUpdateFlagsOnStatusChangeClosedCaseStatus() {
        caseServices.runTrigger = false;
        Stop_Status__c WOTP = new Stop_Status__c(Name = 'Waiting on 3rd Party', CurrencyISOCode = 'USD');
        insert WOTP;

        Test.startTest();

        List<CaseStatus> closedCaseStatusList = [SELECT MasterLabel FROM CaseStatus WHERE IsClosed = true];

        Id gmdmCaseRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('GMDM').getRecordTypeId();
        Case c = new Case();
        c.Status = 'Logged';
        c.New_Activity__c = true;
        c.RecordTypeId = caseRTId;
        insert c;
        caseServices.runTrigger = true;

        Case currCase = [SELECT Id, New_Activity__c, Status FROM Case WHERE Id = : c.Id];
        System.assertEquals(1, [SELECT COUNT() FROM Case WHERE Id = : c.Id]);
        System.assertEquals('Logged', currCase.Status);
        System.assertEquals(true, currCase.New_Activity__c);

        currCase.Status = 'Active';
        currCase.New_Activity__c = true;
        update currCase;
        caseServices.runTrigger = true;
        Test.stopTest();

        currCase.Status = closedCaseStatusList[0].MasterLabel;
        update currCase;
        caseServices.runTrigger = true;
        currCase = [SELECT Id, New_Activity__c, Status FROM Case WHERE Id = : c.Id];
        System.assertEquals(closedCaseStatusList[0].MasterLabel, currCase.Status);
        System.assertEquals(false, currCase.New_Activity__c);


    }

    public static testMethod void testUpdateFlagsOnStatusChangeActiveStatus() {
        caseServices.runTrigger = false;
        Stop_Status__c WOTP = new Stop_Status__c(Name = 'Waiting on 3rd Party', CurrencyISOCode = 'USD');
        insert WOTP;

        Test.startTest();

        List<CaseStatus> closedCaseStatusList = [SELECT MasterLabel FROM CaseStatus WHERE IsClosed = true];

        Id gmdmCaseRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('GMDM').getRecordTypeId();
        Case c = new Case();
        c.Status = 'Logged';
        c.New_Activity__c = true;
        c.RecordTypeId = caseRTId;
        insert c;
        caseServices.runTrigger = true;

        Case currCase = [SELECT Id, New_Activity__c, Status FROM Case WHERE Id = : c.Id];
        System.assertEquals(1, [SELECT COUNT() FROM Case WHERE Id = : c.Id]);
        System.assertEquals('Logged', currCase.Status);
        System.assertEquals(true, currCase.New_Activity__c);

        currCase.Status = 'Active';
        update currCase;
        currCase = [SELECT Id, New_Activity__c, Status FROM Case WHERE Id = : c.Id];
        System.assertEquals('Active', currCase.Status);
        System.assertEquals(true, currCase.New_Activity__c);

        Test.stopTest();

    }

    public static testMethod void testUpdateNumTimesIn3rdParty() {
        caseServices.runTrigger = false;

        //NOTE: CaseHistory records are not created in Test context and cannot be created manually,
        //therefore a portion of the code cannot possibly be tested
        Test.startTest();
        Stop_Status__c WOTP = new Stop_Status__c(Name = 'Waiting on 3rd Party', CurrencyISOCode = 'USD');
        Stop_Status__c WFR = new Stop_Status__c(Name = 'Waiting for Requestor', CurrencyISOCode = 'USD');
        insert new List<Stop_Status__c> {WOTP, WFR};

        Id gmdmCaseRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('GMDM').getRecordTypeId();
        Case c = new Case();
        c.Status = 'Logged';
        c.New_Activity__c = true;
        c.RecordTypeId = caseRTId;
        insert c;
        caseServices.runTrigger = true;

        Case currCase = [SELECT Id, Status, Number_of_Times_in_3rd_Party__c FROM Case WHERE Id = : c.Id];

        System.assertEquals(0, currCase.Number_of_Times_in_3rd_Party__c);

        currCase.Number_of_Times_in_3rd_Party__c = null;
        currCase.Status = 'Waiting on 3rd Party';
        update currCase;

        currCase = [SELECT Id, Status, Number_of_Times_in_3rd_Party__c FROM Case WHERE Id = : currCase.Id];
        System.assertEquals(1, currCase.Number_of_Times_in_3rd_Party__c);

        currCase.Status = 'Waiting for Requestor';
        update currCase;

        currCase = [SELECT Id, Status, Number_of_Times_in_3rd_Party__c FROM Case WHERE Id = : currCase.Id];

        Test.stopTest();
        System.assertEquals(1, currCase.Number_of_Times_in_3rd_Party__c);
    }

    public static testMethod void testUpdateCaseTypeAndReassign() {
        CaseTypeForDept__c gmdmCaseType = new CaseTypeForDept__c(Name = 'GMDM', Business_Process_Name__c = 'GMDM', Default_Type__c = 'Global Master Data Management');
        CaseTypeForDept__c hrCaseType = new CaseTypeForDept__c(Name = 'HR', Business_Process_Name__c = 'HR', Default_Type__c = 'Human Resources');
        insert new List<CaseTypeForDept__c> {gmdmCaseType, hrCaseType};

        Id gmdmCaseRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('GMDM').getRecordTypeId();
        Id hrCaseRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('HR').getRecordTypeId();
        String oldType, newType, oldOwner, newOwner;
        Case c = new Case();
        c.Status = 'Logged';
        c.RecordTypeId = gmdmCaseRecordTypeId;
        insert c;
        caseServices.runTrigger = true;
        c = [SELECT Id, Type, OwnerId FROM Case WHERE Id = : c.Id];
        oldType = c.Type;
        oldOwner = c.OwnerId;

        c.RecordTypeId = hrCaseRecordTypeId;
        Test.startTest();
        update c;
        c = [SELECT Id, Type, OwnerId FROM Case WHERE Id = : c.Id];
        newType = c.Type;
        newOwner = c.OwnerId;
        Test.stopTest();

        System.assertNotEquals(oldType, newType);
        System.assertNotEquals(oldOwner, newOwner);
    }

    public static testMethod void testSyncSelfRegistrationOwnership() {

        Database.DMLOptions dmo = new Database.DMLOptions();
        dmo.assignmentRuleHeader.useDefaultRule = false;

        Profile p = [SELECT Id FROM Profile WHERE Name = 'System Administrator'];
        User u = new User(Alias = 'beamtu', Email = 'standarduser@testorg.com',
                          EmailEncodingKey = 'UTF-8', LastName = 'Testing', LanguageLocaleKey = 'en_US',
                          LocaleSidKey = 'en_US', ProfileId = p.Id,
                          TimeZoneSidKey = 'America/Chicago', UserName = 'beamsuntorytestuser@test-user-system.com.test-only');
        insert u;

        Id registrationApprovalCaseRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('Registration Approval').getRecordTypeId();
        Id standardCaseRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get(CASE_RT_Standard).getRecordTypeId();
        Contact registrationContact = new Contact(FirstName = 'Registration', LastName = 'User');
        Contact standardContact = new Contact(FirstName = 'Standard', LastName = 'User');
        insert new List<Contact> {registrationContact, standardContact};
        Case registrationCase = new Case(RecordTypeId = registrationApprovalCaseRecordTypeId, ContactId = registrationContact.Id);
        registrationCase.setOptions(dmo);
        Case standardCase = new Case(RecordTypeId = standardCaseRecordTypeId, ContactId = standardContact.Id);
        standardCase.setOptions(dmo);
        insert new List<Case> {registrationCase, standardCase};
        caseServices.runTrigger = true;

        Test.startTest();
        //Testing scenario where record type is "Registration Approval"
        Case queriedRegCase = [SELECT Id, OwnerId, Submitter__c FROM Case WHERE Id = : registrationCase.Id];
        Contact queriedRegContact = [SELECT Id, OwnerId FROM Contact WHERE Id = : registrationContact.Id];
        //System.assertEquals(queriedRegCase.OwnerId, queriedRegContact.OwnerId);
        System.assertNotEquals(queriedRegCase.OwnerId, u.Id);
        System.assertNotEquals(queriedRegContact.OwnerId, u.Id);
        queriedRegCase.OwnerId = u.Id;
        update queriedRegCase;

        queriedRegCase = [SELECT Id, OwnerId FROM Case WHERE Id = : registrationCase.Id];
        queriedRegContact = [SELECT Id, OwnerId FROM Contact WHERE Id = : registrationContact.Id];
        System.assertEquals(queriedRegCase.OwnerId, queriedRegContact.OwnerId);
        System.assertEquals(queriedRegCase.OwnerId, u.Id);
        System.assertEquals(queriedRegContact.OwnerId, u.Id);

        //Testing scenario where record type is "Standard Case"
        Case queriedStandardCase = [SELECT Id, OwnerId FROM Case WHERE Id = : standardCase.Id];
        Contact queriedStandardContact = [SELECT Id, OwnerId FROM Contact WHERE Id = : standardContact.Id];
        //System.assertEquals(queriedStandardCase.OwnerId, queriedStandardContact.OwnerId);
        System.assertNotEquals(queriedStandardCase.OwnerId, u.Id);
        System.assertNotEquals(queriedStandardContact.OwnerId, u.Id);
        queriedStandardCase.OwnerId = u.Id;
        update queriedStandardCase;

        queriedStandardCase = [SELECT Id, OwnerId FROM Case WHERE Id = : standardCase.Id];
        queriedStandardContact = [SELECT Id, OwnerId FROM Contact WHERE Id = : standardContact.Id];
        System.assertNotEquals(queriedStandardCase.OwnerId, queriedStandardContact.OwnerId);
        System.assertEquals(queriedStandardCase.OwnerId, u.Id);
        System.assertNotEquals(queriedStandardContact.OwnerId, u.Id);
        Test.stopTest();
    }

    public static testMethod void testRemoveAbandonedCases() {
        caseServices.runTrigger = false;

        Id gmdmCaseRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('GMDM').getRecordTypeId();

        Test.startTest();

        Database.DMLOptions dmo = new Database.DMLOptions();
        dmo.AssignmentRuleHeader.useDefaultRule = true;

        Case c = new Case();
        c.Status = 'New';
        c.Last_Status_Change__c = System.Now();
        c.RecordTypeId = gmdmCaseRecordTypeId;
        c.setOptions(dmo);
        insert c;

        caseServices.runTrigger = true;

        System.assertEquals(1, [SELECT COUNT() FROM Case]);
        c.OwnerId = UserInfo.getUserId();
        c.Case_Resolution_Details__c = 'Case closed';
        c.Status = 'Closed - Abandoned';
        update c;

        Test.stopTest();

        System.assertEquals(0, [SELECT COUNT() FROM Case]);
    }

    public static testMethod void testSendEmail() {

        Test.startTest();
        Case c = new Case();
        c.Status = 'New';
        c.Subject = 'Test Case';
        c.Submitter__c = UserInfo.getUserId();
        c.Last_Status_Change__c = System.Now();
        c.RecordTypeId = caseRTId;
        insert c;

        EmailMessage em = new EmailMessage(FromAddress = 'gbs@test.com', Incoming = False, ToAddress = 'cs@test.com', Subject = 'Test email', TextBody = 'Test body', ParentId = c.Id);
        insert em;

        caseServices.sendEmail(new List<Id> {em.Id});
        Test.stopTest();
    }





    public static testMethod void testUpdateParentCaseCloseAllSubCases() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        Id recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get(System.Label.Order_Claim).getRecordTypeId();

        Case c = new Case();
        c.Status = 'New';
        c.Subject = 'Test Case';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = recordTypeId;
        insert c;

        List<Case> childCases = createChildCaseRecords(System.Label.Order_Claim_Sub_Case, 'New', c.Id, 2, true);
        Case parentCase = getCasesById(new Set<Id> {c.Id})[0];
        System.assertEquals(false, c.All_Sub_Cases_Closed__c, 'no child cases are closed, this value should be false');

        caseServices.runTrigger = true;

        Test.startTest();
        for (Case child : childCases) {
            child.Status = 'Closed';
            System.debug('>>> child case ' + child.Id);
        }
        update childCases;

        Test.stopTest();
        Case updatedParentCase = getCasesById(new Set<Id> {c.Id})[0];

        System.assertEquals(true, updatedParentCase.All_Sub_Cases_Closed__c, 'All Sub Cases closed field on the parent should be closed once child cases are closed');

    }

    public static testMethod void testUpdateParentCaseCloseOneSubCase() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        Id recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get(System.Label.Order_Claim).getRecordTypeId();

        Case c = new Case();
        c.Status = 'New';
        c.Subject = 'Test Case';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = recordTypeId;
        insert c;

        List<Case> childCases = createChildCaseRecords(System.Label.Order_Claim_Sub_Case, 'New', c.Id, 2, true);
        Case parentCase = getCasesById(new Set<Id> {c.Id})[0];
        System.assertEquals(false, c.All_Sub_Cases_Closed__c, 'no child cases are closed, this value should be false');

        caseServices.runTrigger = true;

        Test.startTest();
        childCases[0].Status = 'Closed';
        update childCases[0];

        Test.stopTest();
        Case updatedParentCase = getCasesById(new Set<Id> {c.Id})[0];

        System.assertEquals(false, updatedParentCase.All_Sub_Cases_Closed__c, 'Only one sub case is closed, this should be false');

    }

    public static testMethod void testCheckIfCaseWasReopened() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        caseServices.runTrigger = false;
        Id recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Order_Claim').getRecordTypeId();

        Test.startTest();

        Case c = new Case();
        c.Status = 'Closed';
        c.Subject = 'Test Case';
        c.Financial_Disposition__c = 'Credit';
        c.Return_SAP_Number__c = '111';
        c.Compliant_Pro_Number__c = '123';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = recordTypeId;
        insert c;

        caseServices.runTrigger = true;

        Case updatedCase = [select Id, Status, EntitlementId from Case where Id = :c.Id];

        updatedCase.Status  = 'New';
        update updatedCase;

        Test.stopTest();
        Case caseUpdate = getCasesById(new Set<Id> {c.Id})[0];
        System.assertEquals(true, caseUpdate.isReOpened__c);

    }

    public static testMethod void testSetChildCaseToExpeditedOrderClaim() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        Id recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Order_Claim').getRecordTypeId();

        Case c = new Case();
        c.Status = 'New';
        c.Subject = 'Test Case';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = recordTypeId;
        insert c;

        List<Case> childCases = createChildCaseRecords(System.Label.Order_Claim_Sub_Case, 'New', c.Id, 2, true);
        caseServices.runTrigger = true;


        Test.startTest();
        c.Expedited_Claim__c = true;
        update c;

        Test.stopTest();
        List<Case> updatedCases = getCasesById(new Set<Id> {c.Id});

        for (Case cc : updatedCases) {
            System.assertEquals(true, cc.Expedited_Claim__c);
        }

    }

    public static testMethod void testAddEntitlementToLogisticsRequestCase() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        Id recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('Logistics request').getRecordTypeId();

        Account acct = new Account();
        acct.Name = 'test Account';
        insert acct;

        List<Entitlement> entitlementsBefore = getEntitlementsOnAccount(acct.Id);

        System.assertEquals(true, entitlementsBefore.isEmpty(), 'No Entitlements should be associated with this Account');

        Test.starttest();

        Case c = new Case();
        c.Status = 'New';
        c.Subject = 'Test Case';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = recordTypeId;
        c.AccountId = acct.Id;
        insert c;
        c.Status= 'Working';
        update c;
        List<Entitlement> entitlementsAfter = getEntitlementsOnAccount(acct.Id);
        Case cc = getCasesById(new Set<Id> {c.Id})[0];

        Test.stopTest();

        System.assertEquals(1, entitlementsAfter.size(), 'The Account should have 1 Entitlement');
        System.assertEquals(CSConstants.LOGISTICS_REQUEST_ENTITLEMENT, cc.Entitlement.Name);

    }

    public static testMethod void testAddEntitlementToCase() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        Id recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get(System.Label.Order_Claim).getRecordTypeId();

        Account acct = new Account();
        acct.Name = 'test Account';
        insert acct;

        List<Entitlement> entitlementsBefore = getEntitlementsOnAccount(acct.Id);

        System.assertEquals(true, entitlementsBefore.isEmpty(), 'No Entitlements should be associated with this Account');

        Test.starttest();

        Case c = new Case();
        c.Status = 'New';
        c.Subject = 'Test Case';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = recordTypeId;
        c.AccountId = acct.Id;
        insert c;

        List<Entitlement> entitlementsAfter = getEntitlementsOnAccount(acct.Id);
        Case cc = getCasesById(new Set<Id> {c.Id})[0];

        Test.stopTest();

        System.assertEquals(1, entitlementsAfter.size(), 'The Account should have 1 Entitlement');
        System.assertEquals(CSConstants.ORDER_CLAIMS_ENTITLEMENT, cc.Entitlement.Name);

    }

    @isTest(SeeAllData = true)
    public static void testAssignBusinessHoursToCase() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        Id recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get(System.Label.Order_Claim_Sub_Case).getRecordTypeId();
        Set<Id> caseIds = new Set<Id>();
        List<Case> cases = new List<Case>();
        Map<String, Case> plantToCaseMap = new Map<String, Case>();
        Test.startTest();
        // create one case for each shipping plant
        // custom metadata type CS Plant Setting stores the plant settings
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'ACCU-TEC', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'ADL', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Australia Bedfords', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Australia Pendulum', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Behror', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Blue Ocean', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Clermont', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Cooleys', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'CRS', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Frankfort', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Frankfort-DHL', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Fundador', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Germany BSI', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Glenturner', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Hooghoudt', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Jarnac', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Loretto', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Ned Cargo', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Onsort', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Pri-Pack', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Sauza', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Segovia', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Singapore BSI', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Suntory-Japanese Whiskey', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Tri-Link', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Western Wine Services', BusinessHoursId = null));
        cases.add(new Case(Status = 'New', RecordTypeId = recordTypeId, Shipping_Plant__c = 'Walkerville', BusinessHoursId = null));

        insert cases;

        Map<String, String> shippingPlantToBusinessHours = new Map<String, String> {
            'ADL'                       => 'Canada - MST',
            'ACCU-TEC'                  => 'US',
            'Australia Bedfords'        => 'Australia - EDT',
            'Australia Pendulum'        => 'Australia - EDT',
            'Behror'                    => 'India',
            'Blue Ocean'                => 'India',
            'Clermont'                  => 'US',
            'Cooleys'                   => 'UK',
            'CRS'                       => 'UK',
            'Frankfort-DHL'             => 'US',
            'Frankfort'                 => 'US',
            'Fundador'                  => 'Europe - CET',
            'Germany BSI'               => 'Germany',
            'Glenturner'                => 'UK',
            'Hooghoudt'                 => 'Europe - CET',
            'Jarnac'                    => 'Europe - CET',
            'Loretto'                   => 'US',
            'Ned Cargo'                 => 'Europe - CET',
            'Onsort'                    => 'Canada - CST',
            'Sauza'                     => 'Mexico',
            'Pri-Pack'                  => 'US',
            'Segovia'                   => 'Europe - CET',
            'Singapore BSI'             => 'Singapore',
            'Suntory-Japanese Whiskey'  => 'Japan',
            'Tri-Link'                  => 'US',
            'Walkerville'               => 'Canada - CST',
            'Western Wine Services'     => 'US'
        };

        for (Case c : cases) {
            caseIds.add(c.Id);
        }

        Test.stopTest();

        for (Case plantCase : getCasesById(caseIds)) {
            System.assertEquals(shippingPlantToBusinessHours.get(plantCase.Shipping_Plant__c), plantCase.BusinessHours.Name, 'The shipping plant should be present in the shippingPlantToBusinessHours Map: ' + plantCase.Shipping_Plant__c);
        }
    }


    public static testMethod void testSetChildCasesToBePickedUpByAssignmentRules() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        caseServices.runTrigger = false;
        Id recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get(System.Label.Order_Claim).getRecordTypeId();

        Case c = new Case();
        c.Status = 'New';
        c.Subject = 'Test Case';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = recordTypeId;
        insert c;

        Test.startTest();

        List<Case> childCases = createChildCaseRecords(System.Label.Order_Claim_Sub_Case, 'New', c.Id, 2, true);
        Case parentCase = getCasesById(new Set<Id> {c.Id})[0];
        List<Case> childCasesUpdated = getCasesById(new Set<Id> {childCases[0].Id, childCases[1].Id });
        Group defaultOrderClaimQueue = [select id from Group where Type = 'Queue' AND DeveloperName = 'Order_Claim_Sub_Case_Queue' limit 1];
        Group canadaPlantQueue = [select id from Group where Type = 'Queue' AND DeveloperName = 'Canada_Plant_Queue' limit 1];

        for (Case cc : childCasesUpdated) {
            System.assertEquals(defaultOrderClaimQueue.Id, cc.OwnerId, 'The Case should default to the "Order Claim Sub Case Queue" Queue');
            cc.Shipping_Plant__c = 'Walkerville';
        }
        caseServices.runTrigger = true;
        update childCasesUpdated;
        Test.stopTest();

        caseServices.runTrigger = true;
        parentCase.Status = 'Pending Sub-Case';
        update parentCase;

        List<Case> childCasesNewOwner = getCasesById(new Set<Id> {childCases[0].Id, childCases[1].Id });

        for (Case cc : childCasesNewOwner) {
            System.assertEquals(canadaPlantQueue.Id, cc.OwnerId, 'The Case should equal the canada queue');
        }
    }

    public static testMethod void testCheckRequiredFieldsOnChildForClosingParentCase() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        caseServices.runTrigger = false;
        Id recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get(System.Label.Order_Claim).getRecordTypeId();

        Case c = new Case();
        c.Status = 'New';
        c.Subject = 'Test Case';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = recordTypeId;
        insert c;

        Test.startTest();

        List<Case> childCases = createChildCaseRecords(System.Label.Order_Claim_Sub_Case, 'New', c.Id, 2, true);

        Case parentCase = getCasesById(new Set<Id> {c.Id})[0];

        for (Case cc : childCases) {
            cc.Financial_Disposition__c = 'Credit';
            cc.Return_SAP_Number__c = '1234';
            cc.Status = 'Closed';
            cc.Type = 'Damage Claim';
        }

        caseServices.runTrigger = true;
        update childCases;

        Test.stopTest();

        caseServices.runTrigger = true;
        parentCase.Status = 'Closed';
        parentCase.Financial_Disposition__c = 'Credit';
        parentCase.Return_SAP_Number__c = '111';
        parentCase.Compliant_Pro_Number__c = '123';
        update parentCase;

        List<Case> childCasesUpdated = getCasesById(new Set<Id> {childCases[0].Id, childCases[1].Id });
    }


    public static testMethod void testCheckRequiredFieldsOnChildForClosingParentCaseForDamageClaim() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        caseServices.runTrigger = false;
        Id recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get(System.Label.Order_Claim).getRecordTypeId();

        Test.startTest();

        Case c = new Case();
        c.Status = 'New';
        c.Subject = 'Test Case';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = recordTypeId;
        c.Return_SAP_number_missing__c = false;
        insert c;

        List<Case> childCases = createChildCaseRecords(System.Label.Order_Claim_Sub_Case, 'New', c.Id, 2, false);

        for (Case cc : childCases) {
            cc.Financial_Disposition__c = null;
            cc.Return_SAP_Number__c = null;
            cc.Type = 'Damage Claim';
        }
        caseServices.runTrigger = false;
        insert childCases;

        for (Case cc : childCases) {
            cc.Financial_Disposition__c = 'Credit';
            cc.Return_SAP_Number__c = null;
            cc.Status = 'Closed - Approved';
        }

        caseServices.runTrigger = true;
        update childCases;

        Test.stopTest();

        Case updatedParentCase = getCasesById(new Set<Id> {c.Id})[0];


        System.assertEquals(true, updatedParentCase.Return_SAP_number_missing__c, 'Child case is missing Return SAP number so flag should be set to true');
    }


    public static testMethod void testCheckRequiredFieldsOnChildForClosingParentCaseForOverageClaim() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        caseServices.runTrigger = false;
        List<Case> childCases = new List<Case>();

        Id recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get(System.Label.Order_Claim).getRecordTypeId();

        Test.startTest();

        Case c = new Case();
        c.Status = 'New';
        c.Subject = 'Test Case';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = recordTypeId;
        c.Return_SAP_number_missing__c = false;
        insert c;

        childCases = createChildCaseRecords(System.Label.Order_Claim_Sub_Case, 'New', c.Id, 2, false);

        for (Case cc : childCases) {
            cc.Financial_Disposition__c = null;
            cc.Return_SAP_Number__c = null;
            cc.Type = 'Overage Claim';
        }
        caseServices.runTrigger = false;
        insert childCases;

        for (Case cc : childCases) {
            cc.Financial_Disposition__c = 'Credit';
            cc.Return_SAP_Number__c = '12345';
            cc.Billing_SAP_Number__c = null;
            cc.Status = 'Closed - Approved';
        }
        caseServices.runTrigger = true;
        update childCases;
        Test.stopTest();



        Case updatedParentCase = getCasesById(new Set<Id> {c.Id})[0];



        System.assertEquals(true, updatedParentCase.Billing_SAP_number_missing__c, 'Child case is missing Billing SAP number so flag should be set to true');
    }

    @isTest(SeeAllData = false)
    public static void testSettingBusinessBasedOnCountryGTR() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        caseServices.runTrigger = true;
        Id recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get(System.Label.Order_Claim).getRecordTypeId();

        Test.startTest();

        Case c = new Case();
        c.Status = 'New';
        c.Subject = 'Test Case';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = recordTypeId;
        c.Product_Destination_Country__c = 'Brazil';
        c.Is_GTR_Distributor__c = true;
        insert c;

        //List<Case> childCases = createChildCaseRecords(System.Label.Order_Claim_Sub_Case, 'New', c.Id, 2, true);

        Test.stopTest();

        Case parentCase = getCasesById(new Set<Id> {c.Id})[0];

        System.assertNotEquals(NULL, parentCase.BusinessHours.Name);
    }

    public static testMethod void testSettingBusinessBasedOnCountryNotGTRDefaultUS() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        Id recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get(System.Label.Order_Claim).getRecordTypeId();

        Test.startTest();

        Case c = new Case();
        c.Status = 'New';
        c.Subject = 'Test Case';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = recordTypeId;
        c.Product_Destination_Country__c = 'Brazil';
        insert c;

        List<Case> childCases = createChildCaseRecords(System.Label.Order_Claim_Sub_Case, 'New', c.Id, 2, true);

        Test.stopTest();

        Case parentCase = getCasesById(new Set<Id> {c.Id})[0];

        System.assertEquals('US', parentCase.BusinessHours.Name);
    }

    public static testMethod void testSettingBusinessBasedOnCountryNotGTRAndNotUS() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        Id recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get(System.Label.Order_Claim).getRecordTypeId();

        Test.startTest();

        Case c = new Case();
        c.Status = 'New';
        c.Subject = 'Test Case';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = recordTypeId;
        c.Product_Destination_Country__c = 'Sri Lanka';
        insert c;

        List<Case> childCases = createChildCaseRecords(System.Label.Order_Claim_Sub_Case, 'New', c.Id, 2, true);

        Test.stopTest();

        Case parentCase = getCasesById(new Set<Id> {c.Id})[0];

        System.assertEquals('UK', parentCase.BusinessHours.Name);
    }

    public static testMethod void testSetDefaultAccountIfBailmentOrderClaimCase() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        Id recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get(System.Label.Order_Claim).getRecordTypeId();

        Test.startTest();

        Case c = new Case();
        c.Status = 'New';
        c.Subject = 'Test Case';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = recordTypeId;
        c.Product_Destination_Country__c = 'Sri Lanka';
        c.Is_Bailment_Claims__c = true;
        c.AccountId = null;
        insert c;

        Test.stopTest();

        Case parentCase = getCasesById(new Set<Id> {c.Id})[0];

        List<Account> accts = [select Id, RecordTypeId, Name
                               from Account
                               where Name = :CSConstants.DEFAULT_ACCOUNT_NAME
                                            AND RecordTypeId = :CSConstants.DEFAULT_ACCOUNT_RT_ID limit 1];

        System.assertEquals(accts[0].Id, parentCase.AccountId);
    }


    @isTest(SeeAllData = true)
    public static void testClosePreparePlantMilestone() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        caseServices.runTrigger = false;
        Id recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get(System.Label.Order_Claim).getRecordTypeId();
        Id acctRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Distributor').getRecordTypeId();

        Account acct = new Account();
        acct.Name = 'Beam Suntory';
        acct.RecordTypeId = acctRecordTypeId;
        insert acct;

        Test.startTest();

        Case c = new Case();
        c.Status = 'New';
        c.Subject = 'Test Case';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = recordTypeId;
        c.Product_Destination_Country__c = 'Sri Lanka';
        c.Is_Bailment_Claims__c = true;
        c.AccountId = acct.Id;
        insert c;

        CaseMilestone preparePlantMilestone = new CaseMilestone();
        for (CaseMilestone caseMilestone : getCaseMilestoneByCaseId(c.Id)) {
            if (CSConstants.PREPARE_FOR_PLANT_MILESTONES.contains(caseMilestone.MilestoneType.Name)) {
                preparePlantMilestone = caseMilestone;
                break;
            }
        }

        System.assertEquals('Prepare for Plant', preparePlantMilestone.MilestoneType.Name);
        System.assertEquals(NULL, preparePlantMilestone.CompletionDate);

        caseServices.runTrigger = true;

        c.Status = 'Pending Sub-Case';
        update c;

        Test.stopTest();

        CaseMilestone updatedPreparePlantMilestone = new CaseMilestone();
        for (CaseMilestone caseMilestone : getCaseMilestoneByCaseId(c.Id)) {
            if (CSConstants.PREPARE_FOR_PLANT_MILESTONES.contains(caseMilestone.MilestoneType.Name)) {
                updatedPreparePlantMilestone = caseMilestone;
                break;
            }
        }
        System.assertNotEquals(NULL, updatedPreparePlantMilestone.CompletionDate);
    }

    @isTest(SeeAllData = false)
    public static void testCreateCasefromSalesOrder() {


        Account a = new Account();
        a.RecordTypeId = accountRTId;
        a.Name = 'Test Account';
        insert a;

        gvp__Sales_Order__c salesOrder  = new gvp__Sales_Order__c();
        salesOrder.gvp__Account__c = a.id;
        salesOrder.gvp__Order_Number__c = 'ORD-0000000500';
        salesOrder.gvp__Status__c = 'Open';
        salesOrder.gvp__Sales_Order_Key__c = '';
        salesOrder.gvp__Order_Date__c = system.today();
        salesOrder.gvp__ERP_Id__c = null;
        insert salesOrder;

        List <Case> lstCase = [select id, caseNumber, sales_Order__c from case where sales_Order__c = : salesOrder.id];

        system.debug('before Update' + lstCase.size());
        system.assert(lstCase.size() == 0);

        salesOrder.gvp__ERP_Id__c = '0000001234';
        update salesOrder;

        lstCase = [select id, caseNumber, sales_Order__c from case where sales_Order__c = : salesOrder.id];
        system.debug('after update' + lstCase.size());
        system.assert(lstCase.size() == 1);
    }

    @isTest(SeeAllData = true)
    public static void testRemoveSLAFromCase() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        caseServices.runTrigger = false;
        Id recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get(System.Label.Order_Claim).getRecordTypeId();
        Id acctRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Distributor').getRecordTypeId();

        Account acct = new Account();
        acct.Name = 'Beam Suntory';
        acct.RecordTypeId = acctRecordTypeId;
        insert acct;

        Test.startTest();

        Case c = new Case();
        c.Status = 'New';
        c.Subject = 'Test Case';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = recordTypeId;
        c.Product_Destination_Country__c = 'Sri Lanka';
        c.Is_Bailment_Claims__c = true;
        c.AccountId = acct.Id;
        insert c;

        List<Case> childCases = createChildCaseRecords(System.Label.Order_Claim_Sub_Case, 'New', c.Id, 2, true);

        Case parentCase = getCasesById(new Set<Id> {c.Id})[0];
        Case childCase = getCasesById(new Set<Id> {childCases[0].Id})[0];

        System.assertNotEquals(NULL, parentCase.EntitlementId);
        System.assertNotEquals(NULL, childCase.EntitlementId);

        caseServices.runTrigger = true;

        Test.stopTest();

        c.Status = CSConstants.DUP_NO_ACTION;
        update c;

        Case parentCaseUpdated = getCasesById(new Set<Id> {c.Id})[0];

        System.assertEquals(NULL, parentCaseUpdated.EntitlementId);

    }


    @isTest(SeeAllData = false)
    public static void updateRegionalDiplomatTest() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        caseServices.runTrigger = false;

        Profile p = [SELECT Id FROM Profile WHERE Name = 'System Administrator'];
        User u = new User(Alias = 'beamtu', Email = 'standarduser@testorg.com', Regional_Diplomat_Regions__c = 'Illinois;Indiana',
                          EmailEncodingKey = 'UTF-8', LastName = 'Testing', LanguageLocaleKey = 'en_US',
                          LocaleSidKey = 'en_US', ProfileId = p.Id,
                          TimeZoneSidKey = 'America/Chicago', UserName = 'beamsuntorytestuser@test-user-system.com.test-only');
        insert u;

        Test.startTest();

        Account testAccount = new Account();
        testAccount.Name = 'Test Account';
        testAccount.BillingState = 'IL';
        testAccount.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('OffPremise').getRecordTypeId();
        insert testAccount;

        Case c = new Case();
        c.Status = SBP_Constants.PENDING_DOCUMENTATION;
        c.Subject = 'Test Case';
        c.Brand__c = 'Makers Mark';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = SBP_Constants.SINGLE_BARREL_STANDARD_RT_ID;
        c.Purchase_Order_Uploaded__c = false;
        c.POS_Items_Selected__c = false;
        c.Bottle_Text_Entered__c = false;
        c.Barrel_selected__c = false;
        c.Retail_Account__c = testAccount.Id;
        c.Regional_Diplomat__c = null;
        caseServices.runTrigger = true;
        insert c;

        Case updatedCase = [select id, Regional_Diplomat__c from Case where Id = :c.id];

        Test.stopTest();

        //System.assertEquals(u.Id, updatedCase.Regional_Diplomat__c);
    }


    @isTest(SeeAllData = false)
    public static void moveSingleBarrelCaseStatusTest() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        caseServices.runTrigger = false;

        Test.startTest();

        Case c = new Case();
        c.Status = SBP_Constants.PENDING_DOCUMENTATION;
        c.Subject = 'Test Case';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = SBP_Constants.SINGLE_BARREL_STANDARD_RT_ID;
        c.Purchase_Order_Uploaded__c = false;
        c.POS_Items_Selected__c = false;
        c.Bottle_Text_Entered__c = false;
        c.Barrel_selected__c = false;
        insert c;

        caseServices.runTrigger = true;

        c.Purchase_Order_Uploaded__c = true;
        c.POS_Items_Selected__c = true;
        c.Bottle_Text_Entered__c = true;
        c.Barrel_selected__c = true;
        c.SAP_Number__c = '123';
        update c;

        Case updatedCase = [select id, Purchase_Order_Uploaded__c, SAP_Number__c, Status from Case where Id = :c.id];

        Test.stopTest();

        System.assertEquals(SBP_Constants.PREPARING_BARREL, updatedCase.Status);
    }


    @isTest(SeeAllData = false)
    public static void submitterMissingTest() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        caseServices.runTrigger = true;

        Test.startTest();
        Database.DMLOptions dmo = new Database.DMLOptions();
        dmo.AssignmentRuleHeader.useDefaultRule = true;

        Case c = new Case();
        c.Status = SBP_Constants.PENDING_DOCUMENTATION;
        c.Subject = 'Test Case';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = SBP_Constants.SINGLE_BARREL_STANDARD_RT_ID;
        c.Purchase_Order_Uploaded__c = false;
        c.POS_Items_Selected__c = true;
        c.Bottle_Text_Entered__c = true;
        c.Barrel_selected__c = true;
        insert c;

        Case updatedCase = [select id, Submitter__c, SAP_Number__c, Status from Case where Id = :c.id];

        Test.stopTest();

        System.assertNotEquals(NULL, updatedCase.Submitter__c);
    }



    @isTest(SeeAllData = false)
    public static void emailEskerPDFsTest() {

        //Setup test user
        Profile p = [SELECT Id FROM Profile WHERE Name = 'System Administrator'];
        User u = new User(Alias = 'beamtu', Email = 'standarduser@testorg.com',
                          EmailEncodingKey = 'UTF-8', LastName = 'Testing', LanguageLocaleKey = 'en_US',
                          LocaleSidKey = 'en_US', ProfileId = p.Id,
                          TimeZoneSidKey = 'America/Chicago', UserName = 'beamsuntorytestuser@test-user-system.com.test-only');

        List<Group> queues = [select Id from Group where Type = 'Queue' AND NAME = 'Orders Queue'];
        Database.DMLOptions dmo = new Database.DMLOptions();
        dmo.AssignmentRuleHeader.useDefaultRule = true;


        Test.startTest();
        Case c;
        System.runAs(u) {
            caseServices.runTrigger = false;

            c = new Case();
            c.Subject = 'Test Case';
            c.RecordTypeId = CSConstants.ORDERS_RT_ID;
            c.Type = 'Standard';
            c.Origin = 'Customer Portal';
            c.Email_Sent_to_Esker__c = false;
            c.setOptions(dmo);
            insert c;

            Case updatedCase = [select id, OwnerId, BSI_Function__c, IsClosed, Type, Origin, Email_Sent_to_Esker__c from Case where Id = :c.Id];
            System.assertEquals(queues[0].Id, updatedCase.OwnerId, 'Case should be assigned to orders queue');

            // create file attached to current case
            ContentVersion eskarDoc = createContentVersion();
            eskarDoc = [SELECT Id, Title, ContentDocumentId FROM ContentVersion WHERE Id = :eskarDoc.Id LIMIT 1];
            ContentDocumentLink docLink = createContentDocumentLink(updatedCase.Id, eskarDoc.ContentDocumentId);

            //System.assertEquals(0, Limits.getEmailInvocations(), 'No emails should have been sent.');
            //c.Email_Sent_to_Esker__c = true;
            caseServices.runTrigger = true;
            update updatedCase;
        }
        // other emails are being invocated (2 other emails as of 2/22/2019) 1 email is sent from the esker method
        System.assertEquals(3, Limits.getEmailInvocations(), 'Esker email should have been sent.');

        Test.stopTest();

    }


    @isTest(SeeAllData = false)
    public static void ownerChangeFromUserToQueueUpdatesStatusTest() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;

        Test.startTest();
        Database.DMLOptions dmo = new Database.DMLOptions();
        dmo.AssignmentRuleHeader.useDefaultRule = true;
        Group queue = [select Id, DeveloperName from Group where Type = 'Queue' AND DeveloperName = 'OTC_Billing_US' limit 1];

        // case should be assigned to the appropriate queue
        Case c = new Case();
        c.Status = 'Logged';
        c.Subject = 'Test Case';
        c.Type = 'Payroll';
        c.GBS_Center__c = 'US/Canada';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = GBS_Constants.PAYROLL_RT_ID;
        c.setOptions(dmo);
        caseServices.runTrigger = false;
        insert c;

        Case updatedCase = [select Id, Status, Owner.Name from Case where Id = :c.Id];

        // case reassigned to a user
        updatedCase.OwnerId = UserInfo.getUserId();
        updatedCase.Status = 'In Progress';
        caseServices.runTrigger = false;
        update updatedCase;

        // case reassigned to a queue
        // should send the status back to 'Logged'
        updatedCase.OwnerId = queue.Id;
        caseServices.runTrigger = true;
        update updatedCase;

        Case updatedCase2 = [select Id, Status, Owner.Name from Case where Id = :updatedCase.Id];

        Test.stopTest();

        System.assertEquals('Logged', updatedCase2.Status, updatedCase2);
    }

    @isTest(SeeAllData = false)
    public static void ownerChangeFromQueueToUserUpdatesStatusTest() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        caseServices.runTrigger = true;

        Test.startTest();
        Database.DMLOptions dmo = new Database.DMLOptions();
        dmo.AssignmentRuleHeader.useDefaultRule = true;

        Case c = new Case();
        c.Status = 'Logged';
        c.Subject = 'Test Case';
        c.Type = 'Payroll';
        c.GBS_Center__c = 'US/Canada';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = GBS_Constants.PAYROLL_RT_ID;
        c.setOptions(dmo);
        insert c;

        c.OwnerId = UserInfo.getUserId();
        caseServices.runTrigger = true;
        update c;

        Case updatedCase = [select Id, Status from Case where Id = :c.Id];

        Test.stopTest();

        System.assertEquals('In Progress', updatedCase.Status);
    }

    public static ContentVersion createContentVersion() {
        Blob bodyBlob = Blob.valueOf('Unit Test ContentVersion Body');
        ContentVersion testContentVersion = new ContentVersion(
            Title = 'Attachment Name: ' + String.valueOf(System.now()),
            PathOnClient = '/Header_Picture1' + String.valueOf(System.now()) + '.pdf',
            VersionData = bodyBlob,
            origin = 'H'
        );

        insert testContentVersion;
        testContentVersion = [SELECT Id, ContentDocumentId, fileExtension FROM ContentVersion WHERE Id = : testContentVersion.Id FOR UPDATE];
        system.debug('testContentVersion.Id' + testContentVersion.Id);
        system.debug('testContentVersion.ContentDocumentId' + testContentVersion.ContentDocumentId);
        system.debug('testContentVersion.fileExtension' + testContentVersion.fileExtension);

        return testContentVersion;
    }


    public static ContentDocumentLink createContentDocumentLink(Id entityId, Id contentDocumentId) {
        ContentDocumentLink contentlink = new ContentDocumentLink();
        contentlink.LinkedEntityId = entityId;
        contentlink.ContentDocumentId = contentDocumentId;
        contentlink.ShareType = 'V';
        insert contentlink;
        return contentlink;
    }

    @isTest(SeeAllData = false)
    public static void emailNonTechnicalResponseToParentCaseOwnerTest() {
        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        caseServices.runTrigger = false;

        Profile p = [SELECT Id FROM Profile WHERE Name = 'System Administrator'];

        User u = new User();
        u.Alias = 'beamtu';
        u.Email = 'standarduser@testorg.com';
        u.EmailEncodingKey = 'UTF-8';
        u.LastName = 'Test';
        u.FirstName = 'Test';
        u.LanguageLocaleKey = 'en_US';
        u.LocaleSidKey = 'en_US';
        u.ProfileId = p.Id;
        u.TimeZoneSidKey = 'America/Chicago';
        u.UserName = 'beamsuntorytestuser@test-user-system.com.test-only';
        insert u;

        Test.startTest();
        System.runAs(u) {
            Case c = new Case();
            c.Status = 'New';
            c.Subject = 'Test Case';
            c.Submitter__c = UserInfo.getUserId();
            c.RecordTypeId = CSConstants.QC_RT_ID;
            c.OwnerId = UserInfo.getUserId();
            insert c;

            Case updatedParentCase = [select Id, OwnerId from Case where Id = :c.Id ];
            updatedParentCase.OwnerId = u.Id;


            Case childCase = new Case();
            childCase.ParentId = c.Id;
            childCase.Status = 'New';
            childCase.Subject = 'Test Case';
            childCase.Non_Technical_Response__c = null;
            childCase.Submitter__c = UserInfo.getUserId();
            childCase.RecordTypeId = CSConstants.QC_SUBCASE_RT_ID;
            upsert new List<Case> {updatedParentCase, childCase};

            Case updatedCase = [select Id, Non_Technical_Response__c, OwnerId from Case where Id = :childCase.Id ];

            caseServices.runTrigger = true;
            updatedCase.Non_Technical_Response__c = 'Test Response';
            update updatedCase;

        }

        //Integer invocations = Limits.getEmailInvocations();

        Test.stopTest();

        //System.assertNotEquals(0, invocations, 'At least one email should be sent');
    }

    @isTest(SeeAllData = false)
    public static void emailQualityRecommendationToParentCaseOwnerTest() {

        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        caseServices.runTrigger = false;

        Profile p = [SELECT Id FROM Profile WHERE Name = 'System Administrator'];

        User u = new User();
        u.Alias = 'beamtu';
        u.Email = 'standarduser@testorg.com';
        u.EmailEncodingKey = 'UTF-8';
        u.LastName = 'Test';
        u.FirstName = 'Test';
        u.LanguageLocaleKey = 'en_US';
        u.LocaleSidKey = 'en_US';
        u.ProfileId = p.Id;
        u.TimeZoneSidKey = 'America/Chicago';
        u.UserName = 'beamsuntorytestuser@test-user-system.com.test-only';
        insert u;

        Test.startTest();
        System.runAs(u) {
            Case c = new Case();
            c.Status = 'New';
            c.Subject = 'Test Case';
            c.Submitter__c = UserInfo.getUserId();
            c.RecordTypeId = CSConstants.QC_RT_ID;
            c.OwnerId = UserInfo.getUserId();
            insert c;

            Case updatedParentCase = [select Id, OwnerId from Case where Id = :c.Id ];
            updatedParentCase.OwnerId = u.Id;


            Case childCase = new Case();
            childCase.ParentId = c.Id;
            childCase.Status = 'New';
            childCase.Subject = 'Test Case';
            childCase.Recommendation__c = null;
            childCase.Submitter__c = UserInfo.getUserId();
            childCase.RecordTypeId = CSConstants.QC_SUBCASE_RT_ID;
            upsert new List<Case> {updatedParentCase, childCase};

            Case updatedCase = [select Id, Recommendation__c, OwnerId from Case where Id = :childCase.Id ];

            caseServices.runTrigger = true;
            updatedCase.Recommendation__c = 'Return Sample';
            update updatedCase;

        }

        //Integer invocations = Limits.getEmailInvocations();

        Test.stopTest();

        //System.assertNotEquals(0, invocations, 'At least one email should be sent');
    }

    @isTest(SeeAllData = false)
    public static void createQualityClaimSubCaseTest() {

        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        caseServices.runTrigger = true;
        List<Case> childCases;

        Test.startTest();
        Account a = new Account();
        a.RecordTypeId = accountRTId;
        a.Name = 'Test Account';
        insert a;

        Case c = new Case();
        c.Status = 'New';
        c.accountId = a.id;
        c.Subject = 'Test Case';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = CSConstants.QC_RT_ID;
        c.OwnerId = UserInfo.getUserId();
        insert c;


        childCases = [select Id, OwnerId, Status from Case where ParentId = :c.Id ];
        

        Test.stopTest();

        System.assertEquals(1, childCases.size(), 'One Child Case should have been created');
    }

    @isTest(SeeAllData = false)
    public static void updateQualityClaimSubCaseTest() {

        CaseComplianceUtility.runCaseComplianceTriggerLogic = false;
        caseServices.runTrigger = false;
        List<Case> childCases;

        Test.startTest();

        Case c = new Case();
        c.Status = 'New';
        c.Subject = 'Test Case';
        c.Submitter__c = UserInfo.getUserId();
        c.RecordTypeId = CSConstants.QC_RT_ID;
        c.OwnerId = UserInfo.getUserId();
        insert c;

        Case childCase = new Case();
        childCase.ParentId = c.Id;
        childCase.OwnerId = UserInfo.getUserId();
        childCase.Status = 'New';
        childCase.Subject = 'Test Case';
        childCase.Submitter__c = UserInfo.getUserId();
        childCase.RecordTypeId = CSConstants.QC_SUBCASE_RT_ID;
        insert childCase;

        Case updatedCase = [select Id, Status from Case where Id = :c.Id ];

        caseServices.runTrigger = true;
        updatedCase.Status = 'Pending Sub-Case';
        updatedCase.OwnerId = UserInfo.getUserId();
        update updatedCase;

        Case updatedChildCase = [select Id, OwnerId, Owner.Name, Status from Case where Id = :childCase.Id ];


        Test.stopTest();

        System.assertNotEquals(updatedChildCase.OwnerId, childCase.OwnerId, 'OwnerId\'s should be different');
    }

    @isTest(SeeAllData = false)
    public static void csCustomExceptionTest() {
        try {
            throw new CS_CustomException('Error Occured');
        } catch (Exception e) {

        }

    }





}