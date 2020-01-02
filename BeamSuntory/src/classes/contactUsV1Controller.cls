public class contactUsV1Controller {
    private static final String base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    private static List<PicklistValue> issuePicklist;
    private static List<PicklistValue> countryPicklist;
    private static List<PicklistValue> productSizePicklist;
    private static List<Schema.PicklistEntry> brandEntries;
    private static List<PicklistValue> productEntries;
    private static String secretKey = '6Ld0rsMUAAAAAPhHh6va2Yh1X_9nWneG-T8ZfVtl';
    
    @AuraEnabled
    public static Map<String, Object> getPickListValues(String brand){
        Map<String, Schema.SObjectField> caseFieldMap = Schema.getGlobalDescribe().get('case').getDescribe().fields.getMap();
        issuePicklist = wrapPicklistEntries(caseFieldMap.get('Issue__c').getDescribe().getPicklistValues());
        countryPicklist = wrapPicklistEntries(caseFieldMap.get('Country_of_Interest__c').getDescribe().getPicklistValues());
        productSizePicklist = wrapPicklistEntries(caseFieldMap.get('Product_Size__c').getDescribe().getPicklistValues());
        brandEntries = caseFieldMap.get('Brand__c').getDescribe().getPicklistValues();
        productEntries = wrapPicklistEntries(caseFieldMap.get('Product_Type__c').getDescribe().getPicklistValues());
        Map<String,List<String>> pickListMap = new Map<String,List<String>>();
        Map<String, Object> value = new Map<String, Object>();
        
        List<PicklistValue> brandProducts = new List<PicklistValue>();
        List<String> controllingValues = new List<String>();
        for (Schema.PicklistEntry ple : brandEntries) {
            pickListMap.put(ple.getLabel(), new List<String>());
            controllingValues.add(ple.getLabel());
        }
        
        for (PicklistValue plew : productEntries) {
            String validForBits = base64ToBits(plew.validFor);
            for (Integer i = 0; i < validForBits.length(); i++) {
                String bit = validForBits.mid(i, 1);
                if (bit == '1') {
                    pickListMap.get(controllingValues.get(i)).add(plew.label);
                    if(brandEntries.get(i).getLabel() == brand)
                    	brandProducts.add(plew);
                }
            }
        }
        try{
            Brand_Lot_Code_Setting__mdt mdt = [select Static_Resource_Name__c,Brand__c from Brand_Lot_Code_Setting__mdt Where Brand__c =: brand LIMIT 1];
            value.put('lotCodeResource', mdt.Static_Resource_Name__c);
        } catch(QueryException e) {
            
        }
       // value.put(LotCodeLocatorCmpCtrl.getLotCodeImages());
        //value.put('lotCodeResource', .Static_Resource_Name__c);
        value.put('Issue__c', issuePicklist);
        value.put('Country_of_Interest__c', countryPicklist);
        value.put('Product_Size__c', productSizePicklist);
        value.put(brand, brandProducts);
        value.put('brandToProduct', pickListMap);
        
        return value;
    }
    
    @AuraEnabled
    public static Map<String, Object> createCase(Case caseObj, String fileName, String base64Data, String contentType, String brand, String reCaptchaResponse){
        Map<String, Object> responseMap;
        
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
            if(caseObj != null){
                newCase.RecordTypeId = [Select Id From RecordType where sobjecttype = 'Case' and Name = 'Quality Claim'].Id;
                newCase.Brand__c = brand;
                insert newCase;
            }
            
            if(base64Data != null){
                Attachment attachment = new Attachment();
                attachment.Name = fileName;
                attachment.Body = EncodingUtil.base64Decode(base64Data);
                attachment.ContentType = contentType;
                attachment.ParentId = newCase.Id;
                insert attachment;
            } 
            responseMap.put('caseId', newCase.Id);
        } catch(Exception e) {
            responseMap.put('message', e.getMessage());
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