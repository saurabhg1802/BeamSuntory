({
    init: function(component, event, helper) {
        this.buildEventList(component, event, helper);
        this.setModalFieldVisibility(component, event, helper);
        this.setDefaultValues(component, event, helper);


    },
    upsertEvent: function(component, helper, evObj, callback) {
        var action = component.get("c.upsertEvents");
        console.log(JSON.stringify(evObj));
        action.setParams({
            "sEventObj": JSON.stringify(evObj),
            "plant": component.get('v.currentPlant'),
            "brand": component.get('v.currentBrand')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    resolve(retVal['responseMap']);
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
    deleteEvent: function(component, event, eventId) {
        console.log('delete in helper');
        var action = component.get("c.deleteEvent");

        action.setParams({
            "eventId": eventId,
            "sObjectName": component.get("v.sObjectName"),
            "titleField": component.get("v.titleField"),
            "startDateTimeField": component.get("v.startDateTimeField"),
            "endDateTimeField": component.get("v.endDateTimeField"),
            "descriptionField": component.get("v.descriptionField"),
            "userField": component.get("v.userField")
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

    openModal: function(component, event) {
        var viewOnly = component.get('v.viewOnly');
        if (!viewOnly) {
            document.getElementById("modal").classList.add("slds-fade-in-open");
            document.getElementById("backdrop").classList.add("slds-backdrop--open");
        } else {
            helper.showToast('You are in view only mode.', '', 'error');
        }
    },
    closeModal: function(component, event) {
        //var modal = component.find('modal');
        document.getElementById("modal").classList.remove("slds-fade-in-open");
        //$A.util.removeClass(modal, 'slds-fade-in-open');
        //var backdrop = component.find('backdrop');
        //$A.util.removeClass(backdrop, 'slds-backdrop--open');
        document.getElementById("backdrop").classList.remove("slds-backdrop--open");
        component.set('v.amTimeSlot', false);
        component.set('v.pmTimeSlot', false); 
        component.set('v.slotDisabled', false); 
        document.getElementById('am').checked = false;
        document.getElementById('pm').checked = false;
    },
    renderCalendar: function(component, event, helper) {
        var eventList = component.get('v.eventList');
        var events = component.get("v.events");
        var plantInfo = component.get('v.plantInfoMap');
        var brandInfoMap = component.get('v.brandInfoMap');
        var currentBrandLabel = component.get('v.currentBrandLabel');
        var currentPlant = component.get('v.currentPlant');
        var timePeriodPerEvent = component.get('v.timePeriodMap');
        var allEventData = component.get('v.allEventData');
        var currentBrand = component.get('v.currentBrand');
        var currentEventId = component.get('v.currentEventId');
        var calendarEvents;
        var bookedDays = component.get('v.bookedDays');



        var brandColorMap = component.get('v.brandColorMap');
        var calendarButtons = component.get('v.calendarButtons');
        var viewOnly = component.get('v.viewOnly');
        var eventArray = [];
        var timezone = 'UTC';
        var eventIdsToRemove = [];
        var color;
        var textColor;
        var newTripDate;
        var today = new Date();
        var todayMoment = moment(today).format("YYYY-MM-DD");

        calendarEvents = events;

        if (eventList != undefined) {
            this.removeEvents(component, event, helper, function() {
                helper.hideSpinner(component, event, helper);
            });
        }

        component.set('v.eventList', null);
        $.each(calendarEvents, function(index, value) {
            //console.log('val ', value);
            var scheduledDate = helper.setDateTimeForEvent(component, value);
            //console.log('scheduledDate:::',scheduledDate);
            // assign the most recently created event a different color
            if (currentEventId === value.Id) {
                newTripDate = value.scheduledDate;
                console.log('newTripDate:::',newTripDate);
                component.set('v.eventCreated', true);
                color = 'blue';
                textColor = '#e1d0b7';
            } else {
                textColor = brandColorMap[value.brand].text_color;
                color = brandColorMap[value.brand].event_color;

            }
            if(value.brand != 'Makers Mark'){
                var newEvent = {
                    id: value.Id,
                    title: value.timeOfDay + ' - ' + value.brand + ' - ' + 'Booked',
                    start: scheduledDate.startDate,
                    end: scheduledDate.startDate,
                    description: value.description,
                    color: color,
                    textColor: textColor,
                    initiatorId: value.initiatorId
                }   
                }
            else if(value.brand == 'Makers Mark' && scheduledDate.startDate.includes("2019")){
                
                var newEvent = {
                    id: value.Id,
                    title: value.timeOfDay + ' - ' + value.brand + ' - ' + 'Booked',
                    start: scheduledDate.startDate,
                    end: scheduledDate.startDate,
                    description: value.description,
                    color: color,
                    textColor: textColor,
                    initiatorId: value.initiatorId
                }
                }
            
            
            
            else{
                    var newEvent = {
                        id: value.Id,
                        title: value.timeSlot + ' - ' + value.brand + ' - ' + 'Booked',
                        start: scheduledDate.startDate,
                        end: scheduledDate.startDate,
                        description: value.description,
                        color: color,
                        textColor: textColor,
                        initiatorId: value.initiatorId
                    }
                    }
            
            eventArray.push(newEvent);
        });
        component.set('v.eventList', eventArray);
        helper.removeEvents(component, event, helper, false);
        helper.reRenderEvents(component, event, helper);

        $(document).ready(function() {

            $('#calendar').fullCalendar({
                header: {
                    left: 'today prev,next',
                    center: 'title',
                    right: calendarButtons
                },
                defaultDate: moment().format("YYYY-MM-DD"),
                displayEventTime: false,
                navLinks: true, // can click day/week names to navigate views
                editable: !viewOnly,
                eventLimit: true, // allow "more" link when too many events
                weekends: component.get('v.weekends'),
                eventBackgroundColor: component.get('v.eventBackgroundColor'),
                eventBorderColor: component.get('v.eventBorderColor'),
                eventTextColor: component.get('v.eventTextColor'),
                timezone: 'UTC',
                events: eventArray,
                businessHours: {
                    // days of week. an array of zero-based day of week integers (0=Sunday)
                    dow: [1, 2, 3, 4, 5], // Monday - Thursday

                    start: '7:00', // a start time (7am in this example)
                    end: '18:00', // an end time (6pm in this example)
                },
                eventAfterAllRender: function(view) {
                    helper.hideSpinner(component, event, helper);
                },
                eventClick: function(calEvent, jsEvent, view) {
                    console.log('event click event');
                    //console.log('cal event ', calEvent);
                    //console.log('date >> ', calEvent.start.format("YYYY-MM-DD"));



                    component.set('v.titleVal', calEvent.title);
                    component.set('v.descriptionVal', calEvent.description);
                    component.set('v.startDateTimeVal', calEvent.start.format("YYYY-MM-DD"));
                    //component.set('v.endDateTimeVal', moment(calEvent.end._i).format());
                    component.set('v.scheduledDate', calEvent.start.format("YYYY-MM-DD"));
                    component.set('v.idVal', calEvent.id);
                    component.set('v.newOrEdit', 'Edit');

                    // if the user is not the owner then they can not modify the event
                    if (currentEventId === calEvent.id && currentEventId != null && currentEventId != undefined) {
                        helper.openModal(component, event);
                    } else {
                        helper.showToast('Please select another event.', 'You do not own this event.', 'error');
                    }
                },
                dayRender: function(date, cell) {

                    var checkDate = helper.checkIfDayIsFullyBooked(component, event, helper, date.format('YYYY-MM-DD'));
                    //console.log('date check ', date.format('YYYY-MM-DD'));
                    if (!viewOnly) {
                        if (checkDate.dayIsBooked || todayMoment > date.format('YYYY-MM-DD')) {
                            cell.css("background-color", component.get('v.unAvailableColorCode'));
                        } else if (checkDate.isAmBooked) {
                            cell.css("background-color", component.get('v.pmAvailableColorCode'));
                        } else if (checkDate.isPmBooked) {
                            cell.css("background-color", component.get('v.amAvailableColorCode'));
                        } else {
                            cell.css("background-color", component.get('v.availableColorCode'));
                        }
                    } else {
                        cell.css("background-color", component.get('v.availableColorCode'));
                    }
                },
                eventRender: function(event, element, view) {
                    helper.setModalFieldVisibility(component, event, helper);
                    var dateString = event.start.format("YYYY-MM-DD");
                    var checkDate;
                    var returnStatus = true;
                    // loop through events 
                    if (!viewOnly) {
                        checkDate = helper.checkIfDayIsFullyBooked(component, event, helper, dateString);
                        //console.log('------------------------');
                        //console.log(dateString)
                        //console.log(checkDate);
                        if (checkDate.dayIsBooked || todayMoment > dateString || bookedDays.indexOf(dateString) > -1) {
                            $(view.el[0]).find('.fc-day[data-date=' + dateString + ']').css('background-color', component.get('v.unAvailableColorCode'));
                            returnStatus = false;
                        } else if (checkDate.isAmBooked) {
                            $(view.el[0]).find('.fc-day[data-date=' + dateString + ']').css('background-color', component.get('v.pmAvailableColorCode'));
                            returnStatus = false;
                        } else if (checkDate.isPmBooked) {
                            $(view.el[0]).find('.fc-day[data-date=' + dateString + ']').css('background-color', component.get('v.amAvailableColorCode'));
                            returnStatus = false;
                        }

                        if (currentEventId != null && currentEventId != undefined) {
                            if (dateString === newTripDate) {
                                event.color = 'blue';
                                $(view.el[0]).find('.fc-day[data-date=' + dateString + ']').css('background-color', component.get('v.availableColorCode'));
                                returnStatus = true;
                            }
                        }

                    }

                    return returnStatus;
                },
                dayClick: function(date, jsEvent, view) {
                    console.log('day click event');
                    var eventCreated = component.get('v.eventCreated');
                    var eventId = component.get('v.idVal');
                    try {

                        if (viewOnly) {
                            helper.showToast('You are in view only mode.', 'Error', 'error');
                            return;
                        }
                        if (eventCreated) {
                            helper.showToast('You are only able to add one trip at a time.', 'Error', 'error');
                            return;
                        }
                        if (todayMoment > moment(date.format())._i) {
                            helper.showToast('Please select a day greater than today.', 'Error', 'error');
                            return;
                        }
                        if (eventId == null || eventId == '') {
                            helper.resetDayModal(component, event, helper);
                        }

                        if (currentBrand == 'Makers Mark' && (moment(date.format()).day() == 1 || moment(date.format()).day() == 2)) {
                            component.set('v.showBoxedLunches', true);
                        }

                        helper.setModalFieldVisibility(component, event, helper);

                        if (date._f == "YYYY-MM-DD") {
                            // may not need date time if only displaying the date
                            component.set('v.startDateTimeVal', moment(date.format()).add(0, 'hours').format());
                            component.set('v.endDateTimeVal', moment(date.format()).add(0, 'hours').format());
                            component.set('v.scheduledDate', moment(date.format())._i);
                            component.set('v.descriptionVal', null);
                        } else {
                            // may not need date time if only displaying the date
                            component.set('v.startDateTimeVal', moment(date.format()).format());
                            component.set('v.endDateTimeVal', moment(date.format()).add(0, 'hours').format());
                            component.set('v.scheduledDate', moment(date.format())._i);
                            component.set('v.descriptionVal', null);
                        }
                        component.set('v.newOrEdit', 'New');
                        // if day is already booked then disaply a prompt saying that that the day is booked
                        try {
                            var checkDate = helper.checkIfDayIsFullyBooked(component, event, helper, moment(date.format())._i);

                            if (checkDate.dayIsBooked) {
                                //alert('day is booked, select another day');
                                //component.set('v.showDayIsBookedPrompt', true);
                                helper.showToast('This day is fully booked.', 'Please choose another day.', 'error');

                            } else {
                                //console.log(checkDate);
                                if (checkDate.isAmBooked) {
                                    component.set('v.morningTimeAvailable', false);
                                }
                                if (checkDate.isPmBooked) {
                                    component.set('v.afternoonTimeAvailable', false);
                                }
                                helper.openModal(component, event);


                            }
                        } catch (err) {
                            console.log(err);
                        }
                    } catch (err2) {
                        console.log(err2);
                    }
                }
            });
        });


    },
    hideSpinner: function(component, event, helper) {
        component.set("v.Spinner", false);
    },
    showSpinner: function(component, event, helper) {
        component.set("v.Spinner", true);
    },
    removeEvents: function(component, event, helper, callback) {
        var events = component.get('v.eventList');
        $('#calendar').fullCalendar('removeEvents');

        if (callback) {
            callback();
        }
    },
    loadEvents: function(component, event, helper) {
        var events = component.get('v.eventList');
        $('#calendar').fullCalendar('addEventSource', events);
    },
    reRenderEvents: function(component, event, helper) {
        var events = component.get('v.eventList');
        $('#calendar').fullCalendar('renderEvents', events);
    },
    buildEventList: function(component, event, helper) {
        var events = component.get("v.events");
        var brandColorMap = component.get('v.brandColorMap');
        var eventArray = [];
        $.each(events, function(index, value) {
            var newEvent = {
                id: value.Id,
                title: value.title,
                start: moment(value.startDateTime),
                end: moment(value.endDateTime),
                description: value.description,
                color: brandColorMap[value.brand]
            }
            eventArray.push(newEvent);;

        });
        component.set('v.eventList', eventArray);
    },
    destroyCalendar: function(component, event, helper) {
        $('#calendar').fullCalendar('destroy');
    },
    setCurrentBrandLabel: function(component, event, helper) {
        var currentPlant = component.get('v.currentPlant');
        var plantInfoMap = component.get('v.plantInfoMap');

        //component.set('v.currentBrandLabel', plantInfoMap[currentPlant].MasterLabel);
    },
    setDateTimeForEvent: function(component, plantEvent) {
        var startDate;
        var endDate;

        if (plantEvent.startDateTime != null) {
            startDate = moment(plantEvent.startDateTime);
            endDate = moment(plantEvent.startDateTime);
        } else {
            startDate = plantEvent.scheduledDate;
            endDate = plantEvent.scheduledDate;
        }

        return {
            startDate: startDate,
            endDate: endDate
        };
    },

    handleDayEvent: function(component, event, helper, action) {
        console.log('in handle day event');
        // call the event   
        var compEvent = component.getEvent('dayModifiedEvent');
        // set the action to the event attribute.  
        compEvent.setParams({
            'action': action
        });
        // fire the event  
        compEvent.fire();
    },
    setViewForAmPmButtons: function(component, event, helper) {
        // Brands that require am/pm option ['Knob Creek', 'Knob Creek Rye', 'Cruzan',]
        var amPmTripBrands = component.get('v.amPmTripBrands');
        var currentBrand = component.get('v.currentBrand');
        var brandTripLimitPerDay = component.get('v.brandTripLimitPerDay');

        if (amPmTripBrands.indexOf(currentBrand) > -1) {
            this.showAmPmOption(component, event, helper);
        } else if (brandTripLimitPerDay[currentBrand] != null && brandTripLimitPerDay[currentBrand] != undefined) {
            this.hideAmPmOption(component, event, helper);
        }
    },
    setViewForBottlingOption: function(component, event, helper) {
        // bottling only applies to knob creek
        var bottlingBrands = component.get('v.brandsThatOfferBottling');
        var currentBrand = component.get('v.currentBrand');

        if (bottlingBrands.indexOf(currentBrand) > -1) {
            this.showBottlingOption(component, event, helper);
        } else {
            this.hideBottlingOption(component, event, helper);
        }
    },
    showBottlingOption: function(component, event, helper) {
        component.set('v.showBottlingOption', true);
    },
    hideBottlingOption: function(component, event, helper) {
        component.set('v.showBottlingOption', false);
    },
    showAmPmOption: function(component, event, helper) {
        component.set('v.showAmPmOption', true);
    },
    hideAmPmOption: function(component, event, helper) {
        component.set('v.showAmPmOption', false);
    },
    setModalFieldVisibility: function(component, event, helper) {
        this.setViewForAmPmButtons(component, event, helper);
        this.setViewForBottlingOption(component, event, helper);
    },
    resetBookDayButton: function(component, event, helper) {
        console.log('resetting book day button');
        component.set('v.dayBooked', false);
    },
    resetDayModal: function(component, event, helper) {
        component.set('v.morningTimeAvailable', true);
        component.set('v.showBoxedLunches', false);
        component.set('v.afternoonTimeAvailable', true);
        component.set('v.numberOfAttendees', 0);
        component.set('v.isBottling', false);
        this.toggleBottleVal(component, event, helper);
        this.resetBookDayButton(component, event, helper);
    },
    setSelectedTimeToAm: function(component, event, helper) {
        component.set('v.selectedTimePeriod', 'AM');
    },
    setSelectedTimeToPm: function(component, event, helper) {
        component.set('v.selectedTimePeriod', 'PM');
    },
    setDefaultValues: function(component, event, helper) {
        var currentEventId = component.get('v.currentEventId');

        if (currentEventId != '') {
            component.set('v.eventCreated', true);
        }
    },

    checkIfDayIsFullyBooked: function(component, event, helper, dateString) {
        var brandTripLimitMap = component.get('v.brandTripLimitMap');
        var allEventData = component.get('v.allEventData');
        var currentPlant = component.get('v.currentPlant');
        var currentBrand = component.get('v.currentBrand');
        var plantTripByDayLimitReached = component.get('v.plantTripByDayLimitReached');
        //console.log('BRAND ', currentBrand);
        //console.log('allEventData[currentBrand] ', allEventData[currentBrand]);
        //console.log('dateString ', dateString);

        var dayIsBooked = false;
        var isAmBooked = false;
        var isPmBooked = false;
        var numOfEvents = 0;
        var tripNumberBased = false;
        var dayEventObj;

        var daysForCurrentBrand = Object.keys(allEventData[currentBrand]);
        var totalDayLimit = brandTripLimitMap[currentBrand].perDay;

        if (plantTripByDayLimitReached.hasOwnProperty(currentBrand)) {
            if (plantTripByDayLimitReached[currentBrand].hasOwnProperty(dateString)) {

                dayEventObj = allEventData[currentBrand][dateString];
                //var totalDayLimit = brandTripLimitMap[currentBrand].AM + brandTripLimitMap[currentBrand].PM;


                if (brandTripLimitMap[currentBrand].perDay === 0) {
                    //console.log('date ', dateString);
                    //console.log('am ', plantTripByDayLimitReached[currentBrand][dateString].AM);
                    //console.log('pm ', plantTripByDayLimitReached[currentBrand][dateString].PM);
                    // check list of a specific date
                    if (plantTripByDayLimitReached[currentBrand][dateString].AM &&
                        plantTripByDayLimitReached[currentBrand][dateString].PM) {
                        dayIsBooked = true;
                    } else {
                        // if available AM slots have reached their limit for the brand then set it to true
                        // this means that the AM times are all booked
                        if (plantTripByDayLimitReached[currentBrand][dateString].AM) {
                            isAmBooked = true;
                        }
                        if (plantTripByDayLimitReached[currentBrand][dateString].PM) {
                            isPmBooked = true;
                        }
                    }
                }
            }
        }
        /*else if (allEventData[currentBrand].hasOwnProperty(dateString)) {
                   dayEventObj = allEventData[currentBrand][dateString];
                   tripNumberBased = true;
                   var count = dayEventObj['totalEvents'];

                   if (count === totalDayLimit) {
                       dayIsBooked = true;
                   } else {
                       numOfEvents = totalDayLimit - count;
                   }
               } 
               */

        return {
            dayIsBooked: dayIsBooked,
            isAmBooked: isAmBooked,
            isPmBooked: isPmBooked,
            numOfEvents: numOfEvents,
            tripNumberBased: tripNumberBased
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
    toggleBottleVal: function(component, event, helper) {
        var isBottling = component.find('am_pm');
        var isBottlingChecked = false;
        if (isBottling) {
            isBottlingChecked = isBottling.get('v.checked');
        }
        var tooltip = component.find('custom_tooltip');

        if (isBottlingChecked) {
            component.set('v.isBottling', true);
            $A.util.removeClass(tooltip, 'slds-transition-hide');
            console.log('bottling can only be done in the AM ');
            //helper.showToast('bottling can only be done in the AM ', 'bottling can only be done in the AM .', 'error');
        } else {
            component.set('v.isBottling', false);
            $A.util.addClass(tooltip, 'slds-transition-hide');
        }
    },
    validateModal: function(component, event, helper) {
        var selectedTimePeriod = component.get('v.selectedTimePeriod');
		var selectedTimeSlot = component.get('v.selectedTimeSlot');
        var currentBrand = component.get('v.currentBrand');
        var checkDate = component.get('v.scheduledDate');
        if (!helper.checkAttendeeValidity(component, event, helper)) {
            return false;
        }
        if ((selectedTimePeriod == null || selectedTimePeriod == '') || 
            ((selectedTimeSlot == null || selectedTimeSlot == '') && 
             (currentBrand=='Makers Mark' && !checkDate.includes("2019")))) {
            helper.showToast('Please fill out required fields', '', 'error');
            helper.showTimePeriodError(component, event, helper);
            return false;
        } 
        else {
            helper.hideTimePeriodError(component, event, helper);
            return true;
        }

    },
    showTimePeriodError: function(component, event, helper) {
        var timePeriodError = component.find('time_period_error');
        $A.util.removeClass(timePeriodError, 'slds-hide');
    },
    hideTimePeriodError: function(component, event, helper) {
        var timePeriodError = component.find('time_period_error');
        $A.util.addClass(timePeriodError, 'slds-show');
    },
    moveToNextScreen: function(component, event, helper) {
        var navigate = component.getEvent("navigateFlowEvent");
        navigate.setParam("action", 'NEXT');
        navigate.fire();
    },
    showNotice: function(component, event, helper, type, message, title) {
        component.find('calendar_prompt').showNotice({
            "variant": type,
            "header": title,
            "message": message
        });
    },

    checkAttendeeValidity: function(component, event, helper) {
        var attendee_info = component.find('attendee_info');
        var isValid = attendee_info.checkValidity();
        console.log('Valid ', isValid);

        if (!isValid) {
            helper.showToast('Please check the number of attendees entered', 'Error', 'error');
        }

        return isValid;
    }






})