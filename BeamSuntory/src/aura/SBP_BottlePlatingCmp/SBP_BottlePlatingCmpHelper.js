({
    init: function(component, event, helper) {
        var recordId = component.get('v.recordId');
        console.log('RECORDID', recordId);
        var currentBrand = component.get('v.currentBrand');
        var getRecordInfoPromise = helper.getRecordInfo(component, event, helper);
        getRecordInfoPromise.then(
            $A.getCallback(function(result) {
                console.log('record info ', result);
                component.set('v.state', result['state']);
                component.set('v.premiseType', result['premiseType']);
                if(result['state'] == 'NY' || result['state'] == 'New York' || 
                   result['state'] == 'OR' || result['state'] == 'Oregon'){
                    component.set('v.checkNYOR',true);
                    component.set('v.labelText','Privately Selected');
                }
                console.log('State Check:::',component.get('v.checkNY'));
                var getDistributorPromise = helper.getDistributor(component, event, helper);
                return getDistributorPromise;

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                alert('An error occurred getting events : ' + error.message);
            })
        ).then(
            $A.getCallback(function(result) {

                component.set('v.distributorRecord', result);
                var getBottleLabelPromise = helper.getBottlingLabelImages(component, event, helper);
                return getBottleLabelPromise;

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        ).then(
            $A.getCallback(function(result) {
                console.log('bottle Map: ', result);
                component.set('v.bottleLabelMap', result);
                helper.getStaticResources(component, event, helper);
                helper.setStaticResourceByBrand(component, event, helper);

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        ).catch(function(error) {
            $A.reportError("error message here", error);
        });
    },
    getBottlingLabelImages: function(component, event, helper) {
        var action = component.get("c.getBottleLabelImages");
        var stateVal = component.get('v.state');
        console.log('State: ', stateVal);
        action.setParams({
            "state": component.get('v.state')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var requestObject = response.getReturnValue();
                    var responseMap = requestObject['responseMap']['bottleLabelMap'];
                    console.log('bottle label map>>>>', responseMap);

                    resolve(requestObject['responseMap']['bottleLabelMap']);

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
    getStaticResources: function(component, event, helper) {
        var bottleLabelMap = component.get('v.bottleLabelMap');
        var currentBrand = component.get('v.currentBrand');

        for (var i in bottleLabelMap) {
            console.log('bottleLabelMap[i]', bottleLabelMap[i]);
            console.log('i ', i);
            var bottleImageURL = $A.get('$Resource.' + bottleLabelMap[i].bottleImageName);
            var bottleLabelURL = $A.get('$Resource.' + bottleLabelMap[i].bottleLabel);
            bottleLabelMap[i].bottleImageURL = bottleImageURL;
            bottleLabelMap[i].bottleLabelURL = bottleLabelURL;
        }

        component.set('v.bottleLabelMap', bottleLabelMap);

    },
    setStaticResourceByBrand: function(component, event, helper) {
        var bottleLabelMap = component.get('v.bottleLabelMap');
        var currentBrand = component.get('v.currentBrand');
        var currentFlavour = component.get('v.flavour');
        console.log('brand:::', currentBrand);
        console.log('map bottle Image:::',bottleLabelMap[currentBrand].bottleImageURL);
        console.log('map bottle Label:::',bottleLabelMap[currentBrand].bottleLabelURL);
        console.log('currentFlavour::::',currentFlavour);
		
        //Added for SR_127060 - Final Update - Knob Creek Labels starts
        if(currentBrand=='Knob Creek'){
			if(currentFlavour=='Rye'){
                currentBrand='Knob Creek Rye';
            }
        }
        //Added for SR_127060 - Final Update - Knob Creek Labels ends
        
        component.set('v.bottleImage', bottleLabelMap[currentBrand].bottleImageURL);
        component.set('v.bottleLabelImage', bottleLabelMap[currentBrand].bottleLabelURL);
       
    },
    validateBottlePlateText: function(component, event, helper) {
        var labelText = component.get('v.labelText');
        var bottlePlateValidityMap = component.get('v.bottlePlateValidityMap');

        if ($A.util.isEmpty(labelText)) {
            bottlePlateValidityMap['bottle_plate_text'] = false;
        } else {
            bottlePlateValidityMap['bottle_plate_text'] = true;
        }

        component.set('v.bottlePlateValidityMap', bottlePlateValidityMap);
    },
    removeBottlePlateTextFromMap: function(component, event, helper) {
        var labelText = component.get('v.labelText');
        var bottlePlateValidityMap = component.get('v.bottlePlateValidityMap');

        delete bottlePlateValidityMap['bottle_plate_text'];

        component.set('v.bottlePlateValidityMap', bottlePlateValidityMap);
    },
    defaultValidity: function(component, event, helper) {
        var bottlePlateValidityMap = component.get('v.bottlePlateValidityMap');
        var bottle_plate = component.get('v.bottle_plate');
        bottlePlateValidityMap['bottle_plate'] = false;

        component.set('v.bottlePlateValidityMap', bottlePlateValidityMap);
    },
    setValidityToTrue: function(component, event, helper, auraId) {
        var bottlePlateValidityMap = component.get('v.bottlePlateValidityMap');
        bottlePlateValidityMap[auraId] = true;

        component.set('v.bottlePlateValidityMap', bottlePlateValidityMap);
    },
    getDistributor: function(component, event, helper) {
        var action = component.get("c.getDistributorRecord");
        console.log('RECORDID', component.get("v.recordId"));

        action.setParams({
            "recordId": component.get('v.recordId')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    console.log('get Dist >>>>>>>>>>>>>>>>>>>>>>> ', response.getReturnValue());
                    var retVal = response.getReturnValue();
                    resolve(retVal['responseMap']['account']);

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
    setBarrelIdBasedOnType: function(component, event, helper, posItemObj) {
        var programType = component.get('v.programType');
        if (programType == 'Split Barrel') {
            posItemObj['Case__c'] = component.get('v.splitBarrelId');
        } else {
            posItemObj['Barrel__c'] = component.get('v.barrelId');
        }

        return posItemObj;
    },
    insertBottlePlateDetails: function(component, event, helper) {
        var action = component.get("c.insertPOSItems");
        var labels = component.get('v.labels');
        var splitLabel = component.get('v.splitLabel');
        var posItems;
        if (splitLabel == 'Yes') {
            helper.addSplitLabelText(component, event, helper);
            posItems = labels;
        } else {
            helper.addBottlePlateText(component, event, helper);
            helper.addAccountDetailsToPosItem(component, event, helper);
            posItems = Object.values(component.get('v.selectedItemsMap'));
        }
        console.log('json ', JSON.stringify(posItems));
        action.setParams({
            "posItems": JSON.stringify(posItems),
            "recordId": component.get('v.recordId')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    console.log('Bottle Plate >>>>>>>>>>>>>>>>>>>>>>> ', response.getReturnValue());
                    var retVal = response.getReturnValue();
                    resolve(retVal);

                } else if (state === "ERROR") {
                    var errors = response.getError();
                    console.log(errors);
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
            } else {
                selectedItemsMap[currentRow]['Attention__c'] = distributorRecord['Attention__c'];
                selectedItemsMap[currentRow]['Company__c'] = distributorRecord['Name'];
                selectedItemsMap[currentRow]['Street__c'] = distributorRecord['BillingStreet'];
                selectedItemsMap[currentRow]['City__c'] = distributorRecord['BillingCity'];
                selectedItemsMap[currentRow]['Country__c'] = distributorRecord['BillingCountry'];
                selectedItemsMap[currentRow]['State__c'] = distributorRecord['BillingState'];
                selectedItemsMap[currentRow]['Zip__c'] = distributorRecord['BillingPostalCode'];
                selectedItemsMap[currentRow]['Phone__c'] = distributorRecord['Phone'];

            }
        }
        component.set('v.selectedItemsMap', selectedItemsMap);
    },



    addRemovePosItem: function(component, event, helper, item, action) {
        var selectedItemsMap = component.get('v.selectedItemsMap');
        var staveSelectionOnBackLabel;
        var signatureOnBackLabel;

        if (component.get('v.staveSelectionOnBackLabel') == 'No') {
            staveSelectionOnBackLabel = false;
        } else {
            staveSelectionOnBackLabel = true;
        }
        if (component.get('v.signatureOnBackLabel') == 'No') {
            signatureOnBackLabel = false;
        } else {
            signatureOnBackLabel = true;
        }


        if (action === 'INSERT') {
            if (!selectedItemsMap.hasOwnProperty(item)) {
                selectedItemsMap[item] = {};
                selectedItemsMap[item]['Type__c'] = item;
                selectedItemsMap[item]['Insert_Text__c'] = component.get('v.labelText');
                selectedItemsMap[item]['Include_Signature_on_Label__c'] = signatureOnBackLabel;
                selectedItemsMap[item]['Include_Stave_Selection_on_Label__c'] = staveSelectionOnBackLabel;
            } else {
                selectedItemsMap[item]['Insert_Text__c'] = component.get('v.labelText');
                selectedItemsMap[item]['Type__c'] = item;
                selectedItemsMap[item]['Include_Signature_on_Label__c'] = signatureOnBackLabel;
                selectedItemsMap[item]['Include_Stave_Selection_on_Label__c'] = staveSelectionOnBackLabel;
            }

        } else if (action === 'DELETE') {
            if (selectedItemsMap.hasOwnProperty(item)) {
                delete selectedItemsMap[item];
            }
        }

        component.set('v.selectedItemsMap', selectedItemsMap);

    },
    addBottlePlateText: function(component, event, helper) {
        var selectedItemsMap = component.get('v.selectedItemsMap');

        if (selectedItemsMap.hasOwnProperty('Bottle Plate Text')) {
            selectedItemsMap['Bottle Plate Text']['Insert_Text__c'] = component.get('v.labelText');
        }

        component.set('v.selectedItemsMap', selectedItemsMap);
    },
    addSplitLabelText: function(component, event, helper) {
        var selectedItemsMap = component.get('v.selectedItemsMap');
        var runningTotalMap = component.get('v.runningTotalMap');
        var labels = component.get('v.labels');
        var distributorRecord = component.get('v.distributorRecord');
        var shippingInfo = component.get('v.shippingSameAsDistributor');
        var bottlePlateRecord = {};

        if (!helper.isEmpty(runningTotalMap)) {
            console.log(JSON.stringify(runningTotalMap));
            var keys = Object.keys(runningTotalMap);
            for (var i in keys) {

                if (!shippingInfo) {
                    bottlePlateRecord = {
                        'Type__c': 'Bottle Plate Text',
                        'Insert_Text__c': runningTotalMap[keys[i]].text,
                        'Quantity__c': runningTotalMap[keys[i]].quantity,
                        'Attention__c': component.get('v.attentionVal'),
                        'Company__c': component.get('v.companyVal'),
                        'Street__c': component.get('v.streetVal'),
                        'City__c': component.get('v.cityVal'),
                        'Country__c': component.get('v.countryVal'),
                        'State__c': component.get('v.stateVal'),
                        'Zip__c': component.get('v.zipVal'),
                        'Phone__c': component.get('v.phoneVal')
                    }
                } else {

                    bottlePlateRecord = {
                        'Type__c': 'Bottle Plate Text',
                        'Insert_Text__c': runningTotalMap[keys[i]].text,
                        'Quantity__c': runningTotalMap[keys[i]].quantity,
                        'Attention__c': distributorRecord['Attention__c'],
                        'Company__c': distributorRecord['Name'],
                        'Street__c': distributorRecord['BillingStreet'],
                        'City__c': distributorRecord['BillingCity'],
                        'Country__c': distributorRecord['BillingCountry'],
                        'State__c': distributorRecord['BillingState'],
                        'Zip__c': distributorRecord['BillingPostalCode'],
                        'Phone__c': distributorRecord['Phone']
                    }
                }
                labels.push(bottlePlateRecord);
            }
            component.set('v.labels', labels);
        }

    },
    showNotice: function(component, event, helper, type, message, title) {
        component.find('bottle_plate_prompt').showNotice({
            "variant": type,
            "header": title,
            "message": message
        });
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

    validateRemainingAmount: function(component, event, helper) {
        var casesRemaining = component.get('v.casesRemaining');
        if (casesRemaining < 0) {
            helper.showToast('Please review your selections ', 'Error', 'error');
            return false;
        } else {
            return true;
        }
    },
    isEmpty: function(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    },
    handleClearOutSplitLabels: function(component, event, helper) {
        var splitLabelContainer = component.find('split_label');
        splitLabelContainer.clearOutCmpBody();
    },
    createSplitLabelCmp: function(component, event, helper) {
        var body = component.get("v.splitLabelBody");
        // clear out body
        // other methods of destorying the components did not work
        while (body.length > 0) {
            body.pop();
        }


        $A.createComponent(
            "c:SBP_SplitLabelContainerCmp", {
                "labelsRemaining": component.getReference('v.labelsRemaining'),
                "splitLabelLimit": component.getReference('v.splitLabelLimit'),
                "splitLabelCount": component.getReference('v.splitLabelCount'),
                "brand": component.getReference('v.currentBrand'),
                "recordId": component.getReference('v.recordId'),
                "runningMaxLabelsAvailable": component.getReference('v.runningMaxLabelsAvailable'),
                "aura:id": 'split_label',
                "runningTotalMap": component.getReference('v.runningTotalMap')
            },
            function(labelCmp, status, errorMessage) {
                //Add the new button to the body array
                if (status === "SUCCESS") {

                    body.push(labelCmp);
                    component.set("v.splitLabelBody", body);
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
    },
    validateAuraIdMap: function(component, event, helper) {
        var auraIdMap = component.get('v.bottlePlateValidityMap');
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
    
    validateBottlePlateHasBeenEntered: function(component, event, helper) {
        console.log('validating bottle plate info');

        var bottlePlatingOptionSelected = component.get('v.bottlePlatingOptionSelected');
        var showBottlePlating = component.get('v.showBottlePlating');
        var labelText = component.get('v.labelText');
        var splitLabel = component.get('v.splitLabel');
        var brand = component.get('v.currentBrand');
        var state = component.get('v.state');
        // check if the bottle plate option was selected 
        //var bottlePlateMissing = helper.validateAuraIdMap(component, event, helper);
        if (bottlePlatingOptionSelected &&
            (!showBottlePlating || splitLabel == 'Yes' || (showBottlePlating &&
                labelText != '' && labelText != null))) {
            return true;
        } else {
            if (bottlePlatingOptionSelected && showBottlePlating && (labelText == '' || labelText == null)) {
                if (brand == 'Makers Mark' && (state == 'NY' || state == 'New York' || state == 'OR' || state == 'Oregon')) {
                    return true;
                } else {
                    helper.showToast('Please enter label text', 'Error', 'error');
                }

            }
            if (!bottlePlatingOptionSelected) {
                helper.showToast('Please select whether or not you are ready to enter Bottle Label Details', 'Error', 'error');
            }
            return false;
        }
    },
    validateSplitLabels: function(component, event, helper) {
        console.log('validating split label info');

        var splitLabel = component.get('v.splitLabel');
        var labelText = component.get('v.labelText');
        var splitLabelContainer = component.find('split_label');
        var splitLabelCount = component.get('v.splitLabelCount');
        var labelsRemaining = component.get('v.labelsRemaining');
        var splitLabelsMissingItems;
        // check if the bottle plate option was selected 
        if (splitLabelContainer != undefined) {
            splitLabelsMissingItems = splitLabelContainer.validateSplitLabels();
        } else {
            splitLabelsMissingItems = true;
        }
        console.log(splitLabelsMissingItems);

        if (splitLabel == 'No') {
            return true;
        }

        if (!splitLabelsMissingItems && splitLabel == 'Yes' && splitLabelCount > 0 && labelsRemaining == 0) {
            return true;
        } else {
            if (splitLabelsMissingItems) {
                helper.showToast('Please enter missing split label information', 'Error', 'error');
            }
            if (splitLabelCount == 0) {
                helper.showToast('Please enter at least one split label', 'Error', 'error');
            }
            if (labelsRemaining > 0) {
                helper.showToast('All of the available labels have to be allocated', 'Error', 'error');
            }

            return false;
        }
    },
    isPageValid: function(component, event, helper) {
        var brand = component.get('v.currentBrand'); 
        var isValid = true;
        if (!helper.validateBottlePlateHasBeenEntered(component, event, helper)) {
            isValid = false;
        }
        if (!helper.validateSplitLabels(component, event, helper)) {
            isValid = false;
        }
        return isValid;
    },
    resetValues: function(component, event, helper) {
        component.set('v.shippingInfoSelected', false);
    },
    handleSplitLabels: function(component, event, helper) {
        var splitLabelContainer = component.find('split_label');

        splitLabelContainer.validateSplitLabels();
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

})