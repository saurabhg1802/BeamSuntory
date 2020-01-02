trigger bsmCouponSetCode on Bonus_Coupon__c (before insert) {
    if (Trigger.isBefore){
        For (Bonus_Coupon__c bcpn: Trigger.new){
            Blob b = Crypto.GenerateAESKey(128);
            String h = EncodingUtil.ConvertTohex(b);
            String appkey = h.SubString(6,8).toUpperCase() + h.SubString(8,12).toUpperCase() + h.SubString(12,16).toUpperCase();
            system.debug(appkey);
            bcpn.Coupon_Code__c = appkey;
        }
    }
}