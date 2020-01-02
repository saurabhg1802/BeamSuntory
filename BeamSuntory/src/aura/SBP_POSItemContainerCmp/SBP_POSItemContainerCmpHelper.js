({
    init: function(component, event, helper) {
        var programType = component.get('v.programType');
        var singleSplitBarrelRecord = component.get('v.singleSplitBarrelRecord');

        var getRecordInfoPromise = helper.getRecordInfo(component, event, helper);
        getRecordInfoPromise.then(
            $A.getCallback(function(result) {
                var stateName = helper.convertRegion(result['state'], 1);
                console.log('state ', stateName);
                //var stateAbbreviation = convertRegion("Florida", TO_ABBREVIATED): // Returns "FL"
                component.set('v.state', stateName);
                component.set('v.premiseType', result['premiseType']);
                console.log('pos items ', result);

                var getPOSCustomMetaDataPromise = helper.getPOSCustomMetaData(component, event, helper);
                return getPOSCustomMetaDataPromise;

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        ).then(
            $A.getCallback(function(result) {
                component.set('v.posItemsMap', result['brandToPOSItemMap']);
                console.log('pos items ', result['brandToPOSItemMap']);
                helper.createPOSItemComp(component, event, helper);
                helper.buildPosIdMap(component, event, helper);
                var getDistributorPromise = helper.getDistributor(component, event, helper);
                return getDistributorPromise;

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        ).then(
            $A.getCallback(function(result) {
                console.log(result['account']);
                component.set('v.distributorRecord', result['account']);
                helper.pageDoneRendering(component, event, helper);
            }),
            $A.getCallback(function(error) {
                // Something went wrong
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        )


    },
    getPOSCustomMetaData: function(component, event, helper) {
        var action = component.get("c.getSingleBarrelCustomMetaDataSettings");
        var brand = component.get('v.currentBrand');
        console.log(component.get('v.state'));
        console.log(component.get('v.currentBrand'));
        console.log(' premise type ', component.get('v.premiseType'));


        action.setParams({
            "state": component.get('v.state'),
            "brand": component.get('v.currentBrand'),
            "premiseType": component.get('v.premiseType')
        });
        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var requestObject = response.getReturnValue();
                    resolve(requestObject['responseMap']);
                } else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            reject(Error("Error message: " + errors[0].message));
                        }
                    } else {
                        reject(Error("Unknown error"));
                    }
                }
            });
            $A.enqueueAction(action);
        });
    },

    createPOSItemComp: function(component, event, helper) {
        var body = component.get("v.posItemBody");
        var currentBrand = component.get('v.currentBrand');
        var state = component.get('v.state');
        var availablePOSItemIds = component.get('v.availablePOSItemIds');
        var posIdToMetaDataMap = {};

        // clear out body
        // other methods of destorying the components did not work
        while (body.length > 0) {
            body.pop();
        }

        var allPosItems = component.get('v.posItemsMap');
        console.log('all pos items: ', allPosItems);
        var auraIds = component.get('v.posItemValidityMap');
        var posItemsSelectedBrand = allPosItems[currentBrand];
        var count = 0;
        for (var i in posItemsSelectedBrand) {
            posIdToMetaDataMap[posItemsSelectedBrand[i].posId] = {};
            posIdToMetaDataMap[posItemsSelectedBrand[i].posId] = posItemsSelectedBrand[i];
            if (posItemsSelectedBrand[i].state == state || !posItemsSelectedBrand[i].hasOwnProperty('state')) {
                var staticResourceURL = $A.get('$Resource.' + posItemsSelectedBrand[i].staticResourceName);
                var optionList = [];
                var posItemOptions = posItemsSelectedBrand[i].options.split(';');
                var showTextOptions = false;
                if (posItemsSelectedBrand[i].showTextOptions) {
                    showTextOptions = true;
                }
                for (var x in posItemOptions) {
                    var optionObj = {
                        label: posItemOptions[x],
                        value: posItemOptions[x]
                    };
                    optionList.push(optionObj);
                }

                auraIds[posItemsSelectedBrand[i].posId] = false;
                availablePOSItemIds.push(posItemsSelectedBrand[i].posId);

                $A.createComponent(
                    "c:SBP_POSItemCmp", {
                        "staticResourceName": staticResourceURL,
                        "premiseType": posItemsSelectedBrand[i].premiseType,
                        "state": posItemsSelectedBrand[i].state,
                        "helpText": posItemsSelectedBrand[i].helpText,
                        "itemText": posItemsSelectedBrand[i].itemText,
                        "aura:id": posItemsSelectedBrand[i].posId,
                        "posId": posItemsSelectedBrand[i].posId,
                        "showPosItems": component.getReference('v.showPosItems'),
                        "options": optionList,
                        "showTextOptions": showTextOptions,
                        "barrelId": component.get('v.barrelId'),
                        "inCommunityDetailPage": component.get('v.inCommunityDetailPage')
                    },
                    function(newProgramType, status, errorMessage) {
                        //Add the new button to the body array
                        if (status === "SUCCESS") {

                            body.push(newProgramType);
                            component.set("v.posItemBody", body);
                            //helper.toggleFadeIn(component, event, helper, programTypeAuraId);
                        } else if (status === "INCOMPLETE") {
                            console.log("No response from server or client is offline.")
                                // Show offline error
                        } else if (status === "ERROR") {
                            console.log("Error: " + errorMessage);
                            // Show error message
                        }
                    }
                );
                count++;
            }
        }

        component.set('v.posItemValidityMap', auraIds);
        component.set('v.availablePOSItemIds', availablePOSItemIds);
        component.set('v.posIdToMetaDataMap', posIdToMetaDataMap);
    },
    buildPosIdMap: function(component, event, helper) {
        var posItemsMap = component.get('v.posItemsMap');
        var posIdMap = {};

        for (var i in posItemsMap) {
            var brand = posItemsMap[i];
            for (var x in brand) {
                //console.log(brand[x].itemText);
                posIdMap[brand[x].itemText] = brand[x].itemText;
                if (brand[x].hasInsert) {
                    posIdMap[brand[x].itemText + '-INSERT'] = brand[x].itemText + '-INSERT';
                }
            }
        }
        component.set('v.posIdToItemNameMap', posIdMap);
    },
    generatePOSItemRecord: function(component, event, helper, posItemId) {
        var claimType = component.get('v.selectedClaimType');
        var claimMap = component.get('v.claimTypeMap');
        var fieldIdList = claimMap[claimType];
        var fieldAPIMap = component.get('v.fieldIdAPINameMap');
        var fieldValueMap = component.get('v.fieldIdValueMap');
        var parentId = component.get('v.barrelId');
        var parentCaseFields = component.get('v.parentCaseFields');

        var newPOSItemRecord = {
            'sobjectType': "POS_Customization__c"
        };

        for (var i in fieldIdList) {
            var fieldId = fieldIdList[i];
            var fieldValue = component.get('v.' + fieldValueMap[fieldId]);
            var fieldAPIName = fieldAPIMap[fieldId];
            newPOSItemRecord[fieldAPIName] = fieldValue;
        }
        // apply master purchase order and beam suntory order number to all cases
        for (var x in parentCaseFields) {
            var fieldId = parentCaseFields[x];

            var fieldValue = component.get('v.' + fieldId);
            var fieldAPIName = fieldAPIMap[x];
            newPOSItemRecord[fieldAPIName] = fieldValue;
        }
        return newPOSItemRecord;
    },
    /*getRelatedSplitBarrelRecords: function(component, event, helper) {
        var splitBarrelIds = component.get('v.splitBarrelIds');
        var action = component.get("c.getRelatedSplitBarrels");

        action.setParams({
            "barrelId": component.get('v.barrelId'),
            "splitBarrelIds": splitBarrelIds
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    var responseMap = retVal['responseMap'];
                    console.log('----------------------------- ', responseMap);
                    console.log('isEmpty ', helper.isEmpty(responseMap['splitBarrel']));
                    if (!helper.isEmpty(responseMap['splitBarrel'])) {
                        component.set('v.currentDistributor', responseMap['splitBarrel'].Distributor__r.Name);
                        component.set('v.splitBarrelId', responseMap['splitBarrel'].Id);
                        component.set('v.splitBarrelIds', responseMap['splitBarrelIds']);
                        resolve(responseMap);
                    }
                    if (helper.isEmpty(responseMap['splitBarrelIds'])) {
                        component.set('v.addSplitBarrel', false);
                    } else {
                        component.set('v.addSplitBarrel', true);
                    }


                } else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            reject(Error("Error message: " + errors[0].message));
                        }
                    } else {
                        reject(Error("Unknown error"));
                    }
                }
            });
            $A.enqueueAction(action);
        });
    },
    */
    isEmpty: function(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    },
    defaultValidity: function(component, event, helper) {
        var posItemValidityMap = component.get('v.posItemValidityMap');
        posItemValidityMap['pos_items'] = false;

        component.set('v.posItemValidityMap', posItemValidityMap);
    },
    setValidityToTrue: function(component, event, helper, auraId) {
        var posItemValidityMap = component.get('v.posItemValidityMap');
        posItemValidityMap[auraId] = true;

        component.set('v.posItemValidityMap', posItemValidityMap);

    },
    addAccountDetailsToPosItem: function(component, event, helper) {
        var selectedItemsMap = component.get('v.selectedItemsMap');
        var shippingInfo = component.get('v.shippingSameAsDistributor');
        var distributorRecord = component.get('v.distributorRecord');
        var rows = Object.keys(selectedItemsMap);


        for (var i in rows) {

            var currentRow = rows[i];
            console.log('ROW ------------- ', currentRow);
            if (!shippingInfo) {

                selectedItemsMap[currentRow]['Attention__c'] = component.get('v.attentionVal');
                selectedItemsMap[currentRow]['Company__c'] = component.get('v.companyVal');
                selectedItemsMap[currentRow]['Street__c'] = component.get('v.streetVal');
                selectedItemsMap[currentRow]['City__c'] = component.get('v.cityVal');
                selectedItemsMap[currentRow]['Country__c'] = component.get('v.countryVal');
                selectedItemsMap[currentRow]['State__c'] = component.get('v.stateVal');
                selectedItemsMap[currentRow]['Zip__c'] = component.get('v.zipVal');
                selectedItemsMap[currentRow]['Phone__c'] = component.get('v.phoneVal');
                selectedItemsMap[currentRow]['IO_Code__c'] = component.get('v.IOCode');
            } else {
                selectedItemsMap[currentRow]['Attention__c'] = distributorRecord['Attention__c'];
                selectedItemsMap[currentRow]['Company__c'] = distributorRecord['Name'];
                selectedItemsMap[currentRow]['Street__c'] = distributorRecord['BillingStreet'];
                selectedItemsMap[currentRow]['City__c'] = distributorRecord['BillingCity'];
                selectedItemsMap[currentRow]['Country__c'] = distributorRecord['BillingCountry'];
                selectedItemsMap[currentRow]['State__c'] = distributorRecord['BillingState'];
                selectedItemsMap[currentRow]['Zip__c'] = distributorRecord['BillingPostalCode'];
                selectedItemsMap[currentRow]['Phone__c'] = distributorRecord['Phone'];
                selectedItemsMap[currentRow]['IO_Code__c'] = component.get('v.IOCode');

            }
      
        }
        component.set('v.selectedItemsMap', selectedItemsMap);

    },
    addRemovePosItem: function(component, event, helper, posMap) {
        var selectedItemsMap = component.get('v.selectedItemsMap');
        var posIdToItemNameMap = component.get('v.posIdToItemNameMap');
        var item = posMap.auraId;
        var posId = posMap.posId;
        var isInsert = posMap.isInsert;
        var action = posMap.action;
        var getInsertTextFrom = posMap.getInsertTextFrom;

        if (isInsert) {
            item = item + '-INSERT';
        }

        if (action === 'INSERT') {
            if (!selectedItemsMap.hasOwnProperty(posId)) {
                selectedItemsMap[posId] = {};
                selectedItemsMap[posId]['Type__c'] = posIdToItemNameMap[item];
                selectedItemsMap[posId]['Get_Insert_Text_From__c'] = getInsertTextFrom;
                
                if (getInsertTextFrom == 'Bottle Label Text') {
                    selectedItemsMap[posId]['Insert_Text__c'] = component.get('v.labelText');
                }
                
			
            } else {
                selectedItemsMap[posId]['Type__c'] = posIdToItemNameMap[item];
                selectedItemsMap[posId]['Get_Insert_Text_From__c'] = getInsertTextFrom;
               
                if (getInsertTextFrom == 'Bottle Label Text') {
                    selectedItemsMap[posId]['Insert_Text__c'] = component.get('v.labelText');
                }
            }
            
        } else if (action === 'DELETE') { 
            if (selectedItemsMap.hasOwnProperty(posId)) {
                delete selectedItemsMap[posId];
            }
        }
		console.log('--selectedItemsMap--', JSON.stringify(Object.values(component.get('v.selectedItemsMap'))));
        component.set('v.selectedItemsMap', selectedItemsMap);

    },
    setBarrelIdBasedOnType: function(component, event, helper, posItemObj) {
        var posParentField = component.get('v.posParentField');
        posItemObj[posParentField] = component.get('v.recordId');

        return posItemObj;
    },
    insertItems: function(component, event, helper) {
        //var selectedItemsMap = component.get('v.selectedItemsMap');
        var posCustomMetadataToRecordId = component.get('v.posCustomMetadataToRecordId');
        var action = component.get("c.insertPOSItems");

        helper.addAccountDetailsToPosItem(component, event, helper);
        console.log('posItems ', JSON.stringify(Object.values(component.get('v.selectedItemsMap'))));
        console.log('programType ', component.get('v.programType'));
        console.log('splitBarrelId ', component.get('v.splitBarrelId'));

        action.setParams({
            "posItems": JSON.stringify(Object.values(component.get('v.selectedItemsMap'))),
            "recordId": component.get('v.recordId')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    console.log('POS items created: ', response.getReturnValue());
                    var retVal = response.getReturnValue();
                    resolve(retVal);

                } else if (state === "ERROR") {

                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            reject(Error("Error message: " + errors[0].message));
                        }
                    } else {
                        reject(Error("Unknown error"));
                    }
                }
            });
            $A.enqueueAction(action);
        });
    },
    getDistributor: function(component, event, helper) {
        var action = component.get("c.getDistributorRecord");

        action.setParams({
            "recordId": component.get('v.recordId')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var requestObject = response.getReturnValue();
                    resolve(requestObject['responseMap']);

                } else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            reject(Error("Error message: " + errors[0].message));
                        }
                    } else {
                        reject(Error("Unknown error"));
                    }
                }
            });
            $A.enqueueAction(action);
        });
    },
    setAllPosItemsValidity: function(component, event, helper) {
        var availablePOSItemIds = component.get('v.availablePOSItemIds');
        var posItemValidityMap = component.get('v.posItemValidityMap');

        for (var i in availablePOSItemIds) {
            posItemValidityMap[availablePOSItemIds[i]] = false;
        }

        component.set('v.posItemValidityMap', posItemValidityMap);
    },
    showSpinner: function(component, event, helper) {
        var spinner = component.find("pos_spinner");
        $A.util.addClass(spinner, "slds-show");
        $A.util.removeClass(spinner, "slds-hide");
    },
    hideSpinner: function(component, event, helper) {
        var spinner = component.find("pos_spinner");
        $A.util.addClass(spinner, "slds-hide");
        $A.util.removeClass(spinner, "slds-show");
    },
    showNotice: function(component, event, helper, type, message, title) {
        component.find('pos_prompt').showNotice({
            "variant": type,
            "header": title,
            "message": message
        });
    },
    pageDoneRendering: function(component, event, helper) {
        helper.hideSpinner(component, event, helper);
        component.set('v.doneRendering', true);

    },
    isEmpty: function(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    },

    showToast: function(message, title, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type,
            "mode": "dismissible"
        });
        toastEvent.fire();
    },
    getRecordInfo: function(component, event, helper) {
        var action = component.get("c.getRecordDetails");

        action.setParams({
            "recordId": component.get('v.recordId')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    console.log('record info: ', response.getReturnValue());
                    var retVal = response.getReturnValue();
                    resolve(retVal['responseMap']);

                } else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            reject(Error("Error message: " + errors[0].message));
                        }
                    } else {
                        reject(Error("Unknown error"));
                    }
                }
            });
            $A.enqueueAction(action);
        });
    },
    validateAuraIdMap: function(component, event, helper) {
        var auraIdMap = component.get('v.posItemValidityMap');
        var missingItems = false;

        var ids = Object.keys(auraIdMap);
        console.log('ids ' + ids);

        for (var i in ids) {
            console.log(auraIdMap[ids[i]]);
            if (!auraIdMap[ids[i]]) {
                missingItems = true;
                break;
            }
        }
        return missingItems;
    },
    validatePOSItemsHaveBeenSelected: function(component, event, helper) {
        console.log('validating pos Item info');
        var posItemOptionSelected = component.get('v.posItemOptionSelected');
        // check if the bottle plate option was selected 
        var posItemsMissing = helper.validateAuraIdMap(component, event, helper);

        if (!posItemsMissing && posItemOptionSelected) {
            return true;
        } else {
            if (!posItemOptionSelected) {
                helper.showToast('Please select whether or not you are ready to enter POS Items', 'Error', 'error');
            } else if (posItemsMissing) {
                helper.showToast('Please make a selection for each POS Item and try again.', 'Error', 'error');
            }

            return false;
        }
    },
    validateShippingInfo: function(component, event, helper) {
        var shippingInfoSelected = component.get('v.shippingInfoSelected');
        var posItemOptionSelected = component.get('v.posItemOptionSelected');
        var shippingSameAsDistributor = component.get('v.shippingSameAsDistributor');
        var showPosItems = component.get('v.showPosItems');

        if (showPosItems) {
            if (!shippingSameAsDistributor || (!shippingInfoSelected && posItemOptionSelected && showPosItems)) {
                if (!shippingInfoSelected) {
                    helper.showToast('Please select your shipping destination', 'Error', 'error');
                } else if (!shippingSameAsDistributor) {
                    var isValid = component.find('inputField').reduce(function(validSoFar, inputCmp) {
                        inputCmp.showHelpMessageIfInvalid();
                        return validSoFar && !inputCmp.get('v.validity').valueMissing;
                    }, true);

                    if (!isValid) {
                        helper.showToast('Please update the invalid form entries and try again.', 'Error', 'error');
                        return false;
                    } else {
                        return true;
                    }
                }
            } else if (shippingInfoSelected && posItemOptionSelected && showPosItems) {
                return true;
            }
        } else {
            return true;
        }


    },    
    validateIOCodeHasBeenEntered: function(component, event, helper){
        console.log('---IO Code---',ioCodeVal);
        var ioCodeVal = component.get('v.IOCode');
        var brand = component.get('v.currentBrand');
        
        var itemSelectedCount = helper.checkSelectedItemsMapSize(component, event, helper);
        if(itemSelectedCount<1){
            return true;
        }
        else if(brand == 'Makers Mark' && itemSelectedCount>0 && (ioCodeVal == '' || ioCodeVal == null)){
            helper.showToast('Please enter IO Code', 'Error', 'error');
            return false;
        }
        return true;
    },
    isPageValid: function(component, event, helper) {
        var isValid = true;
        var isShippingValid = helper.validateShippingInfo(component, event, helper);
        var isPosItemsValid = helper.validatePOSItemsHaveBeenSelected(component, event, helper);
        var hasIOCodeEntered = helper.validateIOCodeHasBeenEntered(component, event, helper);
 
        console.log('Shipping Information is Valid: ', isShippingValid);
        console.log('POS Item Information is Valid:', isPosItemsValid);
        console.log('IO Code Information has been required and Entered:', hasIOCodeEntered);

        if (!isShippingValid) {
            isValid = false;
        }
        if (!isPosItemsValid) {
            isValid = false;
        }        
        if(!hasIOCodeEntered){
            isValid = false;
        }

        return isValid;
    },
    checkSelectedItemsMapSize: function(component, event, helper) {
        var myMap= component.get("v.selectedItemsMap");
        var count = 0;
        var i;
        for (i in myMap){
            if(myMap.hasOwnProperty(i)){
                count++;
            }
        }
        return count;  
    },
    resetValues: function(component, event, helper) {
        component.set('v.shippingInfoSelected', false);
    },
    convertRegion: function(input, to) {
        const TO_NAME = 1;
        const TO_ABBREVIATED = 2;

        var states = [
            ['Alabama', 'AL'],
            ['Alaska', 'AK'],
            ['American Samoa', 'AS'],
            ['Arizona', 'AZ'],
            ['Arkansas', 'AR'],
            ['Armed Forces Americas', 'AA'],
            ['Armed Forces Europe', 'AE'],
            ['Armed Forces Pacific', 'AP'],
            ['California', 'CA'],
            ['Colorado', 'CO'],
            ['Connecticut', 'CT'],
            ['Delaware', 'DE'],
            ['District Of Columbia', 'DC'],
            ['Florida', 'FL'],
            ['Georgia', 'GA'],
            ['Guam', 'GU'],
            ['Hawaii', 'HI'],
            ['Idaho', 'ID'],
            ['Illinois', 'IL'],
            ['Indiana', 'IN'],
            ['Iowa', 'IA'],
            ['Kansas', 'KS'],
            ['Kentucky', 'KY'],
            ['Louisiana', 'LA'],
            ['Maine', 'ME'],
            ['Marshall Islands', 'MH'],
            ['Maryland', 'MD'],
            ['Massachusetts', 'MA'],
            ['Michigan', 'MI'],
            ['Minnesota', 'MN'],
            ['Mississippi', 'MS'],
            ['Missouri', 'MO'],
            ['Montana', 'MT'],
            ['Nebraska', 'NE'],
            ['Nevada', 'NV'],
            ['New Hampshire', 'NH'],
            ['New Jersey', 'NJ'],
            ['New Mexico', 'NM'],
            ['New York', 'NY'],
            ['North Carolina', 'NC'],
            ['North Dakota', 'ND'],
            ['Northern Mariana Islands', 'NP'],
            ['Ohio', 'OH'],
            ['Oklahoma', 'OK'],
            ['Oregon', 'OR'],
            ['Pennsylvania', 'PA'],
            ['Puerto Rico', 'PR'],
            ['Rhode Island', 'RI'],
            ['South Carolina', 'SC'],
            ['South Dakota', 'SD'],
            ['Tennessee', 'TN'],
            ['Texas', 'TX'],
            ['US Virgin Islands', 'VI'],
            ['Utah', 'UT'],
            ['Vermont', 'VT'],
            ['Virginia', 'VA'],
            ['Washington', 'WA'],
            ['West Virginia', 'WV'],
            ['Wisconsin', 'WI'],
            ['Wyoming', 'WY'],
        ];

        var provinces = [
            ['Alberta', 'AB'],
            ['British Columbia', 'BC'],
            ['Manitoba', 'MB'],
            ['New Brunswick', 'NB'],
            ['Newfoundland', 'NF'],
            ['Northwest Territory', 'NT'],
            ['Nova Scotia', 'NS'],
            ['Nunavut', 'NU'],
            ['Ontario', 'ON'],
            ['Prince Edward Island', 'PE'],
            ['Quebec', 'QC'],
            ['Saskatchewan', 'SK'],
            ['Yukon', 'YT'],
        ];

        console.log(input);

        var regions = states.concat(provinces);

        if (to == TO_ABBREVIATED) {
            input = input.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
            for (var region of regions) {
                if (region[0] == input) {
                    return (region[1]);
                }
            }
        } else if (to == TO_NAME) {
            input = input.toUpperCase();
            for (var region of regions) {
                if (region[1] == input) {
                    return (region[0]);
                }
            }
        }
    }
})