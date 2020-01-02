public with sharing class CustomLookupController {
    @AuraEnabled
    public static List <sObject> fetchLookUpValues(String searchKeyWord, String objectName) {
        String searchKey = String.escapeSingleQuotes(searchKeyWord.trim()) + '%';

        List <sObject> returnList = new List < sObject > ();

        // Create a Dynamic SOQL Query For Fetch Record List with LIMIT 15

        String sQuery =  'select id, Name from ' + objectName + ' where RecordType.DeveloperName =  \'Distributor\' And Name LIKE: searchKey order by createdDate DESC limit 15';
        system.debug(sQuery);
        List <sObject> lstOfRecords = Database.query(sQuery);

        for (sObject obj : lstOfRecords) {
            returnList.add(obj);
        }
        return returnList;
    }

    @AuraEnabled
    public static String getEnvironmentUrl() {
        return URL.getSalesforceBaseUrl().toExternalForm();
    }


    // returns all "Distributor" accounts based on the search keyword
    @AuraEnabled
    public static List <sObject> getDistributorRecordType(String searchKeyWord, String objectName, Integer queryLimit) {
        String searchKey = searchKeyWord.trim() + '%';
        if (queryLimit == null || queryLimit == 0) {
            queryLimit = 20;
        }

        List <sObject> returnList = new List < sObject > ();
        List <sObject> lstOfRecords = [select id, Name, Attention__c, State__c, TDL_Match_Code__c, PremiseType__c, BillingStreet, BillingCity, BillingState, BillingPostalCode, Phone from Account where RecordType.DeveloperName = 'Distributor' AND (TDL_Match_Code__c = :searchKeyWord OR Name LIKE :searchKey) order by createdDate DESC limit :queryLimit];

        for (sObject obj : lstOfRecords) {
            returnList.add(obj);
        }
        return returnList;
    }

    // returns all "Retail" accounts based on the search keyword
    @AuraEnabled
    public static List <sObject> getPremiseRecordType(String searchKeyWord, String objectName, Integer queryLimit) {
        String searchKey = searchKeyWord.trim() + '%';
        if (queryLimit == null || queryLimit == 0) {
            queryLimit = 20;
        }
        List <sObject> returnList = new List < sObject > ();

        List <sObject> lstOfRecords = [select id, Name, PremiseType__c, BillingStreet, BillingCity, BillingState, BillingPostalCode, RecordType.DeveloperName from Account where (RecordType.DeveloperName = 'OffPremise' OR RecordType.DeveloperName = 'OnPremise') AND (TDL_Match_Code__c = :searchKeyWord OR Name LIKE :searchKey) order by createdDate DESC limit :queryLimit];

        for (sObject obj : lstOfRecords) {
            returnList.add(obj);
        }
        return returnList;
    }

    // returns all contacts related to a specific account id
    @AuraEnabled
    public static List <sObject> getDistributorContactForAccount(String searchKeyWord, String objectName, String parentId) {
        String searchKey = searchKeyWord.trim() + '%';
        Set<Id> contactIds = new Set<Id>();

        for (AccountContactRelation con : [select id, Contact.Name, Contact.LastName, Contact.Email, ContactId from AccountContactRelation where (AccountId = :Id.valueOf(parentId) AND Contact.Name LIKE :searchKey)]) {
            contactIds.add(con.ContactId);
        }
        return [select Id, Name, LastName from Contact where Id IN :contactIds order by LastName ASC];
    }

    // returns all accounts related to a specfic contact Id
    @AuraEnabled
    public static List <sObject> getMyAccounts(String searchKeyWord, String objectName, String parentId) {
        String searchKey = searchKeyWord.trim() + '%';
        Set<Id> accountIds = new Set<Id>();

        for (AccountContactRelation acct : [select id, AccountId, Account.Name, ContactId from AccountContactRelation where (ContactId = :Id.valueOf(parentId) AND Account.Name LIKE :searchKey)]) {
            accountIds.add(acct.AccountId);
        }
        return [select Id, Name from Account where Id IN :accountIds order by Name ASC limit 50];
    }

}