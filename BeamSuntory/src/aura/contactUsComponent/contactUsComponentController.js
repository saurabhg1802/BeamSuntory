({
    loadOptions: function(component, event, helper) {
        var param = decodeURIComponent(window.location.search.substring(1).split('=')[1]);
        component.set('v.newCase.Brand__c', param.indexOf('+') == -1 ? param : param.split('+').join(' '));
        var action = component.get('c.getPickListValues');
        var brand = component.get('v.newCase.Brand__c');
        action.setParams({ brand: brand });
        action.setCallback(this, function(response) {
            helper.prepareData(component, response.getReturnValue(), brand);
        });
        $A.enqueueAction(action);

        window.addEventListener(
            'message',
            function(event) {
                if (event.data.name == 'reCaptchaToken') {
                    component.set('v.errorMessage', '');
                    component.set('v.reCaptchaToken', event.data.payload);
                }

                if (event.data.captchaVisible) {
                    var captchEl = document.getElementById('iFrame');
                    if (event.data.captchaVisible === 'visible') {
                        captchEl.classList.add('reCaptchaBig');
                        captchEl.classList.remove('reCaptchaSmall');
                    } else {
                        captchEl.classList.remove('reCaptchaBig');
                        captchEl.classList.add('reCaptchaSmall');
                    }
                }
                component.set('v.isContactUsOpen', true);
            },
            false
        );
    },
    setHelpOptions: function(component, event, helper) {
        var howCanIHelp = event.getSource().get('v.value');
        howCanIHelp.toUpperCase() == 'Product or Packaging issue'.toUpperCase()
            ? component.set('v.showAdditionalInfo', true)
            : component.set('v.showAdditionalInfo', false);
        component.set('v.additionalInformationOptions', component.get('v.additionalInformationMap')[howCanIHelp]);
    },
    submitCase: function(component, event, helper) {
        var index = component.get('v.currentPanel');
        if (index < component.get('v.totalPanels') - 1 && component.get('v.showAdditionalInfo')) {
            ++index;

            if (!helper.validateForm(component, index)) {
                helper.showToast('Error!', 'Please review the errors.', 'error');
                return;
            }

            if (index == 2 && !component.get('v.reCaptchaToken')) {
                component.set('v.errorMessage', 'You need to verify reCAPTCHA.');
                helper.showToast('Error!', 'Please verify reCaptcha.', 'error');
                return;
            }

            // Initial Case Insert (Complaint)
            if (index == component.get('v.totalPanels') - 1) {
                component.set('v.currentStep', index + 1 + '');
                component.set('v.currentPanel', index);
                console.log('case creation');
                helper.createNewCase(component, component.get('v.caseId'), true, function() {
                    helper.changeFrame(component, index);
                });
            } else {
                component.set('v.currentStep', index + 1 + '');
                component.set('v.currentPanel', index);
                helper.changeFrame(component, index);
                component.set('v.errorMessage', '');
            }
        } else if (!component.get('v.showAdditionalInfo')) {
            // Inquiry Creation
            if (!helper.validateForm(component, index + 1)) {
                helper.showToast('Error!', 'Please review the errors.', 'error');
                return;
            }
            if (!component.get('v.reCaptchaToken')) {
                component.set('v.errorMessage', 'You need to verify reCAPTCHA.');
                helper.showToast('Error!', 'Please verify reCaptcha.', 'error');
                return;
            }
            helper.createNewCase(component, null, false);
        } else {
            helper.updateCase(component, component.get('v.caseId'));
        }
    },
    openLotCode: function(component, event, helper) {
        component.set('v.lotCode', true);
    },
    closeLotCode: function(component, event, helper) {
        component.set('v.lotCode', false);
    },
    handleUploadFinished: function(component, event) {
        // Get the list of uploaded files
        var uploadedFiles = event.getParam('files');
        if (typeof component.get('v.fileName')[0] === 'string') {
            component.set('v.fileName', uploadedFiles);
        } else {
            var files = component.get('v.fileName');
            component.set('v.fileName', [...files, ...uploadedFiles]);
        }
    },
    previousPage: function(component, event, helper) {
        var index = component.get('v.currentPanel');
        component.set('v.currentPanel', --index);
        component.set('v.currentStep', index + 1 + '');
        helper.changeFrame(component, index);
    },
    confirmEmailAddress: function(component, event, helper) {
        var eventSource = event.getSource();
        var email = component.get('v.newAccount.PersonEmail');
        var confirmEmail = eventSource.get('v.value');
        if (!confirmEmail) {
            eventSource.setCustomValidity('Confirm Email must not be empty.');
        } else if (eventSource.get('v.validity').typeMismatch) {
            eventSource.setCustomValidity('You have entered an invalid format.');
        } else if (confirmEmail.toUpperCase() !== email.toUpperCase()) {
            eventSource.setCustomValidity('Confirm Email must be same.');
        } else {
            eventSource.setCustomValidity('');
        }
        eventSource.showHelpMessageIfInvalid();
    },
    setLotCode: function(component, event, helper) {
        var value = event.getSource().get('v.value');
        value.toUpperCase() == 'I no longer have the bottle'.toUpperCase() ? component.set('v.isLotCodeRequired', false) : component.set('v.isLotCodeRequired', true);
	}
});