({
    init: function(component, event, helper) {
        component.set('v.userId', $A.get("$SObjectType.CurrentUser.Id"));

        var getImagesPromise = helper.getImages(component, event, helper);
        getImagesPromise.then(
            $A.getCallback(function(result) {
                console.log('brandMap: ', result);
                component.set('v.brandMap', result['brandMap']);
                component.set('v.brandIsActiveMap', result['brandIsActiveMap']);

                helper.createBrandComp(component, event, helper);
                helper.pageDoneRendering(component, event, helper);
            }),
            $A.getCallback(function(error) {
                // Something went wrong
                alert('An error occurred getting events : ' + error.message);
            })
        ).catch(function(error) {
            $A.reportError("error message here", error);
        });
    },
    // get images to be used for each program 
    getImages: function(component, event, helper) {
        var action = component.get("c.getSingleBarrelImages");
        action.setParams({
            "caseId": '',
            "userId": $A.get("$SObjectType.CurrentUser.Id"),
            "acctId": ''
        });
        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var requestObject = response.getReturnValue();

                    resolve(requestObject['responseMap']);

                } else if (state === "ERROR") {
                    var errors = response.getError();
                    console.log('errors ', errors);
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
    setSelectedBrand: function(component, event, helper) {
        var selectedBrand = component.get('v.selectedBrand');
        var brandMap = component.get('v.brandMap');

        component.set('v.currentBrandObj', brandMap[selectedBrand]);
        console.log('program type>>>>>>>>>>>>>>>>>>>> ', brandMap[selectedBrand]);
        console.log('flavor ', brandMap[selectedBrand].flavor);

        if (selectedBrand) {
            component.set('v.currentBrandLabel', brandMap[selectedBrand].label);
            component.set('v.currentBrand', brandMap[selectedBrand].brand);
            component.set('v.selectedFlavor', brandMap[selectedBrand].flavor);
        }
    },
    clearProgramType: function(component, event, helper) {
        this.removeProgramTypeClass(component, event, helper);
        component.set('v.selectedProgramType', null);
    },
    removeProgramTypeClass: function(component, event, helper) {
        var lastProgramTypeAuraId = component.get('v.selectedProgramTypeAuraId');
        $A.util.removeClass(component.find(lastProgramTypeAuraId), 'selected-program-type');
    },
    createProgramTypeComp: function(component, event, helper) {
        var body = component.get("v.body");
        var programTypeAuraId = 'knob_creek-Sample Kit';
        //this.hideProgramTypes(component, event, helper, programTypeAuraId);

        // clear out body
        // other methods of destorying the components did not work
        while (body.length > 0) {
            body.pop();
        }

        var currentBrand = component.get('v.currentBrandObj');


        var count = 0;
        for (var i in currentBrand.programTypes) {
            console.log(currentBrand.programTypes[i]);
            $A.createComponent(
                "c:SBP_ProgramTypeCmp", {
                    "staticResourceName": currentBrand.staticResourceName,
                    "index": count,
                    "brand": currentBrand.brand,
                    "programType": currentBrand.programTypes[i],
                    "aura:id": currentBrand.label + '-' + currentBrand.programTypes[i],
                    "auraId": currentBrand.label + '-' + currentBrand.programTypes[i],
                    "isNationalAccount": component.get('v.isNationalAccount')
                },
                function(newProgramType, status, errorMessage) {
                    //Add the new button to the body array
                    if (status === "SUCCESS") {

                        body.push(newProgramType);
                        component.set("v.body", body);
                        //helper.showProgramTypes(component, event, helper, programTypeAuraId);
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
            count++;
        }
    },
    createBrandComp: function(component, event, helper) {
        var body = component.get("v.brandBody");
        var brandMap = component.get('v.brandMap');
        // clear out body
        // other methods of destorying the components did not work
        while (body.length > 0) {
            body.pop();
        }

        for (var i in brandMap) {

            //var brand = brands[i];
            console.log(brandMap[i].staticResourceName);
            $A.createComponent(
                "c:SBP_BrandCmp", {
                    "staticResourceName": brandMap[i].staticResourceName,
                    "index": i,
                    "name": brandMap[i].label,
                    "label": brandMap[i].label,
                    "aura:id": brandMap[i].label
                },
                function(newBrand, status, errorMessage) {
                    //Add the new button to the body array
                    if (status === "SUCCESS") {

                        body.push(newBrand);
                        component.set("v.brandBody", body);
                    } else if (status === "INCOMPLETE") {
                        console.log("No response from server or client is offline.")
                            // Show offline error
                    } else if (status === "ERROR") {
                        console.log("Error: " + errorMessage);
                        // Show error message
                    }
                }
            );
        }
    },
    createCalendarModalComp: function(component, event, helper) {
        var body = component.get("v.calendarModal");
        console.log('body ', body);

        // clear out body
        // other methods of destorying the components did not work
        while (body.length > 0) {
            body.pop();
        }
        $A.createComponent(
            "c:SBP_CalendarModalCmp", {
                "viewOnly": true
            },
            function(calendarModal, status, errorMessage) {
                //Add the new button to the body array
                if (status === "SUCCESS") {

                    body.push(calendarModal);
                    component.set("v.calendarModal", body);
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
    toggleCalendarButtonText: function(component, event, helper) {
        var buttonText = component.get('v.calendarButtonText');
        var newText;
        if (buttonText == 'View Calendar') {
            newText = 'Back';
        } else {
            newText = 'View Calendar';
            this.hideCalendar(component, event, helper);
            this.showSelectionScreen(component, event, helper);
        }
        component.set('v.calendarButtonText', newText);
    },
    hideCalendar: function(component, event, helper) {
        component.set('v.calendarVisible', false);
    },
    showCalendar: function(component, event, helper) {
        component.set('v.calendarVisible', true);
        this.toggleCalendarButtonText(component, event, helper);
    },
    hidePrograms: function(component, event, helper) {
        component.set('v.programsVisible', false);
    },
    showPrograms: function(component, event, helper) {
        component.set('v.programsVisible', true);
    },
    hideSelectionScreen: function(component, event, helper) {
        component.set('v.selectionScreenVisible', false);
    },
    showSelectionScreen: function(component, event, helper) {
        component.set('v.selectionScreenVisible', true);
    },
    // assign class to selected program and also assign class to the other brands
    toggleSelectedBrand: function(component, event, helper, selectedAuraId) {
        var selectedBrand = component.find(selectedAuraId);
        var brands = component.get('v.brandMap');

        this.removeAllStyles(component, event, helper);

        for (var i in brands) {
            if (brands[i].label != selectedAuraId) {
                var cmp = component.find(brands[i].label);
                $A.util.addClass(cmp, 'brand-not-selected-box');
            }
        }
        console.log('-----', selectedBrand);
        $A.util.toggleClass(selectedBrand, 'brand-selected-box');


    },
    removeAllStyles: function(component, event, helper) {
        var brands = component.get('v.brandMap');

        for (var i in brands) {
            var cmp = component.find(brands[i].label);
            $A.util.removeClass(cmp, 'brand-selected-box');
            $A.util.removeClass(cmp, 'brand-not-selected-box');
        }
    },
    toggleFadeIn: function(component, event, helper, auraId) {
        var cmp = component.find(auraId);
        this.showElement(component, event, helper, auraId);
        $A.util.addClass(cmp, 'slds-transition-show');
    },
    showProgramTypes: function(component, event, helper, auraId) {
        var cmp = component.find(auraId);
        $A.util.addClass(cmp, 'program-type_container');
    },
    hideProgramTypes: function(component, event, helper, auraId) {
        var cmp = component.find(auraId);
        $A.util.removeClass(cmp, 'program-type_container');
    },
    createCalendarComp: function(component, event, helper) {
        var body = component.get("v.calendarBody");
        var brand = component.get('v.currentBrand');


        // clear out body
        // other methods of destorying the components did not work
        while (body.length > 0) {
            body.pop();
        }
        $A.createComponent(
            "c:SBP_CalendarContainerCmp", {
                "viewOnly": true,
                "currentBrand": brand
            },
            function(calendarBody, status, errorMessage) {
                //Add the new button to the body array
                if (status === "SUCCESS") {

                    body.push(calendarBody);
                    component.set("v.calendarBody", body);
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
    createPlantOptions: function(component, event, helper) {
        var currentBrandLabel = component.get('v.currentBrandLabel');
        var brandMap = component.get('v.brandMap');
        var viewOptions = [];

        for (var i in brandMap) {
            if (brandMap[i].label == currentBrandLabel) {
                var plantVal = {
                    label: brandMap[i].plant,
                    value: brandMap[i].plant
                };
                viewOptions.push(plantVal);
            }
        }
        component.set('v.views', viewOptions);
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
    isNationalAccount: function(component, event, helper) {

        var action = component.get("c.isApartOfNationalAccountQueue");

        action.setParams({
            userId: $A.get("$SObjectType.CurrentUser.Id")
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();

                    component.set('v.isNationalAccount', retVal);
                    console.log('is national account: ', retVal);

                    resolve(retVal);

                } else if (state === "ERROR") {
                    var errors = response.getError();
                    console.log('errors ', errors);
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
    checkProgramAvailability: function(component, event, helper) {

        var action = component.get("c.isProgramAvailable");

        action.setParams({});

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();


                    console.log('vallllllllll ', retVal['responseMap']['brandToIsActive']);

                    resolve(retVal['responseMap']['brandToIsActive']);

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
    getBarrelRecordTypeList: function(component, event, helper) {
        var action = component.get("c.getBarrelRecordTypes");
        action.setParams({});

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();

                    resolve(retVal['responseMap']['barrelRecordTypes']);

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
    getBarrelRecordType: function(component, event, helper) {
        var barrelRecordTypes = component.get('v.barrelRecordTypes');
        var currentBrandLabel = component.get('v.currentBrandLabel');
        var programType = component.get('v.selectedProgramType');
        var standardBrands = component.get('v.standardBrands');
        console.log('currentBrandLabel ', currentBrandLabel);
        console.log('programType ', programType);
        console.log('standardBrands ', standardBrands.indexOf(currentBrandLabel) > -1);
        console.log('barrelRecordTypes ', barrelRecordTypes);

        if (standardBrands.indexOf(currentBrandLabel) > -1) {
            if (currentBrandLabel == 'Knob Creek') {
                if (programType == 'Sample Kit' || programType == 'Trip and Tour' || programType == 'Distiller\'s Choice') {
                    component.set('v.currentBarrelRecordType', barrelRecordTypes['Knob_Creek_Full_Barrel'].Id);
                } else if (programType == 'Split Barrel') {
                    component.set('v.currentBarrelRecordType', barrelRecordTypes['Knob_Creek_Split_Barrel'].Id);
                }
            }

        } else if (currentBrandLabel == 'Makers Mark') {
            if (programType == 'Trip and Tour') {
                component.set('v.currentBarrelRecordType', barrelRecordTypes['Makers_Mark_Full_Barrel'].Id);
            } else if (programType == 'Distiller\'s Choice') {
                component.set('v.currentBarrelRecordType', barrelRecordTypes['Makers_Mark_Full_Barrel'].Id);
            }
        }
        var currentBarrelRecordType = component.get('v.currentBarrelRecordType');
        console.log('currentBarrelRecordType ', currentBarrelRecordType);
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
    showNotice: function(component, event, helper, type, message, title) {
        component.find('brand_selection_prompt').showNotice({
            "variant": type,
            "header": title,
            "message": message
        });
    },
    showSpinner: function(component, event, helper) {
        var spinner = component.find("brand_selection_spinner");
        $A.util.addClass(spinner, "slds-show");
        $A.util.removeClass(spinner, "slds-hide");
    },
    hideSpinner: function(component, event, helper) {
        var spinner = component.find("brand_selection_spinner");
        $A.util.addClass(spinner, "slds-hide");
        $A.util.removeClass(spinner, "slds-show");
    },
    pageDoneRendering: function(component, event, helper) {
        helper.hideSpinner(component, event, helper);
        component.set('v.isDoneRendering', true);

    }



})