({
    init: function(component, event, helper) {
        helper.init(component, event, helper);

        var brand = component.get('v.currentBrand');
        var characterLimitMap = component.get('v.characterLimitMap');

        component.set('v.characterLimit', characterLimitMap[brand]);
        component.set('v.remainingCharacters', characterLimitMap[brand]);
    },
    toggleBottlePlating: function(component, event, helper) {
        var bottlePlatingRadioVal = component.get('v.bottlePlatingRadioVal');
        var state = component.get('v.state');
        component.set('v.bottlePlatingOptionSelected', true);


        if (bottlePlatingRadioVal == 'Yes') {
            component.set('v.showBottlePlating', true);

            helper.validateBottlePlateText(component, event, helper);
            helper.setValidityToTrue(component, event, helper, 'bottle_plate');
            helper.addRemovePosItem(component, event, helper, 'Bottle Plate Text', 'INSERT');  
            var brand = component.get('v.currentBrand');
            if(brand == 'Knob Creek'){
            var message = 'Only the Account Name should be entered for the labels and once the information is submitted, we are not able to change it later. ';
            helper.showNotice(component, event, helper, 'warning', message, 'Warning');
            }

        } else {
            helper.setValidityToTrue(component, event, helper, 'bottle_plate');
            helper.removeBottlePlateTextFromMap(component, event, helper);
            helper.addRemovePosItem(component, event, helper, 'Bottle Plate Text', 'DELETE');
            component.set('v.showBottlePlating', false);
            var message = 'If you do not enter Bottle Plate text at this time, you will have up to 2 weeks to complete Bottle Text entry or be at risk of having this order canceled.  If Bottle Plate details are being provided after the selection the order will be delayed.';
            helper.showNotice(component, event, helper, 'warning', message, 'Warning');
        }
    },
    handleInputChange: function(component, event, helper) {
        var outputLabel;
        var brand = component.get('v.currentBrand');
        if (brand == 'Knob Creek') {
            outputLabel = component.find('knob_creek_label');
        } else if (brand == 'Makers Mark') {
            outputLabel = component.find('makers_mark_label');
        } else if (brand == 'El Tesoro') {
            outputLabel = component.find('el_tesoro_label');
        }
        //var bottleLabel = component.find('bottle-plate-label');
        //var bottleLabelVal = bottleLabel.get('v.value');
        var labelText = component.get('v.labelText');
        var characterLimit = component.get('v.characterLimit');
        var remainingCharacters = characterLimit - component.find('bottle-plate-label').get('v.value').length;
        component.set('v.remainingCharacters', remainingCharacters);
        var currentHeight = outputLabel.getElement().clientHeight;
        var previousHeight = component.get('v.previousHeight');
        var textBeforeHeightChange = component.get('v.textBeforeHeightChange');
        var textBeforeHeightChangeLength = component.get('v.textBeforeHeightChangeLength');
   
        // if height changes then store that value until that value is reached again
        if ((textBeforeHeightChange == undefined || textBeforeHeightChange == null) && labelText.length > 1) {
            if (previousHeight < currentHeight && previousHeight != 0) {
                component.set('v.textBeforeHeightChange', labelText);
                component.set('v.textBeforeHeightChangeLength', labelText.length);
                $A.util.addClass(outputLabel, 'medium-font');
                $A.util.removeClass(outputLabel, 'standard-font');
            }
        } else if (textBeforeHeightChange != undefined && textBeforeHeightChange != null && textBeforeHeightChange != '' && labelText.length > 1) {
            if (labelText.length == textBeforeHeightChangeLength - 1) {
                component.set('v.textBeforeHeightChange', null);
                component.set('v.textBeforeHeightChangeLength', 0);
            } else if (labelText.length == textBeforeHeightChangeLength) {
                $A.util.removeClass(outputLabel, 'medium-font');
                $A.util.addClass(outputLabel, 'standard-font');
            }
        }

        helper.validateBottlePlateText(component, event, helper);
        component.set('v.previousHeight', currentHeight);
    },

    handleMakersMarkInputChange: function(component, event, helper) {
        var labelText = component.get('v.labelText');
        var characterLimit = component.get('v.characterLimit');
        var remainingCharacters = characterLimit - labelText.length;

        helper.validateBottlePlateText(component, event, helper);

        component.set('v.remainingCharacters', remainingCharacters);
    },
    insertBottlePlateDetails: function(component, event, helper) {
        var params = event.getParam('arguments');
        var callback;
        if (params) {
            callback = params.callback;
        }

        var isPageValid = helper.isPageValid(component, event, helper);

        if (isPageValid) {

            var insertBottlePlateDetailsPromise = helper.insertBottlePlateDetails(component, event, helper);
            insertBottlePlateDetailsPromise.then(
                $A.getCallback(function(result) {
                    if (callback) {
                        console.log('inserted bottle plate ', result);
                        callback(result['success']);
                    }
                }),
                $A.getCallback(function(error) {
                    // Something went wrong
                    var message = 'Please Contact Your System Administrator: \n\n';
                    helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
                })
            )
        }
    },
    handleAddLabel: function(component, event, helper) {
        var splitLabelContainer = component.find('split_label');
        console.log(splitLabelContainer);
        if (splitLabelContainer) {
            splitLabelContainer.addLabel();
        }

    },

    toggleBottleSplitLabels: function(component, event, helper) {
        var splitLabel = component.get('v.splitLabel');
        var runningTotalMap = component.get('v.runningTotalMap');

        if (splitLabel == 'Yes') {

            helper.validateBottlePlateText(component, event, helper);
            helper.setValidityToTrue(component, event, helper, 'bottle_plate');
            //helper.createSplitLabelCmp(component, event, helper);

        } else {
            helper.setValidityToTrue(component, event, helper, 'bottle_plate');
            helper.removeBottlePlateTextFromMap(component, event, helper);
            //helper.addRemovePosItem(component, event, helper, 'Bottle Plate Text', 'DELETE');
            helper.handleClearOutSplitLabels(component, event, helper);
            component.set('v.runningTotalMap', {});
            component.set('v.labelsRemaining', 40);
            component.set('v.runningMaxLabelsAvailable', 40);

        }
    },
    
    
})