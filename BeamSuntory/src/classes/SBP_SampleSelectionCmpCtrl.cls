/**************************************************************************************************************
Author:        Craig Austgen
Company:       Slalom, LLC
Description: This class holds methods that apply to the SBP_SampleSelectionCmp.  For the Single Barrel Program
            sample kits are sent to sales reps and once they have received them they will have to make a selection
            of which samples they want for their barrel order.  These methods helps pull in all related samples 
            from the sample kit order and update their selection in salesforce

***************************************************************************************************************/

public without sharing class SBP_SampleSelectionCmpCtrl {


    /**************************************************************************************************************
    Author:        Craig Austgen
    Company:       Slalom, LLC
    Description:    Pulls in all related samples to a barrel order group record
    History
    <Date>      <Authors Name>     <Brief Description of Change>
    7/2018      Craig Austgen       Initial Creation

    ***************************************************************************************************************/
    @AuraEnabled
    public static LightningComponentUtility.RequestStatus getSamples(String recordId) {
        Boolean success = true;
        String message = null;
        Map<String, Object> responseMap = new Map<String, Object>();
        List<Sample__c> samples = new List<Sample__c>();

        try {
            Case c = [select Id, Brand__c, Barrel_Order_Group__c, Barrel_Selected__c, Product_Type__c, Type from Case where Id = : Id.valueOf(recordId) limit 1];
            Barrel__c barrel = [select Id from Barrel__c where Case__c = :c.Id limit 1];

            for (Sample__c sample : [select Id
                                     , Lot_Code__c
                                     , Barrel_Number__c
                                     , Portal_Label__c
                                     , Barreled_Date__c
                                     , Sample_Selected__c
                                     , Label__c
                                     , Name
                                     , Barrel__r.Brand__c
                                     , Barrel__r.Product_Type__c
                                     , Barrel__c from Sample__c where Sample_Kit__r.Barrel_Order_Group__c = :c.Barrel_Order_Group__c order by Label__c asc]) {
                if (sample.Barrel__r.Brand__c == c.Brand__c && sample.Barrel__r.Product_Type__c == c.Product_Type__c && !sample.Sample_Selected__c) {
                    samples.add(sample);
                }
            }
            responseMap.put('samples', samples);
            responseMap.put('numberOfSamples', samples.size());
            System.debug('case type:::'+c.Type);
            responseMap.put('caseType', c.Type);
            System.debug('sampleSelected:::'+c.Barrel_Selected__c);
            responseMap.put('sampleSelected', c.Barrel_Selected__c);
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
    Description:    When a case is created for the Single Barrel Program a default barrel record is created for the case as a placeholder
                    so that the user can select POS Customizations which look up to a barrel record.  Once a sample selection
                    is made that placeholder barrel record will be deleted and replaced with the barrel record related to the sample
                    that was selected by the sales rep.  And all POS Customizations related to the placeholder barrel
                    will be pulled onto the new barrel record.
    History
    <Date>      <Authors Name>     <Brief Description of Change>
    7/2018      Craig Austgen       Initial Creation

    ***************************************************************************************************************/
    @AuraEnabled
    public static LightningComponentUtility.RequestStatus updateBarrelWithSelectedSample(String recordId, String sampleId) {
        Boolean success = true;
        String message = null;
        Map<String, Object> responseMap = new Map<String, Object>();
        List<POS_Customization__c> posItems = new List<POS_Customization__c>();
        Boolean areSamplesLeft;

        try {
            // get placeholder barrel attached to the case
            Barrel__c barrel = [select id
                                , Brand__c
                                , Warehouse__c
                                , Barreled_Date__c
                                , Barrel_Number__c
                                , Floor__c
                                , Tier__c
                                , Story__c
                                , Case__r.Barrel_Order_Group__c
                                , Product_Type__c from Barrel__c where Case__c = :Id.valueOf(recordId) limit 1];
            Id barrelOrderGroupId = barrel.Case__r.Barrel_Order_Group__c;

            // get barrel record details from selected sample record
            Sample__c sample = [select id, Barrel__c from Sample__c where Id = :Id.valueOf(sampleId) limit 1];
            Barrel__c sampleBarrelRecord = [select id, Brand__c, Barrel_Number__c from Barrel__c where Id = :sample.Barrel__c limit 1];

            Barrel__c clonedBarrel = sampleBarrelRecord.clone(false, false, false, false);
            //insert clonedBarrel;
            
            clonedBarrel.put('Id', sample.Barrel__c);
            clonedBarrel.put('Case__c', Id.valueOf(recordId));
            clonedBarrel.put('Selection_Date__c', Date.today());
            clonedBarrel.put('RecordTypeId', SBP_Constants.fullBarrelBrandRTIdMap.get(sampleBarrelRecord.Brand__c));
            update clonedBarrel;

            // assign pos items to new barrel record
            for (POS_Customization__c posItem : [select id, Barrel__c from POS_Customization__c where Barrel__c = :barrel.Id]) {
                posItem.Barrel__c = clonedBarrel.Id;
                posItems.add(posItem);
            }

            // tie pos items to new barrel record
            if (!posItems.isEmpty()) {
                update posItems;
            }

            // update sample so that it won't be selected again
            //sample.Barrel__c = clonedBarrel.id;
            sample.Sample_Selected__c = true;
            update sample;

            Case c = new Case();
            c.put('Id', Id.valueOf(recordId));
            c.put('Barrel_Selected__c', true);
            update c;

            for (Sample__c samp : [select Id, Sample__c.Barrel__r.Product_Type__c, Barrel__r.Brand__c, Sample_Selected__c from Sample__c where Sample_Kit__r.Barrel_Order_Group__c = :barrelOrderGroupId]) {
                if (samp.Barrel__r.Brand__c == barrel.Brand__c && samp.Barrel__r.Product_Type__c == barrel.Product_Type__c && !samp.Sample_Selected__c) {
                    areSamplesLeft = true;
                    break;
                }
            }

            // remove place holder barrel
            //delete barrel;

            responseMap.put('newBarrel', clonedBarrel);
            responseMap.put('areSamplesLeft', areSamplesLeft);

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
    Description:    When the users enter the flow for the Single Barrel Program they are prompted to select
                    how many barrels they wish to purchase.  One Sample kit will be created for each barrel selected
                    They do have the option to select additional barrels once they receive the sample kits.  This method 
                    creates a new case and ties the barrel record from the sample to the new case
    History
    <Date>      <Authors Name>     <Brief Description of Change>
    7/2018      Craig Austgen       Initial Creation

    ***************************************************************************************************************/
    @AuraEnabled
    public static LightningComponentUtility.RequestStatus createNewCase(String recordId, String sampleId) {
        Boolean success = true;
        String message = null;
        Map<String, Object> responseMap = new Map<String, Object>();
        Boolean areSamplesLeft;

        try {
            Case c = [select Id
                      , Brand__c
                      , RecordTypeId
                      , Barrel_Order_Group__c
                      , Barrel_Selected__c
                      , Product_Type__c
                      , Flow_Completed__c
                      , Submitter__c
                      , AccountId
                      , Retail_Account__c
                      , ContactId
                      , Origin
                      , EntitlementId
                      , Type from Case where Id = : Id.valueOf(recordId) limit 1];

            /*Case clonedCase = c.clone(false, false, false, false);
            clonedCase.put('Barrel_Selected__c', true);
            insert clonedCase;*/

            Sample__c sample = [select id, Barrel__c from Sample__c where Id = :Id.valueOf(sampleId) limit 1];
            Barrel__c sampleBarrelRecord = [select id, Brand__c from Barrel__c where Id = :sample.Barrel__c limit 1];

            // update sample so that it won't be selected again
            sample.Sample_Selected__c = true;
            update sample;

            sampleBarrelRecord.RecordTypeId = SBP_Constants.fullBarrelBrandRTIdMap.get(c.Brand__c);
            sampleBarrelRecord.Selection_Date__c = Date.today();
            update sampleBarrelRecord;

            for (Sample__c samp : [select Id, Sample__c.Barrel__r.Product_Type__c, Barrel__r.Brand__c, Sample_Selected__c from Sample__c where Sample_Kit__r.Barrel_Order_Group__c = :c.Barrel_Order_Group__c]) {
                if (samp.Barrel__r.Brand__c == c.Brand__c && samp.Barrel__r.Product_Type__c == c.Product_Type__c && !samp.Sample_Selected__c) {
                    areSamplesLeft = true;
                    break;
                }
            }

            //responseMap.put('newCase', clonedCase);
            responseMap.put('areSamplesLeft', areSamplesLeft);

        } catch (Exception e) {
            System.debug(LoggingLevel.INFO, e.getMessage());
            message = e.getMessage();
            success = false;

        }

        LightningComponentUtility.RequestStatus requestStatus = new LightningComponentUtility.RequestStatus(success, message, responseMap);
        System.debug(LoggingLevel.INFO, requestStatus);
        return requestStatus;
    }

}