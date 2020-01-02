@isTest
public class CustomLookupControllerTest {

    @testSetup static void setup() {
        Profile p = [SELECT Id FROM Profile WHERE Name = 'System Administrator'];
        User u = new User(Alias = 'beamtu', Email = 'standarduser@testorg.com',
                          EmailEncodingKey = 'UTF-8', LastName = 'Testing', LanguageLocaleKey = 'en_US',
                          LocaleSidKey = 'en_US', ProfileId = p.Id,
                          TimeZoneSidKey = 'America/Chicago', UserName = 'beamsuntorytestuser@test-user-system.com.test-only');
        insert u;

        Account acct = new Account();
        acct.Name = 'Test Account';
        acct.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('Distributor').getRecordTypeId();

        Account offPremiseAccount = new Account();
        offPremiseAccount.Name = 'Test Off Premise';
        offPremiseAccount.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('OffPremise').getRecordTypeId();

        Account distAccount = new Account();
        distAccount.Name = 'Test Dist';
        distAccount.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('Distributor').getRecordTypeId();

        insert new List<Account> {acct, offPremiseAccount, distAccount};

        Contact c = new Contact();
        c.AccountId = distAccount.Id;
        c.FirstName = 'Test';
        c.LastName = 'Contact';
        insert c;
    }

    public static List<Account> getAccountByName(String name) {
        return [select id, Name from Account where Name = :name];
    }

    public static testMethod void testLookingUpAccount() {
        Test.startTest();

        List<Account> accounts = CustomLookupController.fetchLookUpValues('Test Acco', 'Account');

        Test.stopTest();

        System.assertEquals(1, accounts.size());
        System.assertEquals('Test Account', accounts[0].Name);
    }

    public static testMethod void testGetBaseUrl() {
        Test.startTest();

        String baseUrl = CustomLookupController.getEnvironmentUrl();

        Test.stopTest();

        System.assertNotEquals(NULL, baseUrl);
    }


    public static testMethod void getDistributorRecordTypeTest() {
        Test.startTest();

        List<Account> accounts = CustomLookupController.getDistributorRecordType('Test D', 'Account', 10);

        Test.stopTest();

        System.assertEquals(1, accounts.size());
        System.assertEquals('Test Dist', accounts[0].Name);
    }

    public static testMethod void getPremiseRecordTypeTest() {
        Test.startTest();

        List<Account> accounts = CustomLookupController.getPremiseRecordType('Test Off', 'Account', 10);

        Test.stopTest();

        System.assertEquals(1, accounts.size());
        System.assertEquals('Test Off Premise', accounts[0].Name);
    }

    public static testMethod void getDistributorContactForAccountTest() {
        List<Account> a = getAccountByName('Test Dist');
        Test.startTest();

        List<Contact> contacts = CustomLookupController.getDistributorContactForAccount('Test', 'Contact', Id.valueOf(a[0].Id));

        Test.stopTest();

        System.assertEquals(1, contacts.size());
        System.assertEquals('Test Contact', contacts[0].Name);
    }

}