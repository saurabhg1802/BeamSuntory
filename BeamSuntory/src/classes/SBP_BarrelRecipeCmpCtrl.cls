public without sharing class SBP_BarrelRecipeCmpCtrl {

	/**************************************************************************************************************
	Author:        Craig Austgen
	Company:       Slalom, LLC
	Description:	Pulls in the custom metadata for the staves
	History
	<Date>      <Authors Name>     <Brief Description of Change>
	7/2018     	Craig Austgen       Initial Creation

	***************************************************************************************************************/

	@AuraEnabled
	public static LightningComponentUtility.RequestStatus getSingleBarrelStaveCustomMetadata(String brand) {
		Boolean success = true;
		String message = null;
		Map<String, Object> responseMap = new Map<String, Object>();

		try {
			List<Single_Barrel_Stave_Setting__mdt> staves = [select MasterLabel, Brand__c, isActive__c, Order__c, Static_Resource_Name__c, Stave_Name__c from Single_Barrel_Stave_Setting__mdt where isActive__c = true AND Brand__c = :brand order by Order__c asc];

			responseMap.put('staves', staves);
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
	Description:	Pulls in all the recent recipes related to a particular account
	Inputs:        caseId:	single barrel program case id
					brand: single barrel program brand
	History
	<Date>      <Authors Name>     <Brief Description of Change>
	7/2018     	Craig Austgen       Initial Creation

	***************************************************************************************************************/

	@AuraEnabled
	public static LightningComponentUtility.RequestStatus getRecentRecipes(String caseId, String brand) {
		Boolean success = true;
		String message = null;
		Map<String, Object> responseMap = new Map<String, Object>();
		Set<Id> barrelRecipeIds = new Set<Id>();
		String accountName;
		Id accountId;

		try {
			Case c = [select id, Retail_Account__c, Retail_Account_Name__c from Case where Id = :Id.valueOf(caseId) limit 1];
			accountId = c.Retail_Account__c;
			for (Account_Barrel_Recipe__c abr : [select Id
			                                     , Name
			                                     , Account_Name__c
			                                     , Barrel_Recipe__c
			                                     , Account__r.Name from Account_Barrel_Recipe__c where Account__c = :accountId
			                                             AND Account_Name__c = :c.Retail_Account_Name__c
			                                                     AND Barrel_Recipe__r.Brand__c = :brand]) {
				barrelRecipeIds.add(abr.Barrel_Recipe__c);
				if (String.isBlank(abr.Account_Name__c)) {
					accountName = abr.Account__r.Name;
				} else {
					accountName = abr.Account_Name__c;
				}

			}

			List<Barrel_Recipe__c> recipes = [select Id, Name, Recipe_Label__c, Creation_Date__c, (select id, Quantity__c, Type__c from Staves__r) from Barrel_Recipe__c where Id IN :barrelRecipeIds];

			responseMap.put('recipes', recipes);
			responseMap.put('accountName', accountName);
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
	Description:
	History
	<Date>      <Authors Name>     <Brief Description of Change>
	7/2018     	Craig Austgen       Initial Creation

	***************************************************************************************************************/

	@AuraEnabled
	public static LightningComponentUtility.RequestStatus createBarrelRecord(String caseId, String brand, String recipe) {
		Boolean success = true;
		String message = null;
		Map<String, Object> responseMap = new Map<String, Object>();
		Barrel__c barrel = new Barrel__c();

		try {
			List<Barrel__c> existingBarrel = [select id, Barrel_Recipe__c from Barrel__c where Case__c = :String.valueOf(caseId)];
			if (!existingBarrel.isEmpty()) {
				barrel = existingBarrel[0];
				barrel.Barrel_Recipe__c = Id.valueOf(recipe);

			} else {
				barrel.Brand__c = brand;
				barrel.Barrel_Recipe__c = Id.valueOf(recipe);
				barrel.RecordTypeId = SBP_Constants.fullBarrelBrandRTIdMap.get(brand);
				barrel.Case__c = Id.valueOf(caseId);
			}

			upsert barrel;


			Case c = new Case();
			c.put('Id', Id.valueOf(caseId));
			c.Barrel_Selected__c = true;
			c.Type = 'Recent Recipes';
			update c;

			responseMap.put('barrelId', barrel.Id);
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
	Description:
	Inputs:        recordId: case Id
	History
	<Date>      <Authors Name>     <Brief Description of Change>
	7/2018     	Craig Austgen       Initial Creation

	***************************************************************************************************************/
	@AuraEnabled
	public static LightningComponentUtility.RequestStatus getCase(String recordId) {
		Boolean success = true;
		String message = null;
		Map<String, Object> responseMap = new Map<String, Object>();
		String state;

		try {
			Case c = [select Id, Barrel_Selected__c, Type, Brand__c from Case where Id = :Id.valueOf(recordId) limit 1];
			responseMap.put('barrelSelected', c.Barrel_Selected__c);
			responseMap.put('type', c.Type);
			responseMap.put('brand', c.Brand__c);

		} catch (Exception e) {
			System.debug(LoggingLevel.INFO, e.getMessage());
			message = e.getMessage();
			success = false;
		}

		LightningComponentUtility.RequestStatus requestStatus = new LightningComponentUtility.RequestStatus(success, message, responseMap);
		System.debug(LoggingLevel.INFO, requestStatus);
		return requestStatus;
	}




	@AuraEnabled
	public static LightningComponentUtility.RequestStatus createBarrelRecipe(String jsonRecipe, String caseId) {
		Boolean success = true;
		String message = null;
		Map<String, Object> responseMap = new Map<String, Object>();
		Map<String, Integer> staveNameToQuantity = new Map<String, Integer>();
		Map<String, Boolean> staveMatchMap = new Map<String, Boolean>();
		Barrel_Recipe__c matchingRecipe = new Barrel_Recipe__c();

		System.debug(jsonRecipe);
		List<Stave__c> staves = (List<Stave__c>)System.JSON.deserialize(jsonRecipe, List<Stave__c>.Class);

		// default stave match to false in order to find if a combination of staves already exists in the system
		for (Stave__c stave : staves) {
			staveNameToQuantity.put(stave.Type__c, Integer.valueOf(stave.Quantity__c));
			staveMatchMap.put(stave.Type__c, false);
		}

		try {
			Case c = [select id, Retail_Account__c, Retail_Account_Name__c, Brand__c, Barrel_Selected__c from Case where Id = :Id.valueOf(caseId)];

			// search for all existing barrel recipes
			for (Barrel_Recipe__c recipe : [select id, (select Type__c, Quantity__c from Staves__r) from Barrel_Recipe__c where Brand__c = :c.Brand__c]) {
				// if the stave matches then flag it
				for (Stave__c stave : recipe.Staves__r) {
					if (staveNameToQuantity.containsKey(stave.Type__c)) {
						if (staveNameToQuantity.get(stave.Type__c) == stave.Quantity__c) {
							staveMatchMap.put(stave.Type__c, true);
						}
					}
				}
				// loop through staves to see if a match was found
				for (Boolean staveMatch : staveMatchMap.values()) {
					if (!staveMatch) {
						matchingRecipe = null;
						break;
					} else {
						matchingRecipe = recipe;
					}
				}
				if (matchingRecipe != null) {
					break;
				}
				// reset stave matches for next loop
				for (Stave__c stave : staves) {
					staveMatchMap.put(stave.Type__c, false);
				}
			}

			// use existing recipe
			if (matchingRecipe == null) {
				matchingRecipe = createNewBarrelRecipe(c.Brand__c);
				List<Stave__c> newStaves = createStaves(staves, matchingRecipe);

			}
			Account_Barrel_Recipe__c abr = createNewAccountBarrelRecipe(c, matchingRecipe);
			List<Barrel__c> barrels = updateBarrelRecordWithStaveSelection(c, matchingRecipe);

			// update the case to show that the recipe has been selected
			c.Barrel_Selected__c = true;
			update c;

			responseMap.put('newRecipe', matchingRecipe);
			responseMap.put('staveMatchMap', staveMatchMap);
			responseMap.put('barrels', barrels);
		} catch (Exception e) {
			System.debug(LoggingLevel.INFO, e.getMessage());
			message = e.getMessage();
			message = message + '\n' + e.getStackTraceString();
			success = false;

		}


		LightningComponentUtility.RequestStatus requestStatus = new LightningComponentUtility.RequestStatus(success, message, responseMap);
		System.debug(LoggingLevel.INFO, requestStatus);
		return requestStatus;

	}
	public static Barrel_Recipe__c createNewBarrelRecipe(String brand) {
		Barrel_Recipe__c br = new Barrel_Recipe__c();
		br.Brand__c = brand;
		insert br;

		return br;
	}
	public static Account_Barrel_Recipe__c createNewAccountBarrelRecipe(Case c, Barrel_Recipe__c recipe) {
		Account_Barrel_Recipe__c abr = new Account_Barrel_Recipe__c();

		List<Account_Barrel_Recipe__c> abrs = [select id from Account_Barrel_Recipe__c where Barrel_Recipe__c = :recipe.Id limit 1];

		if (abrs.isEmpty()) {
			abr.Account__c = c.Retail_Account__c;
			abr.Account_Name__c = c.Retail_Account_Name__c;
			abr.Barrel_Recipe__c = recipe.Id;
			insert abr;
		} else {
			abr = abrs[0];
		}
		return abr;
	}

	public static List<Stave__c> createStaves(List<Stave__c> staves, Barrel_Recipe__c recipe) {
		for (Stave__c stave : staves) {
			stave.Barrel_Recipe__c = recipe.Id;
			stave.Name = stave.Type__c;
		}

		insert staves;
		return staves;
	}

	public static List<Barrel__c> updateBarrelRecordWithStaveSelection(Case c, Barrel_Recipe__c recipe) {
		List<Barrel__c> barrels = [select id, Barrel_Recipe__c from Barrel__c where Case__c = :c.Id];
		if (!barrels.isEmpty()) {
			barrels[0].Barrel_Recipe__c = recipe.Id;
			update barrels[0];

		} else {
			Barrel__c newBarrel = new Barrel__c();
			newBarrel.Brand__c = c.Brand__c;
			newBarrel.Barrel_Recipe__c = recipe.Id;
			newBarrel.RecordTypeId = SBP_Constants.fullBarrelBrandRTIdMap.get(c.Brand__c);
			newBarrel.Case__c = c.Id;

			insert newBarrel;
		}

		return barrels;
	}



}