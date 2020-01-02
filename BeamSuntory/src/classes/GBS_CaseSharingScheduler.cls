global class GBS_CaseSharingScheduler implements Schedulable {
    
    global void execute(SchedulableContext sc) {
        List<Case> cases = [SELECT Id, RecordTypeId, Type, GBS_Center__c, Category_1__c, Submitter__c FROM Case WHERE SystemModstamp > :Datetime.now().addMinutes(-5)];    
        GBS_CaseSharingHandler.shareCaseWithGroup(cases);
    }
}