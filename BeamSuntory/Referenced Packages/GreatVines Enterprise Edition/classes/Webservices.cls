/*
This file is generated and isn't the actual source code for this
managed global class.
This read-only file shows the class's global constructors,
methods, variables, and properties.
To enable code to compile, all methods return null.
*/
global class Webservices {
    webService static gvp.Webservices.process_order_responce ProcessOrder(String ord) {
        return null;
    }
    webService static void approve_order(String Ord) {

    }
    webService static void changeOrderType(String ord, String orderType) {

    }
    webService static List<gvp__Sales_Order_Item__c> prepareRecentItemsOld(String Idss) {
        return null;
    }
    webService static List<gvp__Sales_Order_Item__c> prepareRecentItems(String idss) {
        return null;
    }
    webService static gvp.Webservices.process_SelectOrderItemsMain selectOrderItems(String ord, String orderType) {
        return null;
    }
    webService static String updateOrder(String ord) {
        return null;
    }
    webService static Boolean updateSalesOrderItemCount(String pOrderId) {
        return null;
    }
global class process_SelectOrderItems {
    webService Boolean isAvialable {
        get;
        set;
    }
    webService Boolean isBrokenCharge {
        get;
        set;
    }
    webService String lastOrdered {
        get;
        set;
    }
    webService gvp__Sales_Order_Item__c salesOrderItem {
        get;
        set;
    }
    global process_SelectOrderItems() {

    }
}
global class process_SelectOrderItemsMain {
    webService List<gvp.Webservices.process_SelectOrderItems> itemList {
        get;
        set;
    }
    webService gvp__Sales_Order__c order {
        get;
        set;
    }
    webService Decimal size {
        get;
        set;
    }
    webService Boolean special1 {
        get;
        set;
    }
}
global class process_order_responce {
    webService Decimal account_Credit {
        get;
        set;
    }
    webService Boolean creditAvialable {
        get;
        set;
    }
    webService Decimal difference {
        get;
        set;
    }
    webService Integer inventory {
        get;
        set;
    }
    webService String inventory_av {
        get;
        set;
    }
    webService Decimal item_pricing {
        get;
        set;
    }
    webService Decimal itemAvialable {
        get;
        set;
    }
    webService Decimal itemNotAvialable {
        get;
        set;
    }
    webService Decimal itemQuant {
        get;
        set;
    }
    webService Decimal priceDifferent {
        get;
        set;
    }
    webService String title {
        get;
        set;
    }
    webService Decimal total {
        get;
        set;
    }
    webService Boolean zeroInventory {
        get;
        set;
    }
}
}
