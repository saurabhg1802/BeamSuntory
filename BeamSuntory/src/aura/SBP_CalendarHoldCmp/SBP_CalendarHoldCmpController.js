({
    init: function(component, event, helper) {
        helper.init(component, event, helper);
    },
    handleOnDayChange: function(component, event, helper) {
        var value = event.currentTarget.value.split(',');
        var timeInterval = event.currentTarget.dataset.timeinterval;
        var day = event.currentTarget.dataset.day;
        var month = event.currentTarget.dataset.month;
        var year = event.currentTarget.dataset.year;

        component.set('v.selectedDate', new Date(year, month - 1, day));
        component.set('v.selectedTimeSlot', value[1]);
        component.set('v.selectedTimeInterval', timeInterval);

        component.set('v.selectedDay', day);
        component.set('v.selectedMonth', month);
        component.set('v.selectedYear', year);
        console.log(day);
        console.log(month);
        console.log(year);
        helper.openModal(component, event, helper);



        console.log(new Date(year, month, day));
    },
    moveToNextScreen: function(component, event, helper) {
        var navigate = component.get("v.navigateFlow");
        navigate('NEXT');
    },
    handleNavigate: function(component, event, helper) {
        var navigate = component.get("v.navigateFlow");
        navigate(event.getParam("action"));
    },


})