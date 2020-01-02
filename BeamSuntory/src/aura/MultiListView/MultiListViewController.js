({
    doInit: function (component, event, helper) {
        helper.getCaseList(component);
        helper.getUserProf(component);

    },

    showDetails: function (component, event, helper) {
        //Get data via "data-id" attribute from link (link itself or icon's parentNode)
        var target = event.target || event.srcElement || event.toElement;
        helper.navigateToSObject(component, $A.util.getDataAttribute(target, 'id'));
    },

    selfun: function (component, event, helper) {

        var str = "";
        str = parseInt($("select option:selected").val());

        if (str == 2) {
            //$('#pop').show();
            component.set('v.isLoading', true);
            helper.getCaseList(component);
        }

        if (str == 3) {
            //$('#pop').show();
            component.set('v.isLoading', true);
            helper.getClosedCases(component);
        }

        if (str == 4) {
            //$('#pop').show();
            component.set('v.isLoading', true);
            helper.getAllOpenCases(component);
        }

        if (str == 5) {
            //$('#pop').show();
            component.set('v.isLoading', true);
            helper.getAllClosedCases(component);
        }
    },

    reopenCase: function (component, event, helper) {
        var caseId = component.get("v.currId");
        var explanation = component.get("v.explanation");
        if (explanation.length > 0) {
            helper.reopenCase(component, caseId, explanation);
            component.set("v.displayModal", false);
            component.set("v.currId", "");
        }
    },
    openModal: function (component, event, helper) {
        // for Display Modal,set the "isOpen" attribute to "true"
        var caseId = null;
        if (caseId == null) {
            try {
                var firefoxCaseId = event.target.parentElement.dataset.record;
                caseId = firefoxCaseId;
            } catch (err) {}
        }
        if (caseId == null) {
            try {
                var internetExplorerId = event.srcElement.parentElement.dataset.record;
                caseId = internetExplorerId;
            } catch (err) {}
        }
        if (caseId == null) {
            try {
                console.log(event);
                var chromeId = event.srcElement.parentElement.parentElement.dataset.record;
                caseId = chromeId;
            } catch (err) {}
        }
        component.set("v.currId", caseId);
        component.set("v.displayModal", true);
        component.set("v.explanation", "");
    },

    closeModal: function (component, event, helper) {
        // for Hide/Close Model,set the "isOpen" attribute to "Fasle"
        component.set("v.displayModal", false);
        component.set("v.currId", "");
        component.set("v.explanation", "");
    }
})