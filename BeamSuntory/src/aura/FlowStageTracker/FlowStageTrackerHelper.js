({
    setPathType: function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        var pathType = 'path';

        if (device == 'DESKTOP') {
        	pathType = 'path';
        } else if (device == 'PHONE') {
        	pathType = 'base';

        } else if (device == 'TABLET') {
        	pathType = 'path';
        }

        component.set('v.type', pathType);
    }
})