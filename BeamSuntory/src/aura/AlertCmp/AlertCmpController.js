({
	goToRecord: function (component, event, helper) {
		console.log('clicked');
		var record = component.get('v.record');
		console.log(record);
		var url = '/company/s/case/' + record;
		var urlEvent = $A.get("e.force:navigateToURL");
		urlEvent.setParams({
			'url': url
		});
		console.log(urlEvent);
		urlEvent.fire();
	}
})