({
    init: function(component, event, helper) {
        var recordId = component.get('v.recordId');
        console.log('RECORDID', recordId);
        var getBottleLabelPromise = helper.getBottlingLabelImages(component, event, helper);
        getBottleLabelPromise.then(
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
        console.log('brand, ', currentBrand);
        console.log(bottleLabelMap[currentBrand].bottleImageURL);
        console.log(bottleLabelMap[currentBrand].bottleLabelURL);

        component.set('v.bottleImage', bottleLabelMap[currentBrand].bottleImageURL);

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
                selectedItemsMap[currentRow]['Street__c'] = distributorRecord['ShippingStreet'];
                selectedItemsMap[currentRow]['City__c'] = distributorRecord['ShippingCity'];
                selectedItemsMap[currentRow]['Country__c'] = distributorRecord['ShippingCountry'];
                selectedItemsMap[currentRow]['State__c'] = distributorRecord['ShippingState'];
                selectedItemsMap[currentRow]['Zip__c'] = distributorRecord['ShippingPostalCode'];
                selectedItemsMap[currentRow]['Phone__c'] = distributorRecord['Phone'];

            }
        }
        component.set('v.selectedItemsMap', selectedItemsMap);
    },

    addRemovePosItem: function(component, event, helper, item, action) {
        var selectedItemsMap = component.get('v.selectedItemsMap');
        var staveSelectionOnBackLabel = component.get('v.staveSelectionOnBackLabel');
        var signatureOnBackLabel = component.get('v.signatureOnBackLabel');


        if (action === 'INSERT') {
            if (!selectedItemsMap.hasOwnProperty(item)) {
                selectedItemsMap[item] = {};
                selectedItemsMap[item]['Type__c'] = item;
                selectedItemsMap[item]['Include_Signature_on_Label__c'] = signatureOnBackLabel;
                selectedItemsMap[item]['Include_Stave_Selection_on_Label__c'] = staveSelectionOnBackLabel;
            } else {
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
    showNotice: function(component, event, helper, type, message, title) {
        component.find('bottle_plate_prompt').showNotice({
            "variant": type,
            "header": title,
            "message": message
        });
    },
    updateRemainingAmount: function(component, event, helper) {
        var runningTotalMap = component.get('v.runningTotalMap');

        var totalSplitLabelLimit = component.get('v.totalSplitLabelLimit');
        var allValues = Object.values(runningTotalMap);

        var allQuantities = allValues.map(function(value) {
            return value.quantity;
        });

        var total = allQuantities.reduce(function(acc, val) {
            if (isNaN(acc)) {
                acc = 0;
            }
            if (isNaN(val)) {
                val = 0;
            }
            return parseInt(acc, 10) + parseInt(val, 10);
        });

        if (isNaN(total)) {
            total = 0;
        }
        component.set('v.labelsRemaining', totalSplitLabelLimit - total);
        component.set('v.runningMaxLabelsAvailable', totalSplitLabelLimit - total);
    },
    firePassValueFieldEvent: function(component, event, helper, field, value, index,action) {
        // call the event   
        var compEvent = component.getEvent("passFieldValue");

        // set the Selected item attribute
        compEvent.setParams({
            "field": field,
            "value": value,
            "index": index,
            "action": action
        });
        // fire the event  
        compEvent.fire();

    },


})