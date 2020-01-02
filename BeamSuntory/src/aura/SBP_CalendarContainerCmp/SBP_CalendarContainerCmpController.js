({
    init: function(component, event, helper) {
        //helper.showCalendarSpinner(component, event, helper);
        var selectedBrandFromFlow = component.get('v.selectedBrandFromFlow');
        helper.updateBrandToDisplayList(component, event, helper);

        //helper.getBrandTripLimit(component, event, helper);
        //helper.getPlantTripLimitMax(component, event, helper);

        //helper.setCalendarObject(component, event, helper);
        //helper.getPlantCalendarSettings(component, event, helper);
        //helper.getTimes(component, event, helper);


        //helper.getEventData(component, event, helper);
        //helper.createPlantOptions(component, event, helper);
        //helper.getCurrentUser(component, event, helper);
        helper.setMinStartDate(component, event, helper);



        // get the limit per day for each brand from the custom metadata type
        var getBrandTripLimitPromise = helper.getBrandTripLimit(component, event, helper);
        getBrandTripLimitPromise.then(
            $A.getCallback(function(result) {
                component.set('v.brandTripLimitMap', result);
                console.log('brand Trip Limit: ', result);
                var getEventCountPerDayPromise = helper.getEventCountPerDay(component, event, helper);
                return getEventCountPerDayPromise;

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                console.log('error ', error);
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        ).then(
            $A.getCallback(function(result) {
                component.set('v.plantTripByDayLimitReached', result);
                console.log('plant Trip Limit: ', result);
                helper.setCalendarObject(component, event, helper);
                var getTimeSlotbyDayPromise = helper.getTimeSlotbyDay(component, event, helper);
                return getTimeSlotbyDayPromise;

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        ).then(
            $A.getCallback(function(result) {
                component.set('v.availableTimeSlotByDay', result);
                console.log('availableTimeSlotByDay:::',result);
                var getPlantCalendarSettingsPromise = helper.getPlantCalendarSettings(component, event, helper);
                return getPlantCalendarSettingsPromise;

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        ).then(
            $A.getCallback(function(result) {
                //component.set('v.plantInfoMap', result['plantInfoMap']);
                component.set('v.brandInfoMap', result['brandInfoMap']);
                //component.set('v.allPlants', Object.keys(result['plantInfoMap']));
                helper.createPlantOptions(component, event, helper);
                helper.createBrandCheckboxes(component, event, helper);
                var getTimesPromise = helper.getTimes(component, event, helper);
                return getTimesPromise;

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        ).then(
            $A.getCallback(function(result) {
                //component.set('v.timePeriodMap', result);
                if (selectedBrandFromFlow != '' && selectedBrandFromFlow != null) {
                    component.set('v.viewAllPlants', false);
                    helper.createPlantOptions(component, event, helper);
                }
                var getEventDataPromise = helper.getEventData(component, event, helper);
                return getEventDataPromise;

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                console.log('Error ', error);
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        ).then(
            $A.getCallback(function(result) {
                component.set('v.allEventData', result);
                console.log('All event data: ', result);

                var getOnHoldDatesPromise = helper.getOnHoldDates(component, event, helper);
                return getOnHoldDatesPromise;

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        ).then(
            $A.getCallback(function(result) {
                component.set('v.bookedDays', result['bookedDays']);
                console.log('booked days ', result);
                component.set('v.remainingDateHolds', result['remainingDayAvailable']);
                helper.createPlantOptions(component, event, helper);
                helper.getCurrentUser(component, event, helper);
                helper.setPlantEventColor(component, event, helper);
                helper.renderCalendar(component, event, helper);
            }),
            $A.getCallback(function(error) {
                // Something went wrong
                alert('An error occurred getting events : ' + error.message);
            })
        ).catch(function(error) {
            $A.reportError("Please Contact Your System Administrator:", error);
        });



    },
    scriptsLoaded: function(component, event, helper) {
        var getEventPromise = helper.getEvents(component, event, helper);
        getEventPromise.then(
            $A.getCallback(function(result) {
                var responseMap = result['responseMap'];
                component.set("v.eventsMap", responseMap['eventsMap']);
                //helper.setPlantEventColor(component, event, helper);
                //helper.renderCalendar(component, event, helper);

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
    addBrandToCalendar: function(component, event, helper) {
        helper.addBrandToCalendar(component, event, helper);
        var currentBrand = component.get('v.currentBrand');

        //helper.updateBrandToDisplayList(component, event, helper);

        var getEventPromise = helper.getEvents(component, event, helper);
        getEventPromise.then(
            $A.getCallback(function(result) {
                var responseMap = result['responseMap'];
                component.set("v.eventsMap", responseMap['eventsMap']);
                var allEventDataPromise = helper.getEventData(component, event, helper);
                return allEventDataPromise;

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        ).then(
            $A.getCallback(function(result) {
                var calendarComponent = component.find('calendar');
                calendarComponent.renderOnlyCalendar();
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
    hideSpinner: function(component, event, helper) {
        helper.hideSpinner(component, event, helper);
    },
    showSpinner: function(component, event, helper) {
        helper.showSpinner(component, event, helper);
    },
    doneRendering: function(component, event, helper) {
        component.set('v.doneRendering', true);
    },
    handleViewChange: function(component, event, helper) {
        helper.setCalendarView(component, event, helper);
        var getEventPromise = helper.getEvents(component, event, helper);
        getEventPromise.then(
            $A.getCallback(function(result) {
                var responseMap = result['responseMap'];
                component.set("v.eventsMap", responseMap['eventsMap']);
                var allEventDataPromise = helper.getEventData(component, event, helper);
                return allEventDataPromise;

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        ).then(
            $A.getCallback(function(result) {
                helper.renderCalendar(component, event, helper);
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
    handleDayEvent: function(component, event, helper) {
        var dayAction = event.getParam('action');
        console.log('got action ', dayAction);

        if (dayAction == 'NEW') {
            helper.moveToNextScreen(component, event, helper);
            /*var getEventPromise = helper.getEvents(component, event, helper);
            getEventPromise.then(
                $A.getCallback(function(result) {
                    var responseMap = result['responseMap'];
                    component.set("v.eventsMap", responseMap['eventsMap']);
                    var eventTimesPromise = helper.getEventData(component, event, helper);
                    return eventTimesPromise;
                }),
                $A.getCallback(function(error) {
                    // Something went wrong
                    var message = 'Please Contact Your System Administrator: \n\n';
                    helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
                })
            ).then(
                $A.getCallback(function(result) {
                    component.set('v.allEventData', result);
                    helper.renderCalendar(component, event, helper);
                }),
                $A.getCallback(function(error) {
                    // Something went wrong
                    var message = 'Please Contact Your System Administrator: \n\n';
                    helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
                })
            ).catch(function(error) {
                $A.reportError("error message here", error);
            });
            */
        }
    },
    updateCurrentPlant: function(component, event, helper) {
        var currentBrand = component.get('v.currentBrand');
        var brandInfoMap = component.get('v.brandInfoMap');
        component.set('v.currentPlant', brandInfoMap[currentBrand].Plant__c);
    },
    handleNavigate: function(component, event, helper) {
        var eventSelected = helper.hasDateBeenSelected(component, event, helper, event.getParam("action"));

        if (eventSelected || ((event.getParam("action") == 'PREVIOUS') || (event.getParam("action") == 'BACK'))) {
            var navigate = component.get("v.navigateFlow");
            navigate(event.getParam("action"));
        }

    },
    moveToNextPage: function(component, event, helper) {
        var moveToNextPage = component.get('v.moveToNextPage');

        if (moveToNextPage) {
            var navigate = component.get("v.navigateFlow");
            navigate('NEXT');
        }

    },
    handleCreateHoldDates: function(component, event, helper) {
        var startDate = component.get('v.holdStartDate');
        var endDate = component.get('v.holdEndDate');
        var remainingDateHolds = component.get('v.remainingDateHolds');

        var millisecondsPerDay = 24 * 60 * 60 * 1000;

        var date1 = new Date(startDate);
        var date2 = new Date(endDate);

        var utdStartDate = helper.toUTC(date1);
        var utcEndDate = helper.toUTC(date2);

        // Calculate the difference in milliseconds
        var numberOfDays = (utcEndDate - utdStartDate) / millisecondsPerDay + 1;
        try {
            var numOfWeekendDays = helper.getNumberOfWeekendsBetweenDates(utdStartDate, utcEndDate);

            numberOfDays = numberOfDays - numOfWeekendDays;

            if (numberOfDays > remainingDateHolds) {
                helper.showToast('Please select a date range that corresponds to the remaining date hold number', '', 'error');
                return;
            }
        }catch(err){
            console.log(err);
        }


        console.log(numberOfDays);
        var createOnHoldDateRecordPromise = helper.createOnHoldDateRecord(component, event, helper);
        createOnHoldDateRecordPromise.then(
            $A.getCallback(function(result) {
                var responseMap = result['responseMap'];

                if (result['responseMap']['dateRangeRejected']) {
                    helper.showToast('On Hold Range has already been taken', 'Please choose a new range', 'error');
                    component.set('v.holdStartDate', null);
                    component.set('v.holdEndDate', null);
                } else {
                    component.set('v.remainingDateHolds', remainingDateHolds - numberOfDays);
                    helper.showToast('Dates Reserved!', '', 'success');
                }
                console.log(responseMap);

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
    handleStartDateChange: function(component, event, helper) {
        helper.setMinEndDate(component, event, helper);
    }





})