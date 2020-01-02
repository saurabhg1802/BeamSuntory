({
    init: function (component, event, helper) {
        var getPicklistValuesPromise = helper.getPicklistValues(component, event, helper);
        getPicklistValuesPromise.then(
            $A.getCallback(function (result) {
                component.set('v.valueToLabelMap', result['valueToLabelTranslationMap']);
                component.set('v.labelToValueMap', result['labelToValueTranslationMap'])
                component.set('v.gbsCenter', result['gbsCenter']);
                component.set('v.picklistIdToValue', result['picklistIdToValue']);
                component.set('v.picklistIdMap', result['picklistIdToIdsMap']);

                helper.buildPicklistOptions(component, Object.values(result['teamCategoryIds']), 'teamCategoryFieldOptions');
                helper.pageDoneRendering(component, event, helper);
            })
        );
    },
    loadDependentValues: function (component, helper, dependentFields, targetOptions) {
        var nonePicklist = component.get('v.nonePicklistLabel');

        // create a empty array var for store dependent picklist values for controller field)
        var picklistValues = [];
        if (helper.isNullOrEmpty(dependentFields)) {
            return;
        }

        if (dependentFields != undefined && dependentFields.length > 0) {
            picklistValues.push({
                class: "optionClass",
                label: nonePicklist,
                value: null
            });
        }

        for (var i = 0; i < dependentFields.length; i++) {
            var picklistLabel = helper.getLabelFromId(component, event, helper, dependentFields[i].recordId);

            picklistValues.push({
                class: "optionClass",
                label: picklistLabel,
                value: dependentFields[i].recordId,
                order: dependentFields[i].order
            });
        }
        // sort picklist values by "order" field on custom metadata record
        picklistValues.sort(function (a, b) {
            return parseFloat(a.order) - parseFloat(b.order)
        });
        component.set('v.' + targetOptions, picklistValues);
    },
    getCategoryTypeAttributes: function (component, categoryType) {
        var categoryTypeMap = {};

        categoryTypeMap.disabledAttr = categoryType + 'Disabled';
        categoryTypeMap.requiredAttr = categoryType + 'Required';
        categoryTypeMap.optionsAttr = categoryType + 'Options';
        categoryTypeMap.valueAttr = categoryType + 'Value';
        categoryTypeMap.categoryDependenciesAttr = categoryType + 'CategoryDependencies';

        categoryTypeMap.disabledVal = component.get('v.' + categoryTypeMap.disabledAttr);
        categoryTypeMap.requiredVal = component.get('v.' + categoryTypeMap.requiredAttr);
        categoryTypeMap.optionsVal = component.get('v.' + categoryTypeMap.optionsAttr);
        categoryTypeMap.valueVal = component.get('v.' + categoryTypeMap.valueAttr);
        categoryTypeMap.categoryDependenciesVal = component.get('v.' + categoryTypeMap.categoryDependenciesAttr);

        return categoryTypeMap;
    },
    lookupDependentValues: function (component, event, helper, controlField, dependentField) {
        var controlFieldMap = helper.getCategoryTypeAttributes(component, controlField);
        var dependentFieldMap = helper.getCategoryTypeAttributes(component, dependentField);
        var hasDependentValues = helper.hasDependentValues(component, event, helper, controlFieldMap.valueVal);
        var nonePicklist = component.get('v.nonePicklistLabel');

        if (controlFieldMap.valueVal != nonePicklist) {
            var dependentFields = helper.getDependentValues(component, event, helper, controlFieldMap.valueVal);

            if (helper.isNullOrEmpty(dependentFields)) {
                component.set('v.' + dependentFieldMap.optionsAttr, []);
                return;
            }

            if (hasDependentValues) {
                component.set('v.' + dependentFieldMap.disabledAttr, false);
                component.set('v.' + dependentFieldMap.valueAttr, nonePicklist);

                helper.loadDependentValues(component, helper, dependentFields, dependentFieldMap.optionsAttr);
            } else {
                component.set('v.' + dependentFieldMap.disabledAttr, true);
                component.set('v.' + dependentFieldMap.optionsAttr, [nonePicklist]);
            }

        } else {
            component.set('v.' + dependentFieldMap.optionsAttr, [nonePicklist]);
            component.set('v.' + dependentFieldMap.valueAttr, nonePicklist);
            component.set('v.' + dependentFieldMap.disabledAttr, true);
        }
    },
    isNullOrEmpty: function (data) {
        if (data == '' || data == null || data == undefined) {
            return true;
        }
        return false;
    },
    getPicklistValues: function (component, event, helper) {
        var action = component.get("c.buildPicklistOptions");

        action.setParams({});
        return new Promise(function (resolve, reject) {
            action.setCallback(this, function (response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    console.log('Results from Apex Controller: ', retVal);
                    var responseMap = retVal['responseMap'];
                    resolve(responseMap);

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
    buildPicklistOptions: function (component, values, optionsAttribute) {
        var valueToLabelMap = component.get('v.valueToLabelMap');
        var picklistIdToValue = component.get('v.picklistIdToValue');
        var typeMap = valueToLabelMap['type'];
        var options = [];

        for (var i in values) {

            var Id = values[i];
            var val = picklistIdToValue[Id];
            if (i == 0) {
                options.push({
                    'label': $A.get("$Label.c.None_Picklist"),
                    'value': null
                });
            }
            options.push({
                'label': typeMap[val],
                'value': Id
            });
        }
        component.set('v.' + optionsAttribute, options);
    },
    isNullOrEmpty: function (data) {
        if (data == '' || data == null || data == undefined) {
            return true;
        }
        return false;
    },
    resetDependencies: function (component, event, helper, controlField, dependentField) {
        var controlFieldMap = helper.getCategoryTypeAttributes(component, controlField);

        for (var i in controlFieldMap.categoryDependenciesVal) {
            var dependentFieldMap = helper.getCategoryTypeAttributes(component, controlFieldMap.categoryDependenciesVal[i]);
            component.set('v.' + dependentFieldMap.requiredAttr, false);
            component.set('v.' + dependentFieldMap.disabledAttr, true);
            component.set('v.' + dependentFieldMap.valueAttr, null);
            component.set('v.' + dependentFieldMap.optionsAttr, []);
        }
    },
    updateDependencies: function (component, event, helper, type) {
        var fieldType = helper.getCategoryTypeAttributes(component, type);

        if (helper.isNullOrEmpty(fieldType.optionsVal)) {
            component.set('v.' + fieldType.requiredAttr, false);
            component.set('v.' + fieldType.disabledAttr, true);
        } else {
            component.set('v.' + fieldType.requiredAttr, true);
            component.set('v.' + fieldType.disabledAttr, false);
        }
    },
    assignTranslatedValues: function (component, event, helper) {
        var labelToValueMap = component.get('v.labelToValueMap');
        var picklistIdToValue = component.get('v.picklistIdToValue');
        var teamCategoryVal = component.get('v.teamCategoryFieldValue');
        var primaryCategoryVal = component.get('v.primaryCategoryFieldValue');
        var secondaryCategoryVal = component.get('v.secondaryCategoryFieldValue');
        var tertiaryCategoryVal = component.get('v.tertiaryCategoryFieldValue');

        if (!helper.isNullOrEmpty(teamCategoryVal)) {
            component.set('v.translatedTeamCategoryFieldValue', picklistIdToValue[teamCategoryVal]);
        }

        if (!helper.isNullOrEmpty(primaryCategoryVal)) {
            component.set('v.translatedPrimaryCategoryFieldValue', picklistIdToValue[primaryCategoryVal]);
        }

        if (!helper.isNullOrEmpty(secondaryCategoryVal)) {
            component.set('v.translatedSecondaryCategoryFieldValue', picklistIdToValue[secondaryCategoryVal]);
        }

        if (!helper.isNullOrEmpty(tertiaryCategoryVal)) {
            component.set('v.translatedTertiaryCategoryFieldValue', picklistIdToValue[tertiaryCategoryVal]);
        }
    },
    navigateToPage: function (component, event, helper) {
        var navigate = component.get("v.navigateFlow");
        var action = event.getParam("action");

        navigate(event.getParam("action"));
    },
    // used to handle all page validations
    isPageValid: function (component, event, helper) {
        var isValid = helper.isSelectionMissing(component, event, helper);

        return isValid;
    },
    isSelectionMissing: function (component, event, helper) {
        var teamCategoryVal = component.get('v.teamCategoryFieldValue');
        var primaryCategoryVal = component.get('v.primaryCategoryFieldValue');
        var secondaryCategoryVal = component.get('v.secondaryCategoryFieldValue');
        var tertiaryCategoryVal = component.get('v.tertiaryCategoryFieldValue');
        var nonePicklist = component.get('v.nonePicklistLabel');
        var isValid = true;

        if (teamCategoryVal == nonePicklist || primaryCategoryVal == nonePicklist ||
            secondaryCategoryVal == nonePicklist || tertiaryCategoryVal == nonePicklist) {
            isValid = false;
        }
        return isValid;
    },
    hasDependentValues: function (component, event, helper, IdVal) {
        var picklistIdMap = component.get('v.picklistIdMap');

        return picklistIdMap.hasOwnProperty(IdVal);
    },
    getLabelFromId: function (component, event, helper, IdVal) {
        var picklistIdToValue = component.get('v.picklistIdToValue');
        var valueToLabelMap = component.get('v.valueToLabelMap');
        var currentDropDownSelected = component.get('v.currentDropDownSelected');
        var fieldMap = valueToLabelMap[currentDropDownSelected];
        var value = picklistIdToValue[IdVal];

        //console.log('value ', value);
        //console.log('currentDropDownSelected ', currentDropDownSelected);
        //console.log('picklistIdToValue ', picklistIdToValue);

        return fieldMap[value];
    },
    getDependentValues: function (component, event, helper, IdVal) {
        var picklistIdMap = component.get('v.picklistIdMap');

        if (picklistIdMap.hasOwnProperty(IdVal)) {
            return picklistIdMap[IdVal];
        } else {
            return null;
        }
    },
    showSpinner: function (component, event, helper) {
        var spinner = component.find("gbs_flow_spinner");
        $A.util.addClass(spinner, "slds-show");
        $A.util.removeClass(spinner, "slds-hide");
    },
    hideSpinner: function (component, event, helper) {
        var spinner = component.find("gbs_flow_spinner");
        $A.util.addClass(spinner, "slds-hide");
        $A.util.removeClass(spinner, "slds-show");
    },
    pageDoneRendering: function (component, event, helper) {
        helper.hideSpinner(component, event, helper);
        component.set('v.isDoneRendering', true);
    },
    showToast: function (message, title, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type,
            "mode": "dismissible"
        });
        toastEvent.fire();
    },
    setCurrentDropdownFieldSelection: function (component, event, helper) {
        var directChildMap = component.get('v.directChildMap');
        var currentDropDownSelected = event.getSource();
        var auraId = currentDropDownSelected.getLocalId();

        component.set('v.currentDropDownSelected', directChildMap[auraId]);
    }
})