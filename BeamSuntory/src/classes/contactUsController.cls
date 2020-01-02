public without sharing class contactUsController {
    
    private static final String base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    private static List<PicklistValue> issuePicklist;
    private static List<PicklistValue> samplePicklist;
    private static List<PicklistValue> countryPicklist;
    private static List<PicklistValue> productSizePicklist;
    private static List<Schema.PicklistEntry> brandEntries;
    private static List<PicklistValue> productEntries;
    private static String secretKey = '6Ld0rsMUAAAAAPhHh6va2Yh1X_9nWneG-T8ZfVtl';
    
    @AuraEnabled
    public static Map<String, Object> getPickListValues(String brand){
        Map<String, Schema.SObjectField> caseFieldMap = Schema.getGlobalDescribe().get('case').getDescribe().fields.getMap();
        Map<String, Object> value = new Map<String, Object>();
        Map<String, List<Object>> categoryHelpMap = new Map<String, List<Object>>();
        
        brandEntries = caseFieldMap.get('Brand__c').getDescribe().getPicklistValues();
        issuePicklist = wrapPicklistEntries(caseFieldMap.get('Issue__c').getDescribe().getPicklistValues());
        countryPicklist = wrapPicklistEntries(caseFieldMap.get('Country_of_Interest__c').getDescribe().getPicklistValues());
        productSizePicklist = wrapPicklistEntries(caseFieldMap.get('Product_Size__c').getDescribe().getPicklistValues());
        samplePicklist = wrapPicklistEntries(caseFieldMap.get('Do_you_still_have_the_product__c').getDescribe().getPicklistValues());
        
        value.put('Issue__c', issuePicklist);
        value.put('Country_of_Interest__c', countryPicklist);
        value.put('Product_Size__c', productSizePicklist);
        value.put('Do_you_still_have_the_product__c', samplePicklist);
        
        try{
            List<Brand_Category_Help_Mapping__mdt> brandCategoryHelpList =  [SELECT 
                                                                             AdditionalInformation__c, 
                                                                             How_Can_We_Help_You__c 
                                                                             FROM 
                                                                             Brand_Category_Help_Mapping__mdt
                                                                             Where 
                                                                             Brand__c =: brand];
            for(Brand_Category_Help_Mapping__mdt categoryHelp : brandCategoryHelpList){
                //   categoryHelp.add(categoryHelpMap.Category__c + '-' + categoryHelpMap.HowCanWeHelpYou__c);
                if(categoryHelpMap.containsKey(categoryHelp.How_Can_We_Help_You__c)) {
                    List<Object> helps = categoryHelpMap.get(categoryHelp.How_Can_We_Help_You__c);
                    helps.add(categoryHelp.AdditionalInformation__c);
                    categoryHelpMap.put(categoryHelp.How_Can_We_Help_You__c, helps);
                } else {
                    categoryHelpMap.put(categoryHelp.How_Can_We_Help_You__c, new List<Object> {categoryHelp.AdditionalInformation__c});
                } 
            }
            Brand_Lot_Code_Setting__mdt mdt = [select Static_Resource_Name__c,Brand__c from Brand_Lot_Code_Setting__mdt Where Brand__c =: brand LIMIT 1];
            system.debug('<<<<mdt>>>>>' + mdt);
            value.put('lotCodeResource', mdt.Static_Resource_Name__c);
        } catch(QueryException e) {
            value.put('lotCodeResource', 'jimBeamLotCode');
        }
        
        value.put('BrandCategoryHelpMapping__c', new List<Object>{categoryHelpMap});
        
        /*Start of Below code is for getting the WebSite Default Url added into the custom metadata according to the brand*/
        List<BrandWebsiteUrl__mdt> brandWebUrlList =  [SELECT 
                                                       Brand_Name__c, Website_Url__c 
                                                       FROM BrandWebsiteUrl__mdt
                                                       Where Brand_Name__c =: brand];
        value.put('weburl', 'https://www.beamsuntory.com/'); 
        if(brandWebUrlList.size() > 0) {
            value.put('weburl', brandWebUrlList[0].Website_Url__c); 
        }
        
        /* End of above code is for getting the WebSite Default Url added into the custom metadata according to the brand*/
        
        if(String.isNotBlank(brand) && brand == 'Corporate'){
            value.put(brand, wrapPicklistEntries(brandEntries));
            return value;
        } 
        
        productEntries = wrapPicklistEntries(caseFieldMap.get('Product_Type__c').getDescribe().getPicklistValues());
        List<PicklistValue> brandProducts = new List<PicklistValue>();
        
        for (PicklistValue plew : productEntries) {
            String validForBits = base64ToBits(plew.validFor);
            for (Integer i = 0; i < validForBits.length(); i++) {
                String bit = validForBits.mid(i, 1);
                if (bit == '1' && brandEntries.get(i).getLabel() == brand) {
                    brandProducts.add(plew);
                    break;
                }
            }
        }
        
        value.put(brand, brandProducts);
        
        return value;
    }
    
    @AuraEnabled
    public static Map<String, Object> createCase(Case caseObj, String caseId, Boolean isComplaint, String reCaptchaResponse, Account accountObj, String accountId){
        system.debug('<caseId>' + caseId);
        system.debug('<isComplaint>' + isComplaint);
        system.debug('<reCaptcha>' + reCaptchaResponse);
        Map<String, Object> responseMap;
        if(String.isBlank(reCaptchaResponse)){
            return null;
        }
        
        
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://www.google.com/recaptcha/api/siteverify');
        req.setMethod('POST');
        req.setBody('secret='+ secretKey + '&response='  + reCaptchaResponse);
        
        Http httpProvider = new Http();
        
        
        HttpResponse response = httpProvider.send(req); 
        if(response.getBody() != null){
            responseMap = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            if(responseMap.get('success') == false){
                return responseMap;
            }
        } 
        
        responseMap = new Map<String, Object>();
        Case newCase = caseObj.clone(false, false, false, false);
        try{
            system.debug('<<<<<NEW CASE>>>>>' + newCase);
            
            if(String.isBlank(caseId)){
                if(isComplaint){
                    newCase.RecordTypeId = CSConstants.DUMMY_CASE_RT_ID;
                }
                else {
                    newCase.RecordTypeId = CSConstants.CONSUMER_INQUIRY_RT_ID;
                    newCase.SuppliedEmail = accountObj.PersonEmail;
                    Database.DMLOptions dmo = new Database.DMLOptions();
                    dmo.EmailHeader.triggerAutoResponseEmail= true;
                    newCase.setOptions(dmo);
                }
            } else {
                newCase.Id = caseId;
            } 
            
            if(String.isNotBlank(accountId)){
                accountObj.Id = accountId;
            } 
            
            if(newCase != null) {
                upsert accountObj;
                system.debug('accountObj' + accountObj);
                List<Account> lstAccInfo = [Select PersonContactId From Account Where Id = :accountObj.Id];
                system.debug('accountObj.PersonContactId'+lstAccInfo[0].PersonContactId);
                if(lstAccInfo.size() > 0){
                    newCase.ContactId = lstAccInfo[0].PersonContactId;    
                }
                upsert newCase;
            }
            responseMap.put('caseId', newCase.Id);
            responseMap.put('accountId', accountObj.Id);
        } catch(Exception e) {
            responseMap.put('error', e.getMessage());
        }
        return responseMap;
    }
    
    @AuraEnabled
    public static Map<String, Object> updateCase(Case caseObj, String caseId, Account accountObj, String accountId) {
        Map<String, Object> responseMap = new Map<String, Object>();
        try { 
            
            if(String.isNotBlank(caseId)){
                caseObj.Id = caseId;
                List<Case> caseLstInfo = [Select Subject, CaseNumber  from Case Where Id =: caseId];
                if(caseLstInfo.size() > 0){
                    caseObj.Subject = caseLstInfo[0].CaseNumber + ' : '  + 'Quality Claim';    
                }
            }
            caseObj.RecordTypeId = CSConstants.QC_RT_ID;
            caseObj.SuppliedEmail = accountObj.PersonEmail;
            Database.DMLOptions dmo = new Database.DMLOptions();
            dmo.assignmentRuleHeader.useDefaultRule = true;
            caseObj.setOptions(dmo);
            system.debug('<NEWCASE>' + caseObj);
            accountObj.Id = accountId;
            update accountObj;
            upsert caseObj;
            responseMap.put('success', true);
            responseMap.put('caseId', caseObj.Id);
        } catch(Exception e){
            responseMap.put('error', e.getMessage());
        }
        return responseMap;
    }
    
    private static String decimalToBinary(Integer val) {
        String bits = '';
        while (val > 0) {
            Integer remainder = Math.mod(val, 2);
            val = Integer.valueOf(Math.floor(val / 2));
            bits = String.valueOf(remainder) + bits;
        }
        return bits;
    }
    
    private static String base64ToBits(String validFor) {
        if (String.isEmpty(validFor)) return '';
        
        String validForBits = '';
        
        for (Integer i = 0; i < validFor.length(); i++) {
            String thisChar = validFor.mid(i, 1);
            Integer val = base64Chars.indexOf(thisChar);
            String bits = decimalToBinary(val).leftPad(6, '0');
            validForBits += bits;
        }
        
        return validForBits;
    }
    
    private static List<PicklistValue> wrapPicklistEntries(List<Schema.PicklistEntry> PLEs) {
        return (List<PicklistValue>)
            JSON.deserialize(JSON.serialize(PLEs), List<PicklistValue>.class);
    }
    
    public class PicklistValue {
        @AuraEnabled public String value;
        @AuraEnabled public String active;
        @AuraEnabled public String label;
        public String validFor;
    }
    
}