public class SBP_Constants {

	// Entitlement for accounts related to cases with Record type of order claim and order claim sub case
	public static final String SINGLE_BARREL_ENTITLEMENT = 'Single Barrel Entitlement';

	// Default Entitlement Processe for Record type order claim and order claim sub case
	public static final String SINGLE_BARREL_ENTITLEMENT_PROCESS = 'Single Barrel - Standard';

	// Default Entitlement Processe for Record type order claim and order claim sub case
	public static final String REGISTER_EMAIL_TEMPLATE_NAME = 'Register_Barrel';
	public static final String BARREL_FINAL_DETAILS_EMAIL_TEMPLATE_NAME = 'Barrel_Final_Details';
	public static final String SAP_NUMBER_ENTERED_EMAIL_TEMPLATE_NAME = 'SAP_Entered';



	// standard barrel order case statuses
	public static final String NEW_STATUS = 'New';
	public static final String PENDING_DOCUMENTATION = 'Pending Documentation';
	public static final String PREPARING_BARREL = 'Preparing Barrel';
	public static final String PENDING_FINAL_DETAILS = 'Pending Final Details';
	public static final String ORDER_SHIPPED = 'Order Shipped';
	public static final String CLOSED = 'Closed';

	// proof specific barrel order case statuses
	public static final String PENDING_SELECTION = 'Pending Selection';
	public static final String PENDING_PURCHASE_ORDER = 'Pending Purchase Order';
	public static final String PENDING_SHIP_DATE = 'Pending Ship Date';


	// email to case values
	public static final String PRODUCTION_ORGANIZATION_ID = '00Do0000000cCkJEAU';
	public static final String PROD_EMAIL_SERVICE_ADDRESS = 'customer.service@beamsuntory.com';
	public static final String PROD_COMPLIANCE_EMAIL_SERVICE_ADDRESS = 'compliance@beamsuntory.com';

	public static final String SANDBOX_EMAIL_SERVICE_ADDRESS = 'customerservice.sandbox@beamsuntory.com';
	public static final String EMAIL_SERVICE_ADDRESS = UserInfo.getOrganizationId() == PRODUCTION_ORGANIZATION_ID ?
	        PROD_EMAIL_SERVICE_ADDRESS :
	        SANDBOX_EMAIL_SERVICE_ADDRESS;

	public static final String COMPLIANCE_EMAIL_SERVICE_ADDRESS = UserInfo.getOrganizationId() == PRODUCTION_ORGANIZATION_ID ?
	        PROD_COMPLIANCE_EMAIL_SERVICE_ADDRESS :
	        '';

	public static final List<String> STATUSES_AFTER_PENDING_DOCUMENTATION = new List<String> {
		PREPARING_BARREL,
		PENDING_FINAL_DETAILS,
		ORDER_SHIPPED,
		CLOSED
	};

	public static final String SAMPLE_KIT = 'Sample Kit';
	public static final String TRIP_AND_TOUR = 'Trip and Tour';
	public static final String DISTILLER_CHOICE = 'Distiller\'s Choice';
	public static final String REMOTE_SELECTION = 'Remote Selection';
	public static final String SPLIT_BARREL = 'Split Barrel';

	// picklist field api names
	public static final String STATE_APINAME = 'State__c';
	public static final String PREMISE_APINAME = 'PremiseType__c';
	public static final String REGION_APINAME = 'Region__c';
	public static final String MARKET_APINAME = 'Market__c';


	// milestone names
	public static final String POS_ITEM_MILESTONE = 'Select POS Items';
	public static final String SELECT_BARREL_MILESTONE = 'Select Barrel';
	public static final String SELECT_SAMPLE_MILESTONE = 'Select Sample';
	public static final String UPLOAD_PO_MILESTONE = 'Upload Purchase Order';
	public static final String ENTER_BOTTLE_TEXT_MILESTONE = 'Enter Bottle Text';
	public static final String ENTER_SAP_NUMBER_MILESTONE = 'Enter SAP Number';
	public static final String ENTER_BARREL_DETAIL_MILESTONE = 'Enter Barrel Detail';
	public static final String SELECT_SAMPLE_DETAIL_MILESTONE = 'Select Sample';
	public static final String SCHEDULE_TRIP_MILESTONE = 'Schedule Trip';




	// Email templates
	public static final String FINAL_DETAILS_TEMPLATE = 'Final_Information_Entered';
	public static final String SAP_NUMBER_ENTERED_TEMPLATE = 'SAP_Entered';

	// Record Type Names

	// case
	public static final Id SINGLE_BARREL_STANDARD_RT_ID = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Single_Barrel_Standard').getRecordTypeId();
	public static final Id SINGLE_BARREL_PROOF_SPECIFIC_RT_ID = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Single_Barrel_Proof_Specific').getRecordTypeId();
	public static final Id SINGLE_BARREL_SPLIT_BARREL_RT_ID = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Single_Barrel_Split_Barrel').getRecordTypeId();

	// barrel
	public static final Id KNOB_CREEK_FULL_BARREL_RT_ID = Schema.SObjectType.Barrel__c.getRecordTypeInfosByDeveloperName().get('Knob_Creek_Full_Barrel').getRecordTypeId();
	public static final Id KNOB_CREEK_SPLIT_BARREL_RT_ID = Schema.SObjectType.Barrel__c.getRecordTypeInfosByDeveloperName().get('Knob_Creek_Split_Barrel').getRecordTypeId();
	public static final Id KNOB_CREEK_SAMPLE_KIT_RT_ID = Schema.SObjectType.Barrel__c.getRecordTypeInfosByDeveloperName().get('Knob_Creek_Sample_Kit').getRecordTypeId();

	public static final Id MAKERS_MARK_FULL_BARREL_RT_ID = Schema.SObjectType.Barrel__c.getRecordTypeInfosByDeveloperName().get('Makers_Mark_Full_Barrel').getRecordTypeId();

	public static final Id JIM_BEAM_FULL_BARREL_RT_ID = Schema.SObjectType.Barrel__c.getRecordTypeInfosByDeveloperName().get('Jim_Beam_Full_Barrel').getRecordTypeId();
	public static final Id JIM_BEAM_SAMPLE_KIT_BARREL_RT_ID = Schema.SObjectType.Barrel__c.getRecordTypeInfosByDeveloperName().get('Jim_Beam_Sample_Kit').getRecordTypeId();

	public static final Id CRUZAN_FULL_BARREL_RT_ID = Schema.SObjectType.Barrel__c.getRecordTypeInfosByDeveloperName().get('Cruzan_Full_Barrel').getRecordTypeId();
	public static final Id CRUZAN_SAMPLE_KIT_RT_ID = Schema.SObjectType.Barrel__c.getRecordTypeInfosByDeveloperName().get('Cruzan_Sample_Kit').getRecordTypeId();

	public static final Id EL_TESORO_FULL_BARREL_RT_ID = Schema.SObjectType.Barrel__c.getRecordTypeInfosByDeveloperName().get('El_Tesoro_Full_Barrel').getRecordTypeId();

	// Plant
	public static final Id KNOB_CREEK_EVENT_RT_ID = Schema.SObjectType.Plant_Event__c.getRecordTypeInfosByDeveloperName().get('Knob_Creek').getRecordTypeId();
	public static final Id MAKERS_MARK_EVENT_RT_ID = Schema.SObjectType.Plant_Event__c.getRecordTypeInfosByDeveloperName().get('Makers_Mark').getRecordTypeId();
	public static final Id EL_TESORO_EVENT_RT_ID = Schema.SObjectType.Plant_Event__c.getRecordTypeInfosByDeveloperName().get('El_Tesoro').getRecordTypeId();

	// POS Customizations
	public static final Id POS_FULL_BARREL_RT_ID = Schema.SObjectType.POS_Customization__c.getRecordTypeInfosByDeveloperName().get('Full_Barrel').getRecordTypeId();
	public static final Id POS_SPLIT_BARREL_RT_ID = Schema.SObjectType.POS_Customization__c.getRecordTypeInfosByDeveloperName().get('Split_Barrel').getRecordTypeId();

	// full barrel recordtype map by brand name
	public static Map<String, Id> fullBarrelBrandRTIdMap = new Map<String, Id> {
		'Knob Creek' 		=> KNOB_CREEK_FULL_BARREL_RT_ID,
		'Makers Mark' 		=> MAKERS_MARK_FULL_BARREL_RT_ID,
		'Jim Beam'			=> JIM_BEAM_FULL_BARREL_RT_ID,
		'Cruzan' 			=> CRUZAN_FULL_BARREL_RT_ID,
		'El Tesoro'			=> EL_TESORO_FULL_BARREL_RT_ID
	};

	public static Map<String, Id> splitBarrelBrandRTIdMap = new Map<String, Id> {
		'Knob Creek' 		=> KNOB_CREEK_SPLIT_BARREL_RT_ID
	};

	public static Map<String, Id> sampleKitBrandRTIdMap = new Map<String, Id> {
		'Knob Creek' 		=> KNOB_CREEK_SAMPLE_KIT_RT_ID,
		'Jim Beam'			=> JIM_BEAM_SAMPLE_KIT_BARREL_RT_ID,
		'Cruzan' 			=> CRUZAN_SAMPLE_KIT_RT_ID
	};

	public static Map<String, Id> plantEventRtIdMap = new Map<String, Id> {
		'Knob Creek' 		=> KNOB_CREEK_EVENT_RT_ID,
		'Makers Mark' 		=> MAKERS_MARK_EVENT_RT_ID,
		'El Tesoro'			=> EL_TESORO_EVENT_RT_ID
	};

	public static Map<String, String> brandToPlant = new Map<String, String> {
		'Knob Creek' 		=> 'Clermont',
		'Makers Mark' 		=> 'Loretto',
		'El Tesoro'			=> 'La Alteña Distillery'
	};

	public static Map<String, Id> caseBrandsRTIdMap = new Map<String, Id> {
		'Makers Mark' 		=> SINGLE_BARREL_PROOF_SPECIFIC_RT_ID,
		'El Tesoro' 		=> SINGLE_BARREL_PROOF_SPECIFIC_RT_ID,
		'Knob Creek' 		=> SINGLE_BARREL_STANDARD_RT_ID,
		'Jim Beam'			=> SINGLE_BARREL_STANDARD_RT_ID,
		'Cruzan' 			=> SINGLE_BARREL_STANDARD_RT_ID
	};

	public static Set<Id> caseSingleBarrelRtIds = new Set<Id> {
		SINGLE_BARREL_STANDARD_RT_ID,
		SINGLE_BARREL_PROOF_SPECIFIC_RT_ID
	};

	public static Set<Id> fullBarrelRtIds = new Set<Id> {
		KNOB_CREEK_FULL_BARREL_RT_ID,
		MAKERS_MARK_FULL_BARREL_RT_ID,
		JIM_BEAM_FULL_BARREL_RT_ID,
		CRUZAN_FULL_BARREL_RT_ID,
		EL_TESORO_FULL_BARREL_RT_ID
	};

	public static Set<Id> splitBarrelRtIds = new Set<Id> {
		KNOB_CREEK_SPLIT_BARREL_RT_ID
	};

	public static Set<Id> clermontBarrelRtIds = new Set<Id> {
		KNOB_CREEK_FULL_BARREL_RT_ID,
		JIM_BEAM_FULL_BARREL_RT_ID,
		CRUZAN_FULL_BARREL_RT_ID

	};

	public static Set<Id> standardBarrelRTIds = new Set<Id> {
		KNOB_CREEK_FULL_BARREL_RT_ID,
		JIM_BEAM_FULL_BARREL_RT_ID,
		CRUZAN_FULL_BARREL_RT_ID
	};

	public static Set<Id> proofSpecificBarrelRTIds = new Set<Id> {
		MAKERS_MARK_FULL_BARREL_RT_ID,
		EL_TESORO_FULL_BARREL_RT_ID
	};

	public static Map<String, String> stateMap = new Map<String, String> {
		'AL' => 'Alabama',
		'AK' => 'Alaska',
		'AZ' => 'Arizona',
		'AR' => 'Arkansas',
		'CA' => 'California',
		'CO' => 'Colorado',
		'CT' => 'Connecticut',
		'DE' => 'Delaware',
		'FL' => 'Florida',
		'GA' => 'Georgia',
		'HI' => 'Hawaii',
		'ID' => 'Idaho',
		'IL' => 'Illinois',
		'IN' => 'Indiana',
		'IA' => 'Iowa',
		'KS' => 'Kansas',
		'KY' => 'Kentucky',
		'LA' => 'Louisiana',
		'ME' => 'Maine',
		'MD' => 'Maryland',
		'MA' => 'Massachusetts',
		'MI' => 'Michigan',
		'MN' => 'Minnesota',
		'MS' => 'Mississippi',
		'MO' => 'Missouri',
		'MT' => 'Montana',
		'NE' => 'Nebraska',
		'NV' => 'Nevada',
		'NH' => 'New Hampshire',
		'NJ' => 'New Jersey',
		'NM' => 'New Mexico',
		'NY' => 'New York',
		'NC' => 'North Carolina',
		'ND' => 'North Dakota',
		'OH' => 'Ohio',
		'OK' => 'Oklahoma',
		'OR' => 'Oregon',
		'PA' => 'Pennsylvania',
		'RI' => 'Rhode Island',
		'SC' => 'South Carolina',
		'SD' => 'South Dakota',
		'TN' => 'Tennessee',
		'TX' => 'Texas',
		'UT' => 'Utah',
		'VT' => 'Vermont',
		'VA' => 'Virginia',
		'WA' => 'Washington',
		'DC' => 'Washington DC',
		'WV' => 'West Virginia',
		'WI' => 'Wisconsin',
		'WY' => 'Wyoming',
		'OR' => 'Oregon',
		'N1' => 'North Carolina',
		'U1' => 'Utah'
	};











}