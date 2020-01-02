/*---------------------------------------------------------------
Class developed by: Priyankar Saha
Company: TCS
Date: 02/15/2019
Description: This class will be used for global utility purposes
----------------------------------------------------------------*/

public class Global_Utility {
    
	/*------------------------------------------------------------
	Method Description: This method will let us know which ORG
						is getting called from the API.
	Method developed by: Priyankar Saha
	Company: TCS
	Date: 02/15/2019
	-------------------------------------------------------------*/
    public static Boolean isProd(){
        Id OrgId = UserInfo.getOrganizationId();
        if(OrgId == '00Dc0000003wU1h')
            return true;
        return false;
        }
    
}