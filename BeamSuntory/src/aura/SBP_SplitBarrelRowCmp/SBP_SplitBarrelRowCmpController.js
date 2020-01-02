({
    init: function(component, event, helper) {
        var fieldIdAPINameMap = component.get('v.fieldIdAPINameMap');

        var getPicklistValuesPromise = helper.getPicklistValues(component, event, helper);
        getPicklistValuesPromise.then(
            $A.getCallback(function(result) {
                component.set('v.picklistMap', result);

                var buildPickListForComboBoxPromise = helper.buildPickListForComboBox(component, event, helper, 'states', 'states');
                return buildPickListForComboBoxPromise;

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        ).then(
            $A.getCallback(function(result) {
                for (var i in fieldIdAPINameMap) {
                    if (i == 'distributor') {
                        helper.firePassValueFieldEvent(component, event, helper, 'distributor', null, true);
                    } else {
                        helper.firePassValueFieldEvent(component, event, helper, i, null, true);
                    }
                }
                component.set('v.casesVal', 0);
                helper.pageDoneRendering(component, event, helper);
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
    onAccountChange: function(component, event, helper) {
        var account = component.get('v.selectedAccountDistributorLookUpRecord');
        var accountId;
        console.log(account.Id);
        // kick off event that will add account id to list of ids to be created
        if (account.Id != null && account.Id != undefined) {
            component.set('v.currentAccountId', account.Id);
            accountId = account.Id;
        } else {
            accountId = null;
        }
        console.log(component.get('v.currentAccountId'));
        helper.firePassValueFieldEvent(component, event, helper, 'distributor', accountId, false);
    },
    handleInputChange: function(component, event, helper) {
        helper.firePassValueFieldEvent(component, event, helper, null, null);
    },
})