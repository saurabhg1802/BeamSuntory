public without sharing class SBP_BarrelSelectionCmpCtrl {

    /**************************************************************************************************************
    Author:        Craig Austgen
    Company:       Slalom, LLC
    Description:    Creates a barrel record based on what is selected in the Single Barrel Flow
    History
    <Date>      <Authors Name>     <Brief Description of Change>
    7/2018      Craig Austgen       Initial Creation

    ***************************************************************************************************************/
    @AuraEnabled
    public static LightningComponentUtility.RequestStatus createBarrelRecord(String caseId, String brand, String flavor) {
        Boolean success = true;
        String message = null;
        Map<String, Object> responseMap = new Map<String, Object>();
        Barrel__c barrel = new Barrel__c();

        try {
            List<Barrel__c> barrels = [select id from Barrel__c where Case__c = :Id.valueOf(caseId)];
            if (barrels.isEmpty()) {
                barrel.Case__c = Id.valueOf(caseId);
                barrel.Brand__c = brand;
                barrel.RecordTypeId = SBP_Constants.fullBarrelBrandRTIdMap.get(brand);
                barrel.Product_Type__c = flavor;
                insert barrel;
            } else {
                barrel = barrels[0];
            }

            Case c = new Case();
            c.put('Id', Id.valueOf(caseId));
            c.put('Product_Type__c', flavor);
            update c;

            responseMap.put('barrelId', barrel.Id);

        } catch (Exception e) {
            System.debug(LoggingLevel.INFO, e.getMessage());
            message = e.getMessage();
            success = false;
        }

        LightningComponentUtility.RequestStatus requestStatus = new LightningComponentUtility.RequestStatus(success, message, responseMap);
        System.debug(LoggingLevel.INFO, requestStatus);
        return requestStatus;
    }

    /**************************************************************************************************************
    Author:        Craig Austgen
    Company:       Slalom, LLC
    Description:    queries for the barrel related to the case
    History
    <Date>      <Authors Name>     <Brief Description of Change>
    7/2018      Craig Austgen       Initial Creation

    ***************************************************************************************************************/
    @AuraEnabled
    public static LightningComponentUtility.RequestStatus getRelatedBarrel(String recordId) {
        Boolean success = true;
        String message = null;
        Map<String, Object> responseMap = new Map<String, Object>();

        try {
            Barrel__c b = [select id from Barrel__c where Case__c = :Id.valueOf(recordId) limit 1];

            responseMap.put('recordId', b.Id);

        } catch (Exception e) {
            System.debug(LoggingLevel.INFO, e.getMessage());
            message = e.getMessage();
            success = false;
        }

        LightningComponentUtility.RequestStatus requestStatus = new LightningComponentUtility.RequestStatus(success, message, responseMap);
        System.debug(LoggingLevel.INFO, requestStatus);
        return requestStatus;
    }
    
    /**************************************************************************************************************
    Author:        Abhishek
    Company:       TCS
    Description:   Updates the Sample Kit Details on the case in the Single Barrel Flow
    History
    <Date>      <Authors Name>     <Brief Description of Change>
    2/2019      Abhishek       Initial Creation

    ***************************************************************************************************************/
    @AuraEnabled
    public static LightningComponentUtility.RequestStatus updateSampleKitDetails(String caseId, String sampleKitCompany, String sampleKitStreet, String sampleKitCity, String sampleKitZip, String sampleKitState, String sampleKitPhone) {
        Boolean success = true;
        String message = null;
        Map<String, Object> responseMap = new Map<String, Object>();
        System.debug('---Data Recieved--- Case Id---'+caseId+' ---SampleKit Company---'+SampleKitCompany);

        try {
            Case sampleKitCase = [select id from Case where Id = :Id.valueOf(caseId) Limit 1];
            if(sampleKitCase.id != null){
                sampleKitCase.Sample_Kit_Attention__c = SampleKitCompany;
                sampleKitCase.Sample_Kit_Street__c = sampleKitStreet;
                sampleKitCase.Sample_Kit_City__c = sampleKitCity;
                sampleKitCase.Sample_Kit_Zip__c = sampleKitZip;
                sampleKitCase.Sample_Kit_State__c = sampleKitState;
                sampleKitCase.Sample_Kit_Phone__c = sampleKitPhone;    
            }
            update sampleKitCase;
            responseMap.put('SampleKit', sampleKitCase.Sample_Kit_Attention__c);

        } catch (Exception e) {
            System.debug(LoggingLevel.INFO, e.getMessage());
            message = e.getMessage();
            success = false;
            CreateExceptionLog.insertErrorLog('SBP_BarrelSelectionCmpCtrl', 'updateSampleKitDetails', String.valueOf(e), 'Fatal');
        }

        LightningComponentUtility.RequestStatus requestStatus = new LightningComponentUtility.RequestStatus(success, message, responseMap);
        System.debug(LoggingLevel.INFO, requestStatus);
        return requestStatus;
    }


}