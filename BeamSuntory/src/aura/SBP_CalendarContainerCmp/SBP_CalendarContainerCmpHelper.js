({
    /* getEvents: function(component, event, helper) {
         var action = component.get("c.getEvents");

         action.setParams({
             plants: component.get('v.brandsToDisplay')
         });

         action.setCallback(this, function(data) {
             var state = data.getState();

             if (state === "SUCCESS") {
                 var requestObject = data.getReturnValue();
                 var responseMap = requestObject['responseMap'];

                 //var newObj = JSON.parse(responseMap['timePeriodMap']);

                 //console.log(newObj);
                 //component.set('v.timePeriodMap', newObj);
                 component.set("v.eventsMap", responseMap['eventsMap']);
                 this.setPlantEventColor(component, event, helper);


             } else if (state === "INCOMPLETE") {
                 // do something
             } else if (state === "ERROR") {
                 var errors = data.getError();
                 if (errors) {
                     if (errors[0] && errors[0].message) {
                         console.log("Error message: " +
                             errors[0].message);
                     }
                 } else {
                     console.log("Unknown error");
                 }
             }
         });

         $A.enqueueAction(action);
     },
     */
    getTimes: function(component, event, helper) {
        var action = component.get("c.sortTimePeriodsBasedOnDay");

        action.setParams({});

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    console.log('sortTimePeriodsBasedOnDay: ', retVal);
                    resolve(retVal);

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
    getPlantCalendarSettings: function(component, event, helper) {
        var action = component.get("c.getSingleBarrelCalendarCustomMetadata");

        action.setParams({});

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var requestObject = response.getReturnValue();
                    var responseMap = requestObject['responseMap'];
                    console.log('brand settings', responseMap);
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
    setCalendarObject: function(component, event, helper) {
        component.set('v.sObjectName', 'Plant_Event__c');
        component.set('v.titleField', 'Subject__c');
        component.set('v.startDateTimeField', 'Start_Time__c');
        component.set('v.endDateTimeField', 'End_Time__c');
        component.set('v.descriptionField', 'Description__c');
        //component.set('v.timezone', 'UTC');
        //component.set('v.userField', );

    },
    buildCalendar: function(component, event, helper) {
        this.destroyCalendar(component, event, helper);
    },
    destroyCalendar: function(component, event, helper) {
        var body = component.get("v.body");
        // clear out body
        while (body.length > 0) {
            body.pop();
        }
    },
    setPlantEventColor: function(component, event, helper) {
        var brandInfoMap = component.get('v.brandInfoMap');
        var brandColorMap = component.get('v.brandColorMap');

        for (var i in brandInfoMap) {
            var colorObj = {};

            colorObj = {
                event_color: brandInfoMap[i]['Event_Color__c'],
                text_color: brandInfoMap[i]['Event_Text_Color__c']
            }
            brandColorMap[i] = colorObj;
        }
        component.set('v.brandColorMap', brandColorMap);
    },
    addBrandToCalendar: function(component, event, helper) {
        var brandList = component.get('v.brandsToDisplay');
        var isChecked = event.getSource().get("v.checked");
        var brand = event.getSource().get("v.value");
        if (isChecked) {
            brandList.push(brand);
        } else {
            brandList.splice(brandList.indexOf(brand), 1);
        }

        component.set('v.brandsToDisplay', brandList);
    },
    createPlantOptions: function(component, event, helper) {
        var currentBrand = component.get('v.currentBrand');
        var brandInfoMap = component.get('v.brandInfoMap');
        var viewOptions = [];
        var selectedBrandFromFlow = component.get('v.selectedBrandFromFlow');
        var viewAllBrands = component.get('v.viewAllBrands');
        var setOfPlants = new Set();

        for (var i in brandInfoMap) {
            if (viewAllBrands) {
                setOfPlants.add(brandInfoMap[i].MasterLabel);
            } else if (brandInfoMap[i].MasterLabel == currentBrand) {
                setOfPlants.add(brandInfoMap[i].MasterLabel);
            }
        }

        for (var i of setOfPlants) {
            var plantVal = {
                label: i,
                value: i
            };
            viewOptions.push(plantVal);
        }

        component.set('v.views', viewOptions);

    },
    setCalendarView: function(component, event, helper) {
        var brandList = component.get('v.brandsToDisplay');
        var brandSelected = event.getSource().get("v.value");
        console.log('plant to display ', brandSelected);

        while (brandList.length > 0) {
            brandList.pop();
        }
        brandList.push(brandSelected);
        component.set('v.brandsToDisplay', brandList);
    },
    getEvents: function(component, event, helper) {

        var action = component.get("c.getEvents");

        action.setParams({
            'brands': component.get('v.brandsToDisplay')
        });
        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    resolve(retVal);
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
    renderCalendar: function(component, event, helper) {
        var calendarComponent = component.find('calendar');
        calendarComponent.renderCalendar();
    },
    getEventData: function(component, event, helper) {
        var action = component.get("c.getEventDataByDay");

        action.setParams({});
        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    resolve(retVal);
                    //component.set('v.allEventData', retVal);
                    console.log('allEventData ', retVal);

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
    createBrandCheckboxes: function(component, event, helper) {
        var body = component.get("v.brandCheckboxViews");
        var views = component.get('v.views');
        var currentBrand = component.get('v.currentBrand');
        var checked;
        console.log('currentBrand:',currentBrand);
        console.log('views:',views);

        for (var i in views) {
            if (views[i].label === currentBrand) {
                checked = true;
            } else {
                checked = false;
            }

            $A.createComponent(
                "lightning:input", {
                    "aura:id": 'check-' + views[i].value,
                    "type": "checkbox",
                    "label": views[i].label,
                    "name": views[i].label,
                    "value": views[i].value,
                    "checked": checked,
                    "onchange": component.getReference("c.addBrandToCalendar")
                },
                function(option, status, errorMessage) {
                    if (status === "SUCCESS") {
                        body.push(option);
                        component.set("v.brandCheckboxViews", body);
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
    updateBrandToDisplayList: function(component, event, helper) {
        var brandList = component.get('v.brandsToDisplay');
        var currentBrand = component.get('v.currentBrand');
        console.log('brandList ', brandList);
        if (currentBrand != null && currentBrand != undefined) {
            brandList.push(currentBrand);
            component.set('v.brandsToDisplay', brandList);
        }

    },
    getCurrentUser: function(component, event, helper) {
        var userId = $A.get("$SObjectType.CurrentUser.Id");
        component.set('v.userId', userId);
    },
    getBrandTripLimit: function(component, event, helper) {
        var action = component.get("c.buildBrandLimitMap");

        action.setParams({});
        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();

                    resolve(retVal);

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
    
    getTimeSlotbyDay: function(component, event, helper) {
        var action = component.get("c.getAvailableTimeSlots");
		var currentBrand = component.get("v.currentBrand");
        action.setParams({
            brand:currentBrand
        });
        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();

                    resolve(retVal);

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
    
    getEventCountPerDay: function(component, event, helper) {
        var action = component.get("c.getCurrentLimitPerDay");

        action.setParams({});
        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();

                    resolve(retVal);

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
    showCalendarSpinner: function(component, event, helper) {
        var calendarComponent = component.find('calendar');
        if (calendarComponent) {
            calendarComponent.showSpinner();
        }

    },
    hideCalendarSpinner: function(component, event, helper) {
        var calendarComponent = component.find('calendar');
        if (calendarComponent) {
            calendarComponent.hideSpinner();
        }

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
    hasDateBeenSelected: function(component, event, helper, action) {
        var objChild = component.find('calendar');
        console.log('Value from child:::',objChild.get('v.eventCreated'));
        var plantEvent = component.get('v.idVal');
        var eventSelected = false;

        if ((plantEvent == '' || plantEvent == null) && action == 'NEXT' && objChild.get('v.eventCreated') == false) {
            helper.showToast('Please select a date to continue', '', 'error');
            eventSelected = false
        } else {
            eventSelected = true;
        }
        return eventSelected;

    },
    moveToNextScreen: function(component, event, helper) {
        var navigate = component.get("v.navigateFlow");
        navigate('NEXT');
    },
    showNotice: function(component, event, helper, type, message, title) {
        component.find('calendar_container_prompt').showNotice({
            "variant": type,
            "header": title,
            "message": message
        });
    },
    createOnHoldDateRecord: function(component, event, helper) {
        var action = component.get("c.createOnHoldDates");

        action.setParams({
            'brand': component.get('v.currentBrand'),
            'startDate': new Date(component.get('v.holdStartDate')).toJSON(),
            'endDate': new Date(component.get('v.holdEndDate')).toJSON()
        });
        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();

                    resolve(retVal);

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
    getOnHoldDates: function(component, event, helper) {
        var action = component.get("c.getOnHoldDates");

        action.setParams({
            'brand': component.get('v.currentBrand')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var requestObject = response.getReturnValue();
                    console.log(requestObject);
                    var responseMap = requestObject['responseMap'];
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
    toUTC: function(date) {
        if (!date || !date.getFullYear) {
            return 0;
        }
        return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    },
    setMinStartDate: function(component, event, helper) {
        var today = new Date();
        var dateInMilliseconds = today.setDate(today.getDate() + 56);
        var minDate = new Date(dateInMilliseconds);

        var y = minDate.getFullYear();
        var m = minDate.getMonth() + 1;
        var d = minDate.getDate();
        var mm = m < 10 ? '0' + m : m;
        var dd = d < 10 ? '0' + d : d;
        var formattedDate = y + '-' + mm + '-' + dd;

        component.set('v.minHoldStartDate', formattedDate);
    },
    setMinEndDate: function(component, event, helper) {
        var startDate = component.get('v.holdStartDate');
        var minDate = new Date(Date.parse(startDate));

        var y = minDate.getFullYear();
        var m = minDate.getMonth() + 1;
        var d = minDate.getDate() + 1;
        var mm = m < 10 ? '0' + m : m;
        var dd = d < 10 ? '0' + d : d;
        var formattedDate = y + '-' + mm + '-' + dd;

        component.set('v.minHoldEndDate', formattedDate);
    },
    getNumberOfWeekendsBetweenDates: function(startDate, endDate) {
        var count = 0;
        console.log(startDate);
        var curDate = new Date(startDate);
        var endDateVal = new Date(endDate);
        console.log(curDate);
        while (curDate <= endDate) {
            var dayOfWeek = curDate.getDay();
            var isWeekend = (dayOfWeek == 6) || (dayOfWeek == 0);
            if (isWeekend) {
                count++;
            }
            curDate.setDate(curDate.getDate() + 1);
        }
        console.log(count);
        return count;
    }



})