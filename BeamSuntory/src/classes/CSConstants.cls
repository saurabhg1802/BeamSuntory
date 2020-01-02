public class CSConstants {
    
    /**************************************************************************************************************
Order Claim Constants
***************************************************************************************************************/
    
    public static final String DEFAULT_ACCOUNT_NAME = 'Beam Suntory';
    public static final Id DEFAULT_ACCOUNT_RT_ID = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('Distributor').getRecordTypeId();
    
    
    public static final List <String> COUNTRIES_USING_US_BUSINESS_HOURS = new List <String> {
        'Argentina',
            'Belize',
            'Bolivia',
            'Brazil',
            'Canada',
            'Chile',
            'Colombia',
            'Costa Rica',
            'Uruguay',
            'Venezuela',
            'Honduras',
            'Ecuador',
            'El Salvador',
            'Suriname',
            'Guatemala',
            'Guyana',
            'Mexico',
            'Nicaragua',
            'Panama',
            'Paraguay',
            'Peru',
            'US'
            };
                
	// record types
    public static final String ORDER_CLAIM_RECORDTYPE_DEVNAME = 'Order_Claim';
    public static final String ORDER_CLAIM_RECORDTYPE_LABEL = System.Label.Order_Claim;
    public static final Id ORDERS_RT_ID = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Orders').getRecordTypeId();
    public static final Id ORDER_CLAIM_RT_ID = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Order_Claim').getRecordTypeId();
    public static final Id ORDER_CLAIM_SUBCASE_RT_ID = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Order_Claim_Sub_Case').getRecordTypeId();
    
    public static final Set <Id> orderClaimRecordTypeIds = new Set <Id> {
        ORDER_CLAIM_RT_ID,
            ORDER_CLAIM_SUBCASE_RT_ID
            };
                
                public static final String ORDER_CLAIM_SUB_CASE_RECORDTYPE_DEVNAME = 'Order_Claim_Sub_Case';
    public static final String ORDER_CLAIM_SUB_CASE_RECORDTYPE_LABEL = System.Label.Order_Claim_Sub_Case;
    
    public static final String PRODUCTION_ORGANIZATION_ID = '00Do0000000cCkJEAU';
    public static final String SANDBOX_Esker_EMAIL_ADDRESS = 'beamsuntory.nobailment.us.sop.qa@process.esker.net';
    public static final String PROD_Esker_EMAIL_ADDRESS = 'beamsuntory.nobailment.us.sop@process.esker.net';
    public static final String SYSTEM_EMAIL_USER_ID = '005o00000034U8D';
    public static final String Orders_Case_Creation_for_Esker = 'Orders_Case_Creation_for_Esker';
    
    public static final String Esker_EmailAddress = UserInfo.getOrganizationId() == PRODUCTION_ORGANIZATION_ID ?
        PROD_Esker_EMAIL_ADDRESS :
    SANDBOX_Esker_EMAIL_ADDRESS;
    
    public static final String ORDERS = 'Orders';
    public static final String ORDERS_Bulk_Type = 'Bulk';
    public static final String ORDERS_Barrel_Type = 'Barrel';
    public static final String ORDERS_Standard_Type = 'Standard';
    public static final String ORDERS_Requisition_Type = 'Requisition';
    public static final String ORDER_CLAIM = 'Order Claim';
    public static final String QUALITY_CLAIM = 'Quality Claim';
    public static final String ESCALATED_FORM = 'Escalated Form';
    public static final String INQUIRY = 'Inquiry';
    public static final String CHANGES = 'Changes';
    
    //public static final Id ORDERS_RT_ID = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Orders').getRecordTypeId();
    
    public static final String DISTRIBUTOR_RECORDTYPE_DEVNAME = 'Distributor';
    public static final String DISTRIBUTOR_RECORDTYPE_LABEL = 'Distributor';
    
    // country field value
    public static final String US_PRODUCT_DESTINATION_COUNTRY_VALUE = 'US';
    
    // Entitlement for accounts related to cases with Record type of order claim and order claim sub case
    public static final String ORDER_CLAIMS_ENTITLEMENT = 'Order Claim Entitlement';
    
    // Default Entitlement Processe for Record type order claim and order claim sub case
    public static final String ORDER_CLAIMS_ENTITLEMENT_PROCESS = 'CS Order Claims';
    
    // case statuses
    public static final String PENDING_SUB_CASE = 'Pending Sub-Case';
    public static final String CLOSED_APPROVED = 'Closed - Approved';
    public static final String CLOSED_REJECTED = 'Closed - Rejected';
    public static final String CLOSED = 'Closed';
    public static final String DUP_NO_ACTION = 'DUP - No Action';
    public static final String NEW_STATUS = 'New';
    
    // email to case values
    public static final String PROD_EMAIL_SERVICE_ADDRESS = 'customer.service@beamsuntory.com';
    public static final String SANDBOX_EMAIL_SERVICE_ADDRESS = 'customerservice.sandbox@beamsuntory.com';
    public static final String SANDBOX_EMAIL_SERVICE_ADDRESS_Modified = 'customer.service@1ihjfy4k4n28s0tbg296lw81qvg85zqmfmoae6sdwf988uu7pb.4b-yzuuae.cs51.case.sandbox.salesforce.com';
    public static final String EMAIL_SERVICE_ADDRESS = UserInfo.getOrganizationId() == PRODUCTION_ORGANIZATION_ID ?
        PROD_EMAIL_SERVICE_ADDRESS :
    SANDBOX_EMAIL_SERVICE_ADDRESS;
    
    // closed status variations for cases with Record type of order claim and order claim sub case
    public static final List <String> CLOSED_STATUS_VARIATIONS = new List <String> {
        CLOSED_REJECTED,
            CLOSED_APPROVED,
            CLOSED,
            DUP_NO_ACTION
            };
                
                // picklist field api names
                public static final String PRODUCT_DESTINATION_COUNTRY_APINAME = 'Product_Destination_Country__c';
    public static final String DISTRIBUTOR_CURRENCY_APINAME = 'Distibutor_Currency__c';
    public static final String SEAL_INTACT_APINAME = 'Seal_Intact__c';
    public static final String PRODUCT_SIZE_APINAME = 'Product_Size__c';
    public static final String FREIGHT_CLAIM_TYPE_APINAME = 'Freight_Claim_Type__c';
    public static final String QUANTITY_TYPE_APINAME = 'Quantity_Type__c';
    public static final String OVERAGE_DISPOSITION_APINAME = 'Overage__c';
    public static final String STATE_APINAME = 'State__c';
    public static final String PREMISE_APINAME = 'State__c';
    public static final String REGION_APINAME = 'State__c';
    public static final String MARKET_APINAME = 'State__c';
    public static final String REASON_FOR_DENIAL_APINAME = 'Reason_for_Denial__c';
    
    
    // default account name
    public static final String DEFAULT_BAILMENT_CLAIMS_ACCOUNT = 'Beam Suntory';
    
    public static final String UNKNOWN_PLANT = 'Unknown';
    
    // milestone names
    public static final String PREPARE_FOR_PLANT = 'Prepare for Plant';
    public static final String PREPARE_FOR_PLANT_EXPEDITED = 'Prepare for Plant - Expedited';
    public static final String PREPARE_FOR_PLANT_REOPEN = 'Prepare for Plant - ReOpened';
    
    public static final List <String> PREPARE_FOR_PLANT_MILESTONES = new List <String> {
        PREPARE_FOR_PLANT,
            PREPARE_FOR_PLANT_EXPEDITED,
            PREPARE_FOR_PLANT_REOPEN
            };
                
                
                
                /**************************************************************************************************************
Quality Claim Constants
QC = 'Quality Claim'
***************************************************************************************************************/
                
                public static final Id QC_RT_ID = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Quality_Claim').getRecordTypeId();
    public static final Id QC_SUBCASE_RT_ID = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Quality_Claim_Sub_Case').getRecordTypeId();
    public static final Id LOGISTICS_REQUEST_RT_ID = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Logistics_request').getRecordTypeId();
    
    public static final String REVIEWING = 'Reviewing Details';
    
    
    public static final List <String> QC_CLOSED_STATUS_VARIATIONS = new List <String> {
        CLOSED_REJECTED,
            CLOSED_APPROVED,
            CLOSED,
            DUP_NO_ACTION
            };
                
                public static Set <Id> qualityClaimRecordTypeIds = new Set <Id> {
                    QC_RT_ID,
                        QC_SUBCASE_RT_ID
                        };
                            
                            
                            // milestone names
                            public static final String WORKING = 'Working';
    
    // Entitlement for accounts related to cases with Record type of quality claim sub case
    public static final String QUALITY_CLAIM_ENTITLEMENT = 'Quality Claim Entitlement';
    
    // Default Entitlement Processe for Record type of quality claim sub case
    public static final String QUALITY_CLAIM_ENTITLEMENT_PROCESS = 'Quality Claim';
    
    // Entitlement for accounts related to cases with Record type of Logistics Request case
    public static final String LOGISTICS_REQUEST_ENTITLEMENT = 'Logistics Request Entitlement';
    
    // Default Entitlement Processe for Record type of Logistics Request case
    public static final String LOGISTICS_REQUEST_ENTITLEMENT_PROCESS = 'Logistics Request';
    
    // Entitlement for accounts related to cases with Record type of quality claim sub case
    public static final String QUALITY_CLAIM_SUB_CASE_ENTITLEMENT = 'Quality Claim Sub Case Entitlement';
    
    // Default Entitlement Processe for Record type of quality claim sub case
    public static final String QUALITY_CLAIM_SUB_CASE_ENTITLEMENT_PROCESS = 'Quality Claim Sub Case';
    
    public static final String QUALITY_CLAIM_PARENT_CASE_ENTITLEMENT = 'Quality Claim Parent Case Entitlement';
    public static final String QUALITY_CLAIM_PARENT_CASE_ENTITLEMENT_PROCESS = 'Quality Claim Parent Case';
    
    //Jai Kumar Garg
	public static final Id DUMMY_CASE_RT_ID = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Dummy_Case').getRecordTypeId();
	public static final Id CONSUMER_INQUIRY_RT_ID = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Consumer_Inquiry').getRecordTypeId();
	public static final String PRODUCT_PACKAGING_ISSUE = 'PRODUCT OR PACKAGING ISSUE';
    public static final String COMPLAINT = 'COMPLAINT';
    public static final String HIGH = 'HIGH';
    public static final String CRITICAL = 'CRITICAL';
    
    
}