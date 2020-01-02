({
    init: function(component, event, helper) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success);

            function success(position) {
                var lat = position.coords.latitude;
                var long = position.coords.longitude;
                component.set('v.latitude', lat);
                component.set('v.longitude', long);

                console.log(lat);
                console.log(long);
                helper.updateGeolocationOnRecord(component,event, helper);
            }
        } else {
            error('Geo Location is not supported');
        }

    },
})