({
    //This controller method runs on the Component init event.
    init: function(component, event, helper) {
        helper.init(component, event, helper);
        //Timeout on init to ensure no pre-styled markup from showing
        setTimeout(function() {
            component.set('v.isDoneRendering', true);
        }, 250);
    },

    //This controller method is triggered by clicking the "Add a Claim" button. This method opens the Claim Modal
    //and sets the Edit Mode flag to false, as we are "Adding" not "Editing"
    openAddClaimModal: function(component, event, helper) {
        helper.openModal(component, event, helper);
        helper.setEditModeOnAdd(component, event, helper);
    },

    //This controller method is triggered by clicking the "Edit" link under actions. The event parameter contains
    //the Id of the Case record that was clicked. This value is stored under the HTML data param data-record. This 
    //method opens the Claim Modal and sets the Edit Mode flag to true, as we are "Editing" not "Adding"
    openEditClaimModal: function(component, event, helper) {
        var claimId = event.currentTarget.dataset.record;
        component.set('v.editCaseId', claimId);
        helper.fillValuesOnEdit(component, event, helper);
        helper.openModal(component, event, helper);
        helper.setEditModeOnEdit(component, event, helper);
    },

    //This controller method is triggered by clicking the "Remove" link under actions. The event parameter contains
    //the Id of the Case record that was clicked. This value is stored under the HTML data param data-record. This
    //method makes a call to an Apex Controller method that deletes the Claim Case. This method also removes it from 
    //the local attributes 'claimsList' and 'claimsMap'
    removeClaim: function(component, event, helper) {
        var claimId = event.currentTarget.dataset.record;
        /*---SR_133623 New Code Added Start---*/
        var claimsMap = component.get('v.claimsMap');
        //var claimTypeMap = component.get('v.claimTypeMap');
        var claim = claimsMap[claimId];
        var claimType = claim.Type;
        var i = component.get("v.numberOfFreightClaims");
		console.log('---Remove Claim Type---',claimType);
        if(claimType == "Freight Claim"){
            i -= 1;
        }
        component.set('v.numberOfFreightClaims', i);
        console.log('---Number of Freight Claim Remaining---',component.get("v.numberOfFreightClaims"));
        /*---SR_133623 New Code Added End---*/
        helper.removeCase(component, event, helper, claimId);
    },

    //This controller method is triggered by clicking the "X" button at the top-right of the Claim Modal. This method
    //clears the values of the temporary value stores.
    closeModal: function(component, event, helper) {
        var noneLabel = component.get("v.fieldIdLabelMap").nonePicklist;
        helper.resetValidity(component, event, helper);
        helper.clearAllValues(component, event, helper);
        helper.closeModal(component, event, helper);
        component.set('v.editMode', null);
        component.set('v.editCaseId', null);
        component.set('v.selectedClaimType', noneLabel);

    },

    //This controller method is triggered by the "Add Claim" button within the Claim Modal. It first validates the current
    //inputs and creates a page message with any invalid fields. If there are no errors, the case is inserted and the modal
    //is closed
    addClaim: function(component, event, helper) {
        var none = component.get("v.fieldIdLabelMap").nonePicklist;

        var validity = helper.validateModalInput(component, event, helper);
        if (validity.hasErrors) {
            var fieldIdLabelMap = component.get('v.fieldIdLabelMap');
            var errorIdList = validity.errorIdList;
            var msg = 'The following fields have errors: ';
            var labelList = [];
            for (var i in errorIdList) {
                var field = component.find(errorIdList[i]);
                try {
                    field.showHelpMessageIfInvalid();
                } catch (err) {
                    //console.log(err);
                }
                labelList.push(fieldIdLabelMap[errorIdList[i]]);
            }
            msg += labelList.join(', ');
            helper.createUIMessageComponent(component, event, helper, 'error', 'Error', msg, 4000, true);
            console.log(errorIdList);
        } else {
            helper.closeModal(component, event, helper);
            helper.insertCase(component, event, helper);
            helper.updateParentCaseFields(component, event, helper);
            helper.unRenderAllFields(component, event, helper);
            helper.unRequireAllFields(component, event, helper);
            /*---SR_133623 New Code Added Start---*/
            var claimTypeVar = component.get("v.selectedClaimType");
            var i = component.get("v.numberOfFreightClaims");
            console.log('---Selected Claim Type---',claimTypeVar);
            if(claimTypeVar == "Freight Claim"){
                i += 1;
            }
            component.set('v.numberOfFreightClaims', i);
            console.log('---Total Number of Freight Claim---',component.get("v.numberOfFreightClaims"));
            /*---SR_133623 New Code Added End---*/
            component.set('v.selectedClaimType', none);
        }
    },

    //This controller method is triggered by the "Save Claim" button within the Claim Modal (in edit mode).
    saveClaim: function(component, event, helper) {
        var none = component.get("v.fieldIdLabelMap").nonePicklist;
        var validity = helper.validateModalInput(component, event, helper);

        if (validity.hasErrors) {
            var fieldIdLabelMap = component.get('v.fieldIdLabelMap');
            var errorIdList = validity.errorIdList;
            var msg = 'The following fields have errors: ';
            var labelList = [];
            for (var i in errorIdList) {
                labelList.push(fieldIdLabelMap[errorIdList[i]]);
            }
            msg += labelList.join(', ');
            helper.createUIMessageComponent(component, event, helper, 'error', 'Error', msg, 5000, true);
        } else {
            helper.closeModal(component, event, helper);
            helper.updateCase(component, event, helper);
            helper.clearAllValues(component, event, helper);
            helper.unRenderAllFields(component, event, helper);
            helper.unRequireAllFields(component, event, helper);
            component.set('v.selectedClaimType', none);
        }
    },

    //This controller method runs on the "change" event for the component attribute "selectedClaimType". When the selected
    //claim type changes, the following happens: the validation messages are cleared, all fields are unrendered, all fields are 
    //un-required, all temporary values are cleared. Then all values for the new selected type are rendered and the required fields
    //for that type are set.
    onTypeChange: function(component, event, helper) {
        helper.clearValidationMessages(component, event, helper);
        helper.unRenderAllFields(component, event, helper);
        helper.unRequireAllFields(component, event, helper);
        helper.clearAllValues(component, event, helper);
        helper.setRenderedValues(component, event, helper);
        helper.setRequiredValues(component, event, helper);
    },

    updateParentCaseFields: function(component, event, helper) {
        helper.updateParentCaseFields(component, event, helper);
    },
    onRadioButtonChange: function(component, event, helper) {
        helper.onRadioButtonChange(component, event, helper);
    },
    checkShipDate: function(component, event, helper) {
        //helper.checkShipDate(component, event, helper);
        helper.checkShipDate(component, event, helper, 'ship_date', 'shipDate');
    }

})