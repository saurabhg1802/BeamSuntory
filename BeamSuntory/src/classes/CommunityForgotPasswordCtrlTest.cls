@isTest
private class CommunityForgotPasswordCtrlTest {
    
    @isTest static void testForgotPassword() {
        CommunityForgotPasswordController ctrl = new CommunityForgotPasswordController();
        ctrl.username = 'test@salesforce.com';
        System.assertEquals(ctrl.forgotPassword(),null);
    }
    
    
    
}