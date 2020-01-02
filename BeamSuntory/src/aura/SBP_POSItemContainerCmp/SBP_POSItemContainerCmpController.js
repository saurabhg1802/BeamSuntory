({
    init: function(component, event, helper) {
        helper.init(component, event, helper);
    }, 
    handleSelectedPosItem: function(component, event, helper) {
        var posItemValidityMap = component.get('v.posItemValidityMap');
        var posIdToMetaDataMap = component.get('v.posIdToMetaDataMap');
        // event params
        var posMap = event.getParam('posMap');
        var insertText = posMap['insertText'];
        var posId = posMap['posId'];
        var selectedPosItem = posMap['auraId'];
        var action = posMap['action'];
        var isInsert = posMap['isInsert'];
    
        console.log('=====', posMap);

        console.log('POS Item selected ', selectedPosItem);
        console.log('action ', action);
        console.log('insert text: ', insertText);
    
        if (insertText == 'Bottle Label Text') {
            insertText = component.get('v.labelText');
        } else if (insertText == 'Account Name') {
            insertText = component.get('v.retailAccountName');
        }
        if (posIdToMetaDataMap[posId].defaultTextValue == 'Account Name') {
            posMap.getInsertTextFrom = 'Account Name';
        } else if (posIdToMetaDataMap[posId].defaultTextValue == 'Bottle Label Text') {
            posMap.getInsertTextFrom = 'Bottle Label Text';
        }
        console.log('default text val ', posMap.getInsertTextFrom);
        console.log('final insertText ', insertText);
        // if included then insert item
        if (action === 'INSERT') {
            helper.addRemovePosItem(component, event, helper, posMap);
            if (!posItemValidityMap[posId]) {
                posItemValidityMap[posId] = true;
            }

        } else if (action === 'DELETE') {
            helper.addRemovePosItem(component, event, helper, posMap);
            if (!posItemValidityMap[posId]) {
                posItemValidityMap[posId] = true;
            }
        }

        component.set('v.posItemValidityMap', posItemValidityMap);
    },
    togglePosDetails: function(component, event, helper) {
        var showPosItemsChecked = component.find('pos_items').get('v.value');
        component.set('v.posItemOptionSelected', true);

        if (showPosItemsChecked == 'Yes') {
            component.set('v.showPosItems', true);
            helper.setValidityToTrue(component, event, helper, 'pos_items');
            helper.setAllPosItemsValidity(component, event, helper);
        } else {
            component.set('v.showPosItems', false);
            component.set('v.posItemValidityMap', {});
            helper.resetValues(component, event, helper);

            var message = 'If you do not enter POS customizations at this time, you will have up to 2 weeks to complete POS customizations or be at risk of having this order canceled.';
            helper.showNotice(component, event, helper, 'warning', message, 'Warning');
        }
    },
    toggleShippingInformation: function(component, event, helper) {
        var shippingInfoVal = component.find('shipping_info').get('v.value');
        component.set('v.shippingInfoSelected', true);

        if (shippingInfoVal == 'Yes') {
            component.set('v.shippingSameAsDistributor', true);
        } else {
            component.set('v.shippingSameAsDistributor', false);
        }
    },
    insertPosItems: function(component, event, helper) {
        var params = event.getParam('arguments');
        var callback;
        if (params) {
            callback = params.callback;
        }

        var isPageValid = helper.isPageValid(component, event, helper);
        if (isPageValid) {
            var insertItemsPromise = helper.insertItems(component, event, helper);
            insertItemsPromise.then(
                $A.getCallback(function(result) {

                    if (callback) {
                        console.log('inserted pos items ', result);
                        callback(result['success']);
                    }
                }),
                $A.getCallback(function(error) {
                    // Something went wrong
                    var message = 'Please Contact Your System Administrator: \n\n';
                    helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
                })
            ).catch(function(error) {
                $A.reportError("error message here", error);
            });
        }

    },


})