/*
This file is generated and isn't the actual source code for this
managed global class.
This read-only file shows the class's global constructors,
methods, variables, and properties.
To enable code to compile, all methods return null.
*/
global class MegaCallActivityBatch_v3 implements Database.Batchable<SObject>, Database.Stateful, System.Schedulable {
    global Date endDate;
    global List<gvp__Activity_Summary_Report_History__c> historyBatchRecords;
    global Date startDate;
    global MegaCallActivityBatch_v3() {

    }
    global void execute(System.SchedulableContext content) {

    }
    global void execute(Database.BatchableContext BC, List<gvp__Activity_Summary_Report_History__c> pTemplates) {

    }
    global void finish(Database.BatchableContext BC) {

    }
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return null;
    }
}
