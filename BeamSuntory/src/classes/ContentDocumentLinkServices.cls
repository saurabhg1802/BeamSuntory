public class ContentDocumentLinkServices {

    /**************************************************************************************************************
    Author:        Craig Austgen
    Company:       Slalom, LLC
    Description:    For the Single Barrel Program a purchase order needs to be uploaded via the Customer Community
                    and once a file is updated it is assumed that the file is the purchase order and the related case
                    will be updated to reflect that
    History
    <Date>      <Authors Name>     <Brief Description of Change>
    7/2018      Craig Austgen       Initial Creation

    ***************************************************************************************************************/
    public static void updatePoUploadFlagOnCase(List<ContentDocumentLink> files, Map<Id, ContentDocumentLink> fileMap) {
        Set<Id> caseIds = new Set<Id>();
        Map<Id, Case> casesToUpdate = new Map<Id, Case>();
        Set<Id> barrelIds = new Set<Id>();
        Set<Id> fileIds = fileMap.keySet();
        List<ContentDocumentLink> contentDocLinks = new List<ContentDocumentLink>();
        Set<String> contentDocId = new Set<String>();
        Map<String, String> contentDocVsFileExt = new Map<String, String>();
        Set<String> imageFormats = new Set<String>{'jpg', 'jpeg', 'png'};

        for (ContentDocumentLink cdl : [select Id, LinkedEntity.Type, ContentDocumentId, LinkedEntityId from ContentDocumentLink where Id IN :fileIds]) {
            contentDocId.add(cdl.ContentDocumentId);
            contentDocLinks.add(cdl);
        }

        for(ContentVersion version: [select ContentDocumentId,FileExtension from ContentVersion where ContentDocumentId IN:contentDocId]) {
            contentDocVsFileExt.put(version.ContentDocumentid, version.FileExtension);
        }

        for (ContentDocumentLink cdl: contentDocLinks) {
            if (!imageFormats.contains(contentDocVsFileExt.get(cdl.ContentDocumentId))) {
                if(cdl.LinkedEntity.Type == 'Case') { 
                    caseIds.add(cdl.LinkedEntityId);
                } else if(cdl.LinkedEntity.Type == 'Barrel__c') {
                    barrelIds.add(cdl.LinkedEntityId);
                }
            }
        }

        if(!barrelIds.isEmpty()){
            for (Barrel__c barrel:[select id, Case__r.id from Barrel__c where Id IN: barrelIds]) {
                caseIds.add(barrel.Case__r.id);
            }
        }

        List<Case> cases = [select id, Purchase_Order_Uploaded__c, RecordTypeId from Case where Id IN :caseIds AND
                            (RecordTypeId IN :SBP_Constants.caseSingleBarrelRtIds)];

        for (Case c : cases) {
            c.Purchase_Order_Uploaded__c = true;
            casesToUpdate.put(c.Id, c);
        }

        if (!casesToUpdate.isEmpty()) {
            System.debug('list is not empty'+casesToUpdate);
            update casesToUpdate.values();
        }
    }
}