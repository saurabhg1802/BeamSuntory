({
    init: function(component, event, helper) {
        var selectedBrand = component.get('v.selectedBrand');
        console.log('selected Brand ', selectedBrand);

        var getCasePromise = helper.getCase(component, event, helper);
        getCasePromise.then(
            $A.getCallback(function(result) {
                console.log('case ', result);
                //component.set('v.accountId', result['retailAccount']);
                component.set('v.premiseType', result['premiseType']);
                if(selectedBrand == '' || selectedBrand == null){
                    component.set('v.selectedBrand', result['brand']);
                }
                
                var getImagesPromise = helper.getImages(component, event, helper);
                return getImagesPromise;

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        ).then(
            $A.getCallback(function(result) {
                console.log('brandmap ', result['brandMap']);
                component.set('v.brandMap', result['brandMap']);
                helper.setSelectedBrand(component, event, helper);
                helper.createProgramTypeComp(component, event, helper);
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
    handleBrandSelected: function(component, event, helper) {
        helper.setSelectedBrand(component, event, helper);

    },
    handleProgramTypeEvent: function(component, event, helper) {
        helper.removeProgramTypeClass(component, event, helper);
        var selectedProgramType = event.getParam('programType');
        var auraId = event.getParam('auraId');
        var element = component.find(auraId);
        console.log('Program Type: ', selectedProgramType);

        if ($A.util.hasClass(element, 'hover-program-type')) {
            $A.util.toggleClass(element, 'hover-program-type');
        }
        $A.util.toggleClass(element, 'selected-program-type');

        component.set('v.selectedProgramType', selectedProgramType);
        component.set('v.selectedProgramTypeAuraId', auraId);
        //helper.getBarrelRecordType(component, event, helper);
    },
    handleProgramTypeHoverEvent: function(component, event, helper) {
        var hoverProgramType = event.getParam('programType');
        var auraId = event.getParam('auraId');
        var element = component.find(auraId);

        if (!$A.util.hasClass(element, 'selected-program-type')) {
            $A.util.toggleClass(element, 'hover-program-type');
            $A.util.toggleClass(element, 'program-type_name_hover');

        }

        var cmp = component.find('text');
        $A.util.toggleClass(cmp, 'program-type_name_hover');

    },
    navigateToNextPage: function(component, event, helper) {
        var navigate = component.get("v.navigateFlow");
        navigate('NEXT');
    }

})