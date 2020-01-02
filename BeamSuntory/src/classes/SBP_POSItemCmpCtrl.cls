public without sharing class SBP_POSItemCmpCtrl {
    public static Set<String> posItemSpecificStates = new Set<String> {'New York', 'Oregon', 'NY', 'OR'};

    /**************************************************************************************************************
    Author:        Craig Austgen
    Company:       Slalom, LLC
    Description:
    History
    <Date>      <Authors Name>     <Brief Description of Change>
    7/2018      Craig Austgen       Initial Creation

    ***************************************************************************************************************/
    @AuraEnabled
    public static LightningComponentUtility.RequestStatus getSingleBarrelCustomMetaDataSettings(String state, String brand, String premiseType) {
        Boolean success = true;
        String message = null;
        Map<String, Object> responseMap = new Map<String, Object>();

        try {
            Map<String, List<SBP_POSItemCmpCtrl.POSItem>> brandToPOSItemMap = buildPOSItemMap(state, brand, premiseType);
            responseMap.put('brandToPOSItemMap', brandToPOSItemMap);
        } catch (Exception e) {
            System.debug(LoggingLevel.INFO, e.getMessage());
            message = e.getMessage();
            success = false;
        }

        LightningComponentUtility.RequestStatus requestStatus = new LightningComponentUtility.RequestStatus(success, message, responseMap);
        System.debug(LoggingLevel.INFO, requestStatus);
        return requestStatus;
    }

    public class POSItem {
        @AuraEnabled public String staticResourceName;
        @AuraEnabled public String brand;
        @AuraEnabled public String premiseType;
        @AuraEnabled public String state;
        @AuraEnabled public String helpText;
        @AuraEnabled public String itemText;
        @AuraEnabled public String posId;
        @AuraEnabled public String masterLabel;
        @AuraEnabled public String options;
        @AuraEnabled public Boolean hasInsert;
        @AuraEnabled public Boolean showTextOptions;
        @AuraEnabled public String defaultTextValue;

        public POSItem() {

        }
    }

    /**************************************************************************************************************
    Author:        Craig Austgen
    Company:       Slalom, LLC
    Description:
    History
    <Date>      <Authors Name>     <Brief Description of Change>
    7/2018      Craig Austgen       Initial Creation

    ***************************************************************************************************************/
    public static Map<String, List<SBP_POSItemCmpCtrl.POSItem>> buildPOSItemMap(String state, String brand, String premiseType) {
        Map<String, List<SBP_POSItemCmpCtrl.POSItem>> brandToPOSItemMap = new Map<String, List<SBP_POSItemCmpCtrl.POSItem>>();

        for (POS_State_Setting__mdt cm : getPOSCustomMetadata(state, brand, premiseType)) {
            SBP_POSItemCmpCtrl.POSItem posItem = new SBP_POSItemCmpCtrl.POSItem();
            posItem.staticResourceName = cm.POS_Static_Resource__r.Static_Resource_Name__c;
            posItem.brand = cm.POS_Static_Resource__r.Brand__c;
            posItem.premiseType = cm.Premise_Type__c;
            posItem.state = cm.State__c;
            posItem.helpText = cm.POS_Static_Resource__r.POS_Item__r.Help_Text__c;
            posItem.masterLabel = cm.POS_Static_Resource__r.DeveloperName;
            posItem.options = cm.Options__c;
            posItem.posId = String.valueOf(cm.Id);
            posItem.showTextOptions = cm.Show_Text_Options__c;
            posItem.defaultTextValue = cm.Default_Text_Value__c;
            //posItem.hasInsert = cm.POS_Static_Resource__r.POS_Item__r.hasInsert__c;

            // if there is not overriding text that needs to be displayed based on the brand then pull in the generic text
            if (String.isBlank(cm.POS_Static_Resource__r.Item_Text__c)) {
                posItem.itemText = cm.POS_Static_Resource__r.POS_Item__r.MasterLabel;
            } else {
                posItem.itemText = cm.POS_Static_Resource__r.Item_Text__c;
            }

            // add item to map of brand to pos items
            if (brandToPOSItemMap.containsKey(cm.POS_Static_Resource__r.Brand__c)) {
                brandToPOSItemMap.get(cm.POS_Static_Resource__r.Brand__c).add(posItem);
            } else {
                brandToPOSItemMap.put(cm.POS_Static_Resource__r.Brand__c, new List<SBP_POSItemCmpCtrl.POSItem> {posItem});
            }
        }
        return brandToPOSItemMap;
    }

    /**************************************************************************************************************
    Author:        Craig Austgen
    Company:       Slalom, LLC
    Description:
    History
    <Date>      <Authors Name>     <Brief Description of Change>
    7/2018      Craig Austgen       Initial Creation

    ***************************************************************************************************************/
    // appears to be an issue when querying based on a related field that is of type picklist
    // below is the work around
    public static List<POS_State_Setting__mdt> getPOSCustomMetadata(String state, String brand, String premiseType) {
        List<POS_State_Setting__mdt> stateSettings = new List<POS_State_Setting__mdt>();
        for (POS_State_Setting__mdt cm : [select Premise_Type__c
                                          , State__c
                                          , Default_Text_Value__c
                                          , Show_Text_Options__c
                                          , Options__c
                                          , MasterLabel
                                          , POS_Static_Resource__r.Brand__c
                                          , POS_Static_Resource__r.MasterLabel
                                          , POS_Static_Resource__r.DeveloperName
                                          , POS_Static_Resource__r.Item_Text__c
                                          , POS_Static_Resource__r.Static_Resource_Name__c
                                          , POS_Static_Resource__r.POS_Item__r.Help_Text__c
                                          , POS_Static_Resource__r.POS_Item__r.Options__c
                                          , POS_Static_Resource__r.POS_Item__r.hasInsert__c
                                          , POS_Static_Resource__r.POS_Item__r.MasterLabel from POS_State_Setting__mdt where Premise_Type__c = :premiseType]) {
            if (cm.POS_Static_Resource__r.Brand__c == brand) {
                if (state == cm.State__c || !posItemSpecificStates.contains(state)) {
                    stateSettings.add(cm);
                }
            }
        }

        return stateSettings;
    }


    /**************************************************************************************************************
    Author:        Craig Austgen
    Company:       Slalom, LLC
    Description:
    History
    <Date>      <Authors Name>     <Brief Description of Change>
    7/2018      Craig Austgen       Initial Creation

    ***************************************************************************************************************/
    @AuraEnabled
    public static LightningComponentUtility.RequestStatus insertPOSItems(String posItems, String recordId) {
        Boolean success = true;
        String message = null;
        Map<String, Object> responseMap = new Map<String, Object>();
        POS_Customization__c bottleText = new POS_Customization__c();
        List<POS_Customization__c> posCustomizations = new List<POS_Customization__c>();
        String accountName;

        System.debug('posItems >> ' + posItems);

        List<POS_Customization__c> posItemList = (List<POS_Customization__c>)System.JSON.deserialize(posItems, List<POS_Customization__c>.Class);

        try {
            // insert pos item
            String objectType = Id.valueOf(recordId).getSObjectType().getDescribe().getName();
            if (objectType == 'Barrel__c') {
                for (POS_Customization__c item : [select id, Type__c, Barrel__r.Case__r.Retail_Account__r.Name, Insert_Text__c from POS_Customization__c where Barrel__c = :Id.valueOf(recordId) AND Type__c = 'Bottle Plate Text']) {
                    bottleText = item;
                    accountName = item.Barrel__r.Case__r.Retail_Account__r.Name;
                    break;
                }
            } else if (objectType == 'Case') {
                Case c = [select id, Type, (Select id from Barrels__r) from Case where Id = :Id.valueOf(recordId)];
                if (c.Type != 'Split Barrel') {

                    Id barrelId = c.Barrels__r[0].Id;
                    objectType = 'Barrel__c';
                    recordId = barrelId;
                    for (POS_Customization__c item : [select id, Type__c, Barrel__r.Case__r.Retail_Account__r.Name, Insert_Text__c from POS_Customization__c where Barrel__c = :barrelId AND Type__c = 'Bottle Plate Text']) {
                        bottleText = item;
                        accountName = item.Barrel__r.Case__r.Retail_Account__r.Name;
                        break;
                    }
                } else {
                    for (POS_Customization__c item : [select id, Type__c, Case__r.Retail_Account__r.Name, Insert_Text__c from POS_Customization__c where Case__c = :Id.valueOf(recordId) AND Type__c = 'Bottle Plate Text']) {
                        bottleText = item;
                        accountName = item.Case__r.Retail_Account__r.Name;
                        break;
                    }
                }
            }

            for (POS_Customization__c item : posItemList) {
                if (objectType == 'Barrel__c') {
                    item.Barrel__c = Id.valueOf(recordId);
                    item.RecordTypeId = SBP_Constants.POS_FULL_BARREL_RT_ID;
                } else if (objectType == 'Case') {
                    item.Case__c = Id.valueOf(recordId);
                    item.RecordTypeId = SBP_Constants.POS_SPLIT_BARREL_RT_ID;
                }
            }

            insert posItemList;

            responseMap.put('posItems', posItemList);
            responseMap.put('numberOfPosItems', posItemList.size());
            responseMap.put('values', posItems);

        } catch (Exception e) {
            System.debug(LoggingLevel.INFO, e.getMessage());
            message = e.getMessage() + ' ' + e.getStackTraceString();
            success = false;
        }

        LightningComponentUtility.RequestStatus requestStatus = new LightningComponentUtility.RequestStatus(success, message, responseMap);
        System.debug(LoggingLevel.INFO, requestStatus);
        return requestStatus;
    }


    /**************************************************************************************************************
    Author:        Craig Austgen
    Company:       Slalom, LLC
    Description:
    History
    <Date>      <Authors Name>     <Brief Description of Change>
    7/2018      Craig Austgen       Initial Creation

    ***************************************************************************************************************/
    @AuraEnabled
    public static LightningComponentUtility.RequestStatus getDistributorRecord(String recordId) {
        Boolean success = true;
        String message = null;
        Map<String, Object> responseMap = new Map<String, Object>();
        Id accountId;


        try {
            String objectType = Id.valueOf(recordId).getSObjectType().getDescribe().getName();

            if (objectType == 'Barrel__c') {
                Barrel__c barrel = [select Id, Case__r.AccountId from Barrel__c where Id = :Id.valueOf(recordId) limit 1];
                accountId = barrel.Case__r.AccountId;
            } else if (objectType == 'Case') {
                Case c = [select Id, AccountId from Case where Id = :Id.valueOf(recordId) limit 1];
                accountId = c.AccountId;
            }
            Account acct = [select Id, Attention__c, Name, Phone, BillingCity, BillingStreet, BillingState, BillingCountry, BillingPostalCode from Account where Id = :accountId limit 1];

            responseMap.put('account', acct);
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
    Description:
    History
    <Date>      <Authors Name>     <Brief Description of Change>
    7/2018      Craig Austgen       Initial Creation

    ***************************************************************************************************************/
    @AuraEnabled
    public static LightningComponentUtility.RequestStatus updateStepsAsCompleted(String recordId, Boolean posItemsSelected, Boolean bottlePlateTextComplete) {
        Boolean success = true;
        String message = null;
        Map<String, Object> responseMap = new Map<String, Object>();

        try {
            String objectType = Id.valueOf(recordId).getSObjectType().getDescribe().getName();
            Case c = new Case();

            if (objectType == 'Barrel__c') {
                Barrel__c barrel = [select Id, Case__c, Case__r.POS_Items_Selected__c, Case__r.Bottle_Text_Entered__c from Barrel__c where Id = :Id.valueOf(recordId) limit 1];
                c.put('Id', Id.valueOf(barrel.Case__c));
                c.put('POS_Items_Selected__c', barrel.Case__r.POS_Items_Selected__c);
                c.put('Bottle_Text_Entered__c', barrel.Case__r.Bottle_Text_Entered__c);
            } else if (objectType == 'Case') {
                Case cc = [select Id, POS_Items_Selected__c, Bottle_Text_Entered__c from Case where Id = :Id.valueOf(recordId)];
                c.put('Id', Id.valueOf(recordId));
                c.put('POS_Items_Selected__c', cc.POS_Items_Selected__c);
                c.put('Bottle_Text_Entered__c', cc.Bottle_Text_Entered__c);
            }

            if (posItemsSelected) {
                c.POS_Items_Selected__c = posItemsSelected;
                c.POS_Items_Selected_Date__c = Datetime.now();
            }

            if (bottlePlateTextComplete) {
                c.Bottle_Text_Entered__c = bottlePlateTextComplete;
                c.Bottle_Text_Entered_Date__c = Datetime.now();
            }

            update c;
            responseMap.put('updatedRecord', c);

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
    Description:
    History
    <Date>      <Authors Name>     <Brief Description of Change>
    7/2018      Craig Austgen       Initial Creation

    ***************************************************************************************************************/
    @AuraEnabled
    public static LightningComponentUtility.RequestStatus getBottleLabelImages(String state) {
        Boolean success = true;
        String message = null;
        Map<String, Object> responseMap = new Map<String, Object>();

        try {
            Map<String, SBP_POSItemCmpCtrl.BrandBottleLabel> standardBottleLabelMap = new Map<String, SBP_POSItemCmpCtrl.BrandBottleLabel> {
                'Knob Creek'                => new BrandBottleLabel('Knob Creek', 'knobCreekBottleImage', 'KnobCreekBourbonLabel'), // Modified for SR_127060 - Final Update - Knob Creek Labels
                'Knob Creek Rye'            => new BrandBottleLabel('Knob Creek Rye', 'KnobCreekRyeBottleImage', 'KnobCreekRyeBottleLabel'), // Modified for SR_127060 - Final Update - Knob Creek Labels
                'Makers Mark'               => new BrandBottleLabel( 'Makers Mark', 'makersMarkBottle', 'makersMarkBottleLabel'),
                'El Tesoro'                 => new BrandBottleLabel( 'El Tesoro', 'elTesoroBottleGlorifier', 'elTesoroBottleLabel')
            };

            Map<String, SBP_POSItemCmpCtrl.BrandBottleLabel> newYorkBottleLabelMap = new Map<String, SBP_POSItemCmpCtrl.BrandBottleLabel> {
                'Knob Creek'                => new BrandBottleLabel('Knob Creek', 'knobCreekBottleNeckerChain', ''),
                'Knob Creek Rye'            => new BrandBottleLabel('Knob Creek Rye', 'knobCreekBottleNeckerChain', ''),
                'Makers Mark'               => new BrandBottleLabel( 'Makers Mark', 'makersMarkBottle', 'makersMarkNewYorkBottleLabel')
            };

            if (state == 'New York' || state.equals('NY') || state == 'Oregon' || state.equals('OR')) {
                responseMap.put('bottleLabelMap', newYorkBottleLabelMap);
            } else {
                responseMap.put('bottleLabelMap', standardBottleLabelMap);
            }


        } catch (Exception e) {
            System.debug(LoggingLevel.INFO, e.getMessage());
            message = e.getMessage();
            success = false;
        }

        LightningComponentUtility.RequestStatus requestStatus = new LightningComponentUtility.RequestStatus(success, message, responseMap);
        System.debug(LoggingLevel.INFO, requestStatus);
        return requestStatus;
    }

    public class BrandBottleLabel {
        @AuraEnabled public String brandLabel;
        @AuraEnabled public String bottleImageName;
        @AuraEnabled public String bottleLabel;

        public BrandBottleLabel(String brandLabel, String bottleImageName,  String bottleLabel) {
            this.brandLabel = brandLabel;
            this.bottleImageName = bottleImageName;
            this.bottleLabel = bottleLabel;
        }
    }

    /**************************************************************************************************************
    Author:        Craig Austgen
    Company:       Slalom, LLC
    Description:
    History
    <Date>      <Authors Name>     <Brief Description of Change>
    7/2018      Craig Austgen       Initial Creation

    ***************************************************************************************************************/
    @AuraEnabled
    public static LightningComponentUtility.RequestStatus getRecordDetails(String recordId) {
        Boolean success = true;
        String message = null;
        Map<String, Object> responseMap = new Map<String, Object>();
        String state;
        String premiseType;

        try {
            // insert pos item
            String objectType = Id.valueOf(recordId).getSObjectType().getDescribe().getName();

            Account acct = [select id from Account where Name = 'Single Barrel International Account'];

            if (objectType == 'Barrel__c') {
                Barrel__c barrel = [select Id, Case__r.Account.BillingState, Case__r.Retail_Account__r.PremiseType__c, Case__r.Retail_Account_Name__c, Case__r.Account_Missing__c, Case__r.Premise__c  from Barrel__c where Id = :Id.valueOf(recordId) limit 1];
                if (barrel.Case__r.Account_Missing__c) {
                    state = '';
                    premiseType = barrel.Case__r.Premise__c;
                } else {
                    state = barrel.Case__r.Account.BillingState;
                    premiseType = barrel.Case__r.Retail_Account__r.PremiseType__c;
                }

            } else if (objectType == 'Case') {
                Case c = [select Id, Account.BillingState, Premise__c, Type, Account_Missing__c, Retail_Account__r.PremiseType__c from Case where Id = :Id.valueOf(recordId) limit 1];
                if (c.Type != 'Split Barrel') {
                    if (c.Account_Missing__c) {
                        state = '';
                        premiseType = c.Premise__c;
                    } else {
                        state = c.Account.BillingState;
                        premiseType = c.Retail_Account__r.PremiseType__c;
                    }
                } else {
                    Case sb = [select Id
                               , Account.BillingState
                               , Premise__c
                               , Account_Missing__c
                               , Barrel__r.Case__r.Account.BillingState
                               , Barrel__r.Case__r.Retail_Account__r.PremiseType__c
                               , Barrel__r.Case__r.Premise__c
                               , Barrel__r.Case__r.Retail_Account_Name__c
                               , Barrel__r.Case__r.Account_Missing__c
                               , Retail_Account__r.PremiseType__c from Case where Id = :Id.valueOf(recordId) limit 1];
                    if (sb.Barrel__r.Case__r.Account_Missing__c) {
                        state = '';
                        premiseType = sb.Barrel__r.Case__r.Premise__c;
                    } else {
                        state = sb.Barrel__r.Case__r.Account.BillingState;
                        premiseType = sb.Barrel__r.Case__r.Retail_Account__r.PremiseType__c;
                    }

                }

                // for the data migration if the premise type on the case exists then use that value
                // the retail account will have been defaulted from the migration and won't 
                // reflect the correct premise type which is why it must be pulled from this field
                if (String.isNotBlank(c.Premise__c)) {
                    premiseType = c.Premise__c;
                }

            }
            responseMap.put('state', state);
            responseMap.put('premiseType', premiseType);

        } catch (Exception e) {
            System.debug(LoggingLevel.INFO, e.getMessage());
            message = e.getMessage();
            message = message + recordId;
            success = false;
        }

        LightningComponentUtility.RequestStatus requestStatus = new LightningComponentUtility.RequestStatus(success, message, responseMap);
        System.debug(LoggingLevel.INFO, requestStatus);
        return requestStatus;
    }

    /**************************************************************************************************************
    Author:        Craig Austgen
    Company:       Slalom, LLC
    Description:
    History
    <Date>      <Authors Name>     <Brief Description of Change>
    7/2018      Craig Austgen       Initial Creation

    ***************************************************************************************************************/
    @AuraEnabled
    public static LightningComponentUtility.RequestStatus getPOSRecords(String recordId) {
        Boolean success = true;
        String message = null;
        Map<String, Object> responseMap = new Map<String, Object>();
        String state;
        String premiseType;
        List<POS_Customization__c> posItems = new List<POS_Customization__c>();

        try {
            // insert pos item
            String objectType = Id.valueOf(recordId).getSObjectType().getDescribe().getName();
            if (objectType == 'Case') {
                Case c = [select Id, Type, Barrel__c from Case where Id = :Id.valueOf(recordId) limit 1];

                if (c.Type == 'Split Barrel') {
                    posItems = [select id, Type__c, Insert_Text__c, Attention__c, Company__c, Street__c, City__c, Zip__c, State__c, Phone__c from POS_Customization__c where Case__c = :Id.valueOf(recordId)];
                } else {
                    posItems = [select id, Type__c, Insert_Text__c, Attention__c, Company__c, Street__c, City__c, Zip__c, State__c, Phone__c from POS_Customization__c where Barrel__r.Case__c = :Id.valueOf(recordId)];
                }
            }
            responseMap.put('posItems', posItems);
            responseMap.put('numOfPOSItems', posItems.size());

        } catch (Exception e) {
            System.debug(LoggingLevel.INFO, e.getMessage());
            message = e.getMessage();
            message = message + recordId;
            success = false;
        }

        LightningComponentUtility.RequestStatus requestStatus = new LightningComponentUtility.RequestStatus(success, message, responseMap);
        System.debug(LoggingLevel.INFO, requestStatus);
        return requestStatus;
    }




}