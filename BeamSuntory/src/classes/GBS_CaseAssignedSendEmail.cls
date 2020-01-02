global without sharing class GBS_CaseAssignedSendEmail {
    public static void parseEmails(List<Case> cases, Map<Id, Case> oldCases) {
        List<Id> caseIds = new List<Id>();
        for (Case c : cases) {
            if ((c.OwnerId != oldCases.get(c.Id).OwnerId) && 
                (c.Status == GBS_Constants.IN_PROGRESS && oldCases.get(c.Id).Status == GBS_Constants.LOGGED) &&
                (c.RecordTypeId == GBS_Constants.CLAIMS_RT_ID || c.RecordTypeId == GBS_Constants.TAX_RT_ID ||
            	 c.RecordTypeId == GBS_Constants.OTC_BILLING_RT_ID || c.RecordTypeId == GBS_Constants.TE_RT_ID ||
                 c.RecordTypeId == GBS_Constants.PAYROLL_RT_ID || c.RecordTypeId == GBS_Constants.PTP_RT_ID ||
                 c.RecordTypeId == GBS_Constants.RTR_RT_ID || c.RecordTypeId == GBS_Constants.GBS_OUTLOOK_RT_ID)) {
             		caseIds.add(c.Id);   
            }
        }
        if (!caseIds.isEmpty()) {
            sendEmails(caseIds);
        }
    }
    
    @future
    global static void sendEmails(List<Id> caseIds) {
        
 		String gbsEmailAddress = 'gbs@beamsuntory.com';
        OrgWideEmailAddress gbsEmail = [SELECT Id FROM OrgWideEmailAddress WHERE Address = :gbsEmailAddress LIMIT 1];
        
    	EmailTemplate template = [SELECT Id, Subject, HtmlValue, DeveloperName, Body FROM EmailTemplate WHERE DeveloperName = 'Case_Assigned' LIMIT 1];
               
		List<Case> cases = [SELECT Id, Subject, Submitter__c, SuppliedEmail FROM Case WHERE Id IN :caseIds];
        System.debug(cases);

        List<Messaging.SingleEmailMessage> emails = new List<Messaging.SingleEmailMessage>();
        for (Case c : cases) {
            Messaging.SingleEmailMessage singleMail = Messaging.renderStoredEmailTemplate(template.Id, c.Submitter__c, c.Id);
            singleMail.setOrgWideEmailAddressId(gbsEmail.Id);
            singleMail.setToAddresses(new String[]{c.SuppliedEmail});
            singleMail.setTargetObjectId(c.Submitter__c);
            singleMail.setTemplateId(template.Id);
            singleMail.setWhatId(c.Id);
            singleMail.setSaveAsActivity(false);
            singleMail.setReplyTo(gbsEmailAddress);
            emails.add(singleMail);
        }
        List<Messaging.SendEmailResult> emailResults = Messaging.sendEmail(emails);
    }
}