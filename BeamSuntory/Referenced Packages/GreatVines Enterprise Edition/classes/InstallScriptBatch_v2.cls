/*
This file is generated and isn't the actual source code for this
managed global class.
This read-only file shows the class's global constructors,
methods, variables, and properties.
To enable code to compile, all methods return null.
*/
global class InstallScriptBatch_v2 implements Database.Batchable<SObject>, Database.Stateful {
    global InstallScriptBatch_v2(gvp.InstallScriptBatch_v2.InstallScriptBatchBase pBatchObjectToProcess) {

    }
    global InstallScriptBatch_v2(gvp.InstallScriptBatch_v2.InstallScriptBatchBase pBatchObjectToProcess, Boolean pBypassTriggerFramework) {

    }
    global void execute(Database.BatchableContext BC, List<SObject> scope) {

    }
    global void finish(Database.BatchableContext BC) {

    }
    global Database.QueryLocator start(Database.BatchableContext BC) {
        return null;
    }
global abstract class InstallScriptBatchBase {
    global InstallScriptBatchBase() {

    }
    global abstract void execute(List<SObject> param0);
    global virtual void finish() {

    }
    global virtual Database.QueryLocator query() {
        return null;
    }
}
}
