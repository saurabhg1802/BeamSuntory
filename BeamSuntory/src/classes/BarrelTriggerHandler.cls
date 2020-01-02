public class BarrelTriggerHandler {

    public static void handleBeforeInsert(List<Barrel__c> barrels) {
        BarrelServices.addBarrelNumberToBarrelRecord(barrels);
        BarrelServices.updateTimestampForBarrel(barrels, null);
    }

    public static void handleBeforeUpdate(List<Barrel__c> barrels, Map<Id, Barrel__c> oldBarrels) {
        BarrelServices.addBarrelNumberToBarrelRecord(barrels);
        BarrelServices.checkIfBarrelWasSelected(barrels, oldBarrels);
        BarrelServices.checkFinalDetailsOfBarrel(barrels, oldBarrels);
        BarrelServices.emailFinalBarrelDetails(barrels, oldBarrels);
        BarrelServices.barrelHasShipped(barrels, oldBarrels);
        BarrelServices.updateTimestampForBarrel(barrels, oldBarrels);
    }

    /*public static void handleBeforeDelete(List<Barrel__c> barrels, Map<Id, Barrel__c> oldBarrels) {
    }
    public static void handleAfterInsert(List<Barrel__c> barrels, Map<Id, Barrel__c> oldBarrels) {
    }
    public static void handleAfterUpdate(List<Barrel__c> barrels, Map<Id, Barrel__c> oldBarrels) {
    }
    */

}