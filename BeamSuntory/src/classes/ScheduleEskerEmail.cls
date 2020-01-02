/**************************************************************************************
 Apex Class Name     : ScheduleEskerEmail
 Created Date        : 3/2019
 Function            : Esker job will be scheduled from Anonymous Block
 Details and Notes   : Auto-forward email to Esker from salesforce when cases are landed in orders queue.                        
*************************************************************************************/
global class ScheduleEskerEmail implements Database.Batchable<sObject>, Schedulable {
    
    global String query;
     
    global ScheduleEskerEmail(){
        
    }
    
    global Database.QueryLocator start(Database.BatchableContext bc){
        String ordersRTName = CSConstants.ORDERS;
        Id ordersRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get(ordersRTName).getRecordTypeId();
        Group QueueId = [select Id from Group where Type = 'Queue' AND NAME = 'Orders Queue' limit 1];

        Map<String, Date_Type__c> dateTypeMap = Date_Type__c.getAll();
        DateTime currentDateTime;
        if (Test.isRunningTest()) {
            currentDateTime = System.today().addDays(-1);
        } else {
            currentDateTime = dateTypeMap.get('EskerDate').EskerDate__c;
        }
        
        query = 'Select Id, RecordType.Name, BSI_Function__c, OwnerId, Type, Origin, Email_Sent_to_Esker__c from case where'+
        '(RecordTypeId = \'' + ordersRecordTypeId + '\' AND IsClosed = false AND OwnerId= \''+ QueueId.Id + '\' AND BSI_Function__c = \'CS\' )' +
        'AND' + '(Type=\'Standard\' OR Type = null) AND (Origin=\'Customer Portal\' OR Origin=\'Email\') AND Email_Sent_to_Esker__c != true AND CreatedDate >: currentDateTime';
 
        return Database.getQueryLocator(query);
 
    }
    
	global void execute(Database.BatchableContext bc, List<Case> scope){
       
        Set<ID> actionableCaseSet = new Set<Id>();
        List<Messaging.SingleEmailMessage> mails = new List<Messaging.SingleEmailMessage>();
        Set<Id> finalCaseSet = new Set<Id>();
 
        try{ 
        /*Getting Esker email address, systemUserId and TemplateName from CSConstants starts*/
        Integer size = 0;
        String eskerEmailAddress = CSConstants.Esker_EmailAddress;
        String systemUserId = CSConstants.SYSTEM_EMAIL_USER_ID;
        String OrdersCaseCreationforEskerTemplateName = CSConstants.Orders_Case_Creation_for_Esker;
        EmailTemplate OrdersCaseCreationforEskerTemplate = [SELECT Id FROM EmailTemplate WHERE DeveloperName = : OrdersCaseCreationforEskerTemplateName LIMIT 1];
        /*Getting Esker email address,TemplateName from CSConstants ends*/
        
            if(scope!=null && !scope.isEmpty()){
                for (Case c : scope) {
                    actionableCaseSet.add(c.Id); 
                }
            }
       
        Map<Id, ContentDocumentLink> contentDocumentToLinkMap = new Map<Id, ContentDocumentLink>();
		
        if (actionableCaseSet != null && !actionableCaseSet.isEmpty() ) {
            
            Map<Id, Case> actionableCaseMap = new Map<Id, Case>([Select Id, Email_Sent_to_Esker__c, CreatedDate from Case Where Id in :actionableCaseSet]);
        
            List<ContentDocumentLink> cdLinkList = [SELECT Id, LinkedEntityId, ContentDocumentId
                                                    FROM ContentDocumentLink WHERE LinkedEntityId IN: actionableCaseSet];
            for (ContentDocumentLink cdl : cdLinkList) {
                contentDocumentToLinkMap.put(cdl.ContentDocumentId, cdl);
            }

        
        /*Code for getting list of attachment whose fileextension is Pdf and max size per Pdf is less than 10MB Starts*/
        Map<Id, ContentVersion> cvMap = new Map<Id, ContentVersion>([SELECT Id, ContentDocumentId, ContentSize, FileExtension, FileType FROM ContentVersion WHERE
                                                                     FileExtension = 'pdf' AND ContentSize < 10000000 AND
                                                                     ContentDocumentId IN: contentDocumentToLinkMap.keySet()]);
        Map<Id, List<Id>> caseToCVMap = new Map<Id, List<Id>>();
        for (ContentVersion cv : cvMap.values()) {
            Id entityId = contentDocumentToLinkMap.get(cv.ContentDocumentId).LinkedEntityId;
            if (!caseToCVMap.containsKey(entityId)) {
                caseToCVMap.put(entityId, new List<Id> {cv.Id});
            } else {
                caseToCVMap.get(entityId).add(cv.Id);
            }
        }
        /*Code for getting list of attachment whose fileextension is Pdf and max size per Pdf is less than 10MB Ends*/
        
        /*Code for sending an email to Esker and checking the max size per email is less than 28MB starts*/
        for (Id caseId : actionableCaseMap.keySet()) {
            Messaging.SingleEmailMessage mail = Messaging.renderStoredEmailTemplate(OrdersCaseCreationforEskerTemplate.Id, CSConstants.SYSTEM_EMAIL_USER_ID, caseId);
            mail.setSaveAsActivity(false);
            
            if (caseToCVMap.containsKey(caseId)) {
                
                List<Id> attachmentList = caseToCVMap.get(caseId);
                size = 0;
                for (ID cv : attachmentList)
                    size += cvMap.get(cv).ContentSize;
                if (size > 28000000) break;
                mail.setEntityAttachments(attachmentList);
                mail.setToAddresses(new List<String> {eskerEmailAddress});
            	mail.setWhatId(caseId);
                finalCaseSet.add(caseId);
                mails.add(mail);
           	}
             
        }
        
          List<Case> caselist = new List<Case>();
          if(mails!=null && !mails.isEmpty()){  
          Messaging.SendEmailResult[] results = Messaging.sendEmail(mails);
         
          if(results!=null && !results.isEmpty()){  
              if (results[0].success) {
                  caselist = [Select id, Email_Sent_to_Esker__c from case where Id IN: finalCaseSet]; 
                  for(case c:caselist){    
                      c.Email_Sent_to_Esker__c = true;
                  }
                  update caselist;
              }
           }
          }    
        } 
          /*Code for sending an email to Esker and checking the max size per email is less than 28MB ends*/
        }catch (Exception e) {
             CreateExceptionLog.insertErrorLog('ScheduleEskerEmail', 'execute', String.valueOf(e), 'Fatal');
          } 
        }
    
    global void finish(Database.BatchableContext bc){
        CreateExceptionLog.insertErrorLog('ScheduleEskerEmail', 'finish', 'The Ekser Email job has completed', 'Info');
    }
    
    global void execute(SchedulableContext sc) {
 		Id batchInstanceId = Database.executeBatch(new ScheduleEskerEmail());        
    }

}