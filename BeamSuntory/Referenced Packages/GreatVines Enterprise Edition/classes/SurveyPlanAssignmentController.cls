/*
This file is generated and isn't the actual source code for this
managed global class.
This read-only file shows the class's global constructors,
methods, variables, and properties.
To enable code to compile, all methods return null.
*/
global class SurveyPlanAssignmentController implements Database.Batchable<SObject>, gvp.CsvImporterComponentInterface {
    global List<gvp__Account_Team__c> batchAcountTeams;
    global Id batchSurveyPlanId;
    global Id batchSurveyRecordTypeId;
    global SurveyPlanAssignmentController(Id pSurveyPlanId, Map<String,gvp__Account_Team__c> pAccountTeamRecords) {

    }
    global void execute(Database.BatchableContext BC, List<SObject> scope) {

    }
    global void finish(Database.BatchableContext BC) {

    }
    global List<SObject> start(Database.BatchableContext BC) {
        return null;
    }
}
