public with sharing class CommunityForgotPasswordController {
    public String username {get; set;}
    public CommunityForgotPasswordController() {
        
    }
    public PageReference forgotPassword() {
        boolean success = Site.forgotPassword(username);
        PageReference pr = System.Page.CommunityForgotPasswordConfirm;
        pr.setRedirect(true);
        
        if (success) {              
            return pr;
        }
        return null;
    }
}