/*
This file is generated and isn't the actual source code for this
managed global class.
This read-only file shows the class's global constructors,
methods, variables, and properties.
To enable code to compile, all methods return null.
*/
@RestResource(urlMapping='/etl/*')
global class EtlController implements Database.AllowsCallouts, Database.Batchable<SObject>, System.Schedulable {
    global EtlController() {

    }
    @TestVisible
    global static Integer activateEjmJob(String pUsername, String pPassword, String pEjmUrl) {
        return null;
    }
    @HttpPost
    global static String doPost(String ejmJobUrl, String goodDataJobStatusUrl) {
        return null;
    }
    global void execute(System.SchedulableContext pSchedulableContext) {

    }
    global void execute(Database.BatchableContext context, List<gvp__Batch_Queue__c> scope) {

    }
    global void finish(Database.BatchableContext BC) {

    }
    global static System.HttpResponse getBIResponse(String pStatusUrl) {
        return null;
    }
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return null;
    }
}
