({
    init: function(component, event, helper) {
        helper.init(component, event, helper);
        helper.createCalendarModalComp(component, event, helper);
    },
    profileUrl: function(component, event, helper) {


    },
    handleBrandEvent: function(component, event, helper) {
        var selectedBrand = event.getParam('program');

        component.set('v.selectedBrand', selectedBrand);
        helper.setSelectedBrand(component, event, helper);
        helper.createProgramTypeComp(component, event, helper);
        helper.toggleSelectedBrand(component, event, helper, selectedBrand);
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
        var navigate = component.get("v.navigateFlow");
        navigate('NEXT');

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
    clearProgramType: function(component, event, helper) {
        helper.clearProgramType(component, event, helper);
    },
    removeProgramTypeClass: function(component, event, helper) {
        helper.removeProgramTypeClass(component, event, helper);
    },
    onHover: function(component, event, helper) {
        //var target = event.getSource().getLocalId();
        var auraId = event.currentTarget.dataset.index;
        var target = component.find(auraId);

        $A.util.toggleClass(target, "hover");
        $A.util.toggleClass(target, "selection-box");
    },
    createCalendarModalComp: function(component, event, helper) {
        helper.createCalendarModalComp(component, event, helper);
    },
    createCalendarComp: function(component, event, helper) {
        helper.createCalendarComp(component, event, helper);
    },
    showSpinner: function(component, event, helper) {
        helper.showSpinner(component, event, helper);
    },
    hideSpinner: function(component, event, helper) {
        helper.hideSpinner(component, event, helper);
    },
    handleNavigate: function(component, event, helper) {
        var navigate = component.get("v.navigateFlow");
        var currentBrandLabel = component.get('v.currentBrandLabel');
        var programType = component.get('v.selectedProgramType');
        console.log(currentBrandLabel);
        if ((currentBrandLabel == null || currentBrandLabel == '') || (programType == null || programType == '')) {
            if (currentBrandLabel == null || currentBrandLabel == '') {
                helper.showToast('Please Select a Brand', 'Error', 'error');
            } else if (programType == null || programType == '') {
                helper.showToast('Please Select a Program Type', 'Error', 'error');
            }


        } else {
            helper.setCaseRecordTypeInFlow(component, event, helper);
            navigate(event.getParam("action"));
        }

    },
    navigateToNextPage: function(component, event, helper) {
        component.set('v.applicationRequired', true);
        var navigate = component.get("v.navigateFlow");
        navigate('NEXT');
    }
})