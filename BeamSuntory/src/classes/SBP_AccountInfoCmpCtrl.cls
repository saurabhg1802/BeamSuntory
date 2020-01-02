public without sharing class SBP_AccountInfoCmpCtrl {

	/**************************************************************************************************************
	Author:        Craig Austgen
	Company:       Slalom, LLC
	Description:	Returns custom labels used in the lightning component SBP_AccountInfoCmp
	History
	<Date>      <Authors Name>     <Brief Description of Change>
	7/2018     	Craig Austgen       Initial Creation

	***************************************************************************************************************/
	@AuraEnabled
	public static LightningComponentUtility.RequestStatus getSingleBarrelLabels() {
		Boolean success = true;
		String message = null;
		Map<String, Object> responseMap = new Map<String, Object>();

		try {
			Map<String, String> auraIdLabelMap = new Map<String, String> {
				'yes'							=> System.Label.Yes,
				'corresponding_collaborators'   => System.Label.Corresponding_Collaborators,
				'no'							=> System.Label.No,
				'missing_value'					=> System.Label.Please_enter_a_value,
				'actions'						=> System.Label.Actions,
				'error'							=> System.Label.Error,
				'edit'							=> System.Label.Edit,
				'remove'						=> System.Label.Remove,
				'nonePicklist'					=> System.Label.None_Picklist,
				'none'							=> System.Label.None,
				'state'							=> System.Label.State,
				'account'						=> 'Account/TDLinx',
				'contact'						=> 'Distributor Contact',
				'account_details'				=> 'Account Information',
				'premise'						=> 'Premise',
				'region' 						=> 'Region',
				'market'						=> 'Market',
				'distributor'					=> 'Distributor',
				'attention'						=> 'Attention',
				'company'						=> 'Company',
				'address' 						=> 'Address Information',
				'street'						=> 'Street',
				'address2'						=> 'Address 2',
				'city'							=> 'City',
				'zip'							=> 'Zip Code',
				'phone'							=> 'Phone',
				'distributor_information' 		=> 'Distributor Shipping Information',
				'date_selection'				=> 'Date Information',
				'date'							=> 'Requested Date',
				'split'							=> 'Is this barrel being split by the Distributor across multiple store locations/accounts?',
				'account_name'					=> 'Account Name'
			};
			responseMap.put('labelMap', auraIdLabelMap);
		} catch (Exception e) {
			System.debug(LoggingLevel.INFO, e.getMessage());
			message = e.getMessage();
			success = false;

		}

		LightningComponentUtility.RequestStatus requestStatus = new LightningComponentUtility.RequestStatus(success, message, responseMap);
		System.debug(LoggingLevel.INFO, requestStatus);
		return requestStatus;
	}

	/**************************************************************************************************************
	Author:        Craig Austgen
	Company:       Slalom, LLC
	Description:	Returns picklist values used in the lightning component SBP_AccountInfoCmp
	History
	<Date>      <Authors Name>     <Brief Description of Change>
	7/2018     	Craig Austgen       Initial Creation

	***************************************************************************************************************/
	@AuraEnabled
	public static Map<String, List<String>> getSingleBarrelPicklistValues() {

		return new Map<String, List<String>> {
			'premise' 	=> getAccountPicklistValues(SBP_Constants.PREMISE_APINAME),
			'states'    => getCasePicklistValues(SBP_Constants.STATE_APINAME)
		};
	}

	/**************************************************************************************************************
	Author:        Craig Austgen
	Company:       Slalom, LLC
	Description:	once a user completes the account info page in the Single Barrel Program flow the related case
					will be updated with the account info selected
	History
	<Date>      <Authors Name>     <Brief Description of Change>
	7/2018     	Craig Austgen       Initial Creation

	***************************************************************************************************************/
	@AuraEnabled
	public static LightningComponentUtility.RequestStatus updateCase(String jsonCases) {
		Boolean success = true;
		String message = null;
		Map<String, Object> responseMap = new Map<String, Object>();
		System.debug(jsonCases);

		try {
			List<Case> caseList = (List<Case>)System.JSON.deserialize(jsonCases, List<Case>.Class);
			Case caseFromComponent = caseList[0];

			Account acct = [select id from Account where Name = 'Single Barrel International Account'];

			Case existingCase = [select id, Retail_Account__c, Brand__c,Product_Type__c, Premise__c from Case where Id = :caseFromComponent.Id];

			List<Barrel__c> barrels = [select id from Barrel__c where Case__c = :existingCase.Id];
			if (barrels.isEmpty()) {
				Barrel__c barrel = new Barrel__c();
				barrel.Brand__c = existingCase.Brand__c;
				barrel.Product_Type__c = existingCase.Product_Type__c;
				barrel.RecordTypeId = SBP_Constants.fullBarrelBrandRTIdMap.get(existingCase.Brand__c);
				barrel.Case__c = existingCase.Id;
				insert barrel;
			}

			// update approval status
			if (caseFromComponent.Remote_Selection_Date__c != null) {
				caseFromComponent.Approval_Status__c = 'Pending Approval';
			}

			// if there is not retail account
			if (caseFromComponent.Retail_Account__c == null) {
				if (existingCase.Retail_Account__c == null) {
					caseFromComponent.Account_Missing__c = true;
					caseFromComponent.Retail_Account__c = acct.Id;
				} else {
					caseFromComponent.Retail_Account__c = existingCase.Retail_Account__c;
				}
			} else if (existingCase.Retail_Account__c != null) {
				caseFromComponent.Retail_Account__c = existingCase.Retail_Account__c;
			}

			if (existingCase.Premise__c != '') {
				caseFromComponent.Premise__c = existingCase.Premise__c;
			}

			update caseFromComponent;

			responseMap.put('cases', caseFromComponent);
		} catch (Exception e) {
			System.debug(LoggingLevel.INFO, e.getMessage());
			message = e.getMessage();
			message = message + jsonCases;
			success = false;

		}

		LightningComponentUtility.RequestStatus requestStatus = new LightningComponentUtility.RequestStatus(success, message, responseMap);
		System.debug(LoggingLevel.INFO, requestStatus);
		return requestStatus;
	}


	public static List<String> getAccountPicklistValues(String apiName) {
		List<String> returnedTypeList = new List<String>();
		List<String> optionLabels = new List<String>();
		Map<String, Schema.SObjectField> fieldMap = Account.getSObjectType().getDescribe().fields.getMap();
		List<Schema.PicklistEntry> picklistValues = fieldMap.get(apiName).getDescribe().getPickListValues();

		for (Schema.PicklistEntry ple : picklistValues) {
			optionLabels.add(ple.getLabel());
		}

		return optionLabels;
	}
	public static List<String> getCasePicklistValues(String apiName) {
		List<String> returnedTypeList = new List<String>();
		List<String> optionLabels = new List<String>();
		Map<String, Schema.SObjectField> fieldMap = Case.getSObjectType().getDescribe().fields.getMap();
		List<Schema.PicklistEntry> picklistValues = fieldMap.get(apiName).getDescribe().getPickListValues();

		for (Schema.PicklistEntry ple : picklistValues) {
			optionLabels.add(ple.getLabel());
		}

		return optionLabels;
	}
}