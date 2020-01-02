({
    init: function(component, event, helper) {
        helper.init(component, event, helper);
        var brand = component.get('v.currentBrand');
        var attendeeLimit = component.get('v.attendeeLimit');
        
        component.set('v.numberOfAttendeesLimit', attendeeLimit[brand]);
    },
    created: function(component, event, helper) {
        helper.created(component, event);
    },
    renderCalendar: function(component, event, helper) {
        helper.setCurrentBrandLabel(component, event, helper);
        helper.showSpinner(component, event, helper);
        helper.destroyCalendar(component, event, helper);
        helper.renderCalendar(component, event, helper);
    },
    renderOnlyCalendar: function(component, event, helper) {
        helper.renderCalendar(component, event, helper);
    },
    createRecord: function(component, event, helper) {
        var brandColorMap = component.get('v.brandColorMap');
        var currentBrand = component.get('v.currentBrand');
        var isModalValid = helper.validateModal(component, event, helper);
        console.log('isModalValid ', isModalValid);
        console.log('current brand ', currentBrand);
        if (!isModalValid) {
            return;
        }
        var evObj = {
            "title": component.get('v.titleVal'),
            "startDateTime": moment(component.get('v.scheduledDate')).format("YYYY-MM-DD"),
            "endDateTime": moment(component.get('v.scheduledDate')).format("YYYY-MM-DD"),
            "description": component.get('v.descriptionVal'),
            "plant": component.get('v.currentPlant'),
            "brand": component.get('v.currentBrand'),
            "timeOfDay": component.get('v.selectedTimePeriod'),
            "timeSlot": component.get('v.selectedTimeSlot'),
            "scheduledDate": moment(component.get('v.scheduledDate')).format("YYYY-MM-DD"),
            "initiatorId": component.get('v.userId'),
            "boxedLunches": component.get('v.boxedLunchVal'),
            "isBottling": component.get('v.isBottling'),
            "waitingOptionsVal": component.get('v.waitingOptionsVal'),
            "isTour": component.get('v.isTour')
        };
        console.log('NEW EVENT >> ', evObj);
        if (component.get('v.idVal')) {
            evObj.id = component.get('v.idVal');
            //$('#calendar').fullCalendar('removeEvents', component.get('v.idVal'));
        }
        helper.closeModal(component, event);
        
        var upsertEventPromise = helper.upsertEvent(component, helper, evObj);
        upsertEventPromise.then(
            $A.getCallback(function(result) {
                
                if(result['eventAlreadyExists']){
                    helper.showToast('Sorry, this day was just booked by another user. Please select another day.', 'Error', 'error');
                }
                else{
                    component.set('v.idVal', result['newEvent'].Id);
                    component.set('v.currentEventId', result['newEvent'].Id);
                    
                    helper.showToast('Day Booked!', 'Success', 'success');
                    helper.handleDayEvent(component, event, helper, 'NEW');
                }
                /*var newEvent = {
                    id: result.Id,
                    title: result.title,
                    start: moment(result.startDateTime),
                    end: moment(result.startDateTime),
                    description: result.description,
                    owner: result.owner,
                    color: 'blue',
                    textColor: 'white'
                }


                component.set('v.eventCreated', true);
                component.set('v.currentEvent', newEvent);
                component.set('v.currentEventId', newEvent.id);
                component.set('v.scheduledDate', evObj.scheduledDate);
                $('#calendar').fullCalendar('renderEvent', newEvent);

                component.set('v.titleVal', '');
                component.set('v.idVal', result.Id);
                component.set('v.startDateTimeVal', '');
                component.set('v.endDateTimeVal', '');
                component.set('v.descriptionVal', '');
                //helper.moveToNextScreen(component,event, helper);
                */
                
                
                
            }),
            $A.getCallback(function(error) {
                // Something went wrong
                alert('An error occurred : ' + error.message);
            })
        );
    },
    openModal: function(component, event, helper) {
        helper.openModal(component, event);
    },
    closeModal: function(component, event, helper) {
        helper.closeModal(component, event);
    },
    reloadEvents: function(component, event, helper) {
        helper.removeEvents(component, event, helper, false);
        helper.loadEvents(component, event, helper);
    },
    buildEventList: function(component, event, helper) {
        //helper.buildEventList(component, event, helper);
    },
    handleTimeZoneChange: function(component, event, helper) {
        helper.setCurrentBrandLabel(component, event, helper);
        helper.showSpinner(component, event, helper);
        helper.destroyCalendar(component, event, helper);
        helper.renderCalendar(component, event, helper);
    },
    doneRendering: function(component, event, helper) {
        component.set('v.doneRendering', true);
    },
    toggleBottleVal: function(component, event, helper) {
        helper.toggleBottleVal(component, event, helper);
    },
    togglePrivateTourVal: function(component, event, helper) {
        var isTour = component.find('private_tour').get('v.checked');
        
        if (isTour) {
            component.set('v.isTour', true);
        } else {
            component.set('v.isTour', false);
        }
    },
    timePeriodChange: function(component, event, helper) {
        
        var availableTimeSlotByDay = component.get('v.availableTimeSlotByDay');
        var checkVal = component.find('checkVal').get('v.checked');
        component.set('v.selectedTimePeriod', event.target.value);
        var checkDate = component.get('v.scheduledDate');
        var day = moment(checkDate).format('YYYY-MM-DD');
        var amArray = ['09:00 AM','10:30 AM'];
        var pmArray = ['12:00 PM'];
        
        console.log('amArray:::',amArray);
        console.log('pmArray:::',pmArray);
        if(event.target.value == 'AM' && !checkDate.includes("2019")){
            if(availableTimeSlotByDay.hasOwnProperty(day)){
                if(availableTimeSlotByDay[day].hasOwnProperty('09:00 AM')){
                    amArray.splice(amArray.indexOf('09:00 AM'),1);
                    console.log('amArray1:::',amArray);
                }if(availableTimeSlotByDay[day].hasOwnProperty('10:30 AM')){
                    amArray.splice(amArray.indexOf('10:30 AM'),1);
                    console.log('amArray2:::',amArray);
                }  
            }
            component.set('v.amValues',amArray); 
            component.set('v.amTimeSlot', true);
            component.set('v.pmTimeSlot', false); 
            component.set('v.slotDisabled', false); 
        }
        else if(event.target.value == 'PM'&& !checkDate.includes("2019")){
            if(availableTimeSlotByDay.hasOwnProperty(day) && availableTimeSlotByDay[day].hasOwnProperty('12:00 PM')){
                pmArray.splice(pmArray.indexOf('12:00 PM'),1);
                console.log('pmArray:::',pmArray);
            }
            component.set('v.pmValues',pmArray); 
            component.set('v.pmTimeSlot', true);
            component.set('v.amTimeSlot', false); 
            component.set('v.slotDisabled', false); 
        }
            else{
                component.set('v.slotDisabled', true); 
            }
    },
    removePrompt: function(component, event, helper) {
        component.set('v.showDayIsBookedPrompt', false);
    },
    showToast: function(component, event, helper) {
        helper.showToast(component, event, helper);
    },
    handleButtonClick: function(component, event, helper) {
        var dayBooked = component.get('v.dayBooked');
        component.set('v.dayBooked', !dayBooked);
        helper.setSelectedTimeToAm(component, event, helper);
    },
    hideSpinner: function(component, event, helper) {
        component.set("v.Spinner", false);
    },
    showSpinner: function(component, event, helper) {
        component.set("v.Spinner", true);
    },
    selectEventMethod : function(component, event, helper) {
        //cmp.set('v.myString','Hello World');
        var vx = component.get("v.eventSelect");
        //fire event from child and capture in parent
        $A.enqueueAction(vx);
    }
    
    
})