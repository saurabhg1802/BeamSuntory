trigger BonusAgreementTrigger on Bonus_Agreement__c (after insert) {

    BonusAgreementTriggerController.createGoalPlan(trigger.newMap);
}