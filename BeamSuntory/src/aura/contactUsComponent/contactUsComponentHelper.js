({
    accObj: {},
    caseObj: {},
    createNewCase: function(component, caseId, isComplaint, callback) {
        const action = component.get('c.createCase');
        action.setParams({
            caseObj: component.get('v.newCase'),
            caseId: caseId,
            isComplaint: isComplaint,
            accountObj: component.get('v.newAccount'),
            accountId: component.get('v.accountId'),
            reCaptchaResponse: component.get('v.reCaptchaToken')
        });
        // set call back
        action.setCallback(this, function(response) {
            var returnValue = response.getReturnValue();
            console.log(JSON.stringify(returnValue));
            if (!returnValue || (returnValue['success'] && !returnValue['success'])) {
                this.toggleLoader(component, false);
                component.set('v.errorMessage', 'You need to verify ReCaptcha.');
                return;
            }
            var state = response.getState();
            if (state === 'SUCCESS' && !returnValue.hasOwnProperty('error')) {
                if (!isComplaint) {
                    component.set('v.caseNumber', response.getReturnValue());
                    component.set('v.submitMessage', $A.get('$Label.c.Success_Message'));
                    this.setDefaults(component);
                } else {
                    component.set('v.caseId', response.getReturnValue()['caseId']);
                    component.set('v.accountId', response.getReturnValue()['accountId']);
                    this.toggleLoader(component, false);
                    callback();
                }
            } else if (state === 'INCOMPLETE') {
                alert('From server: ' + response.getReturnValue());
                this.setDefaults(component);
            } else if (state === 'ERROR') {
                this.setDefaults(component);
                component.set('v.submitMessage', $A.get('$Label.c.Error_Message'));
            } else if (returnValue.hasOwnProperty('error')) {
                this.setDefaults(component);
                component.set('v.submitMessage', $A.get('$Label.c.Error_Message'));
            }
        });
        this.toggleLoader(component, true);
        // enqueue the action
        $A.enqueueAction(action);
    },
    updateCase: function(component, caseId) {
        var action = component.get('c.updateCase');
        action.setParams({
            caseObj: component.get('v.newCase'),
            caseId: caseId,
            accountObj: component.get('v.newAccount'),
            accountId: component.get('v.accountId')
        });
        action.setCallback(this, function(response) {
            var returnValue = response.getReturnValue();
            console.log(returnValue);
            var state = response.getState();
            if (state === 'SUCCESS' && returnValue.success) {
                this.setDefaults(component);
                component.set('v.caseNumber', returnValue.caseId);
                component.set('v.submitMessage', $A.get('$Label.c.Success_Message'));
            } else if (state === 'INCOMPLETE') {
                this.setDefaults(component);
            } else if (state === 'ERROR') {
                this.setDefaults(component);
                component.set('v.submitMessage', $A.get('$Label.c.Error_Message'));
            } else if (returnValue.hasOwnProperty('error')) {
                this.setDefaults(component);
                component.set('v.submitMessage', $A.get('$Label.c.Error_Message'));
            }
        });

        component.set('v.caseCreated', true);
        // enqueue the action
        $A.enqueueAction(action);
    },
    setDefaults: function(component) {
        component.set('v.caseCreated', false);
        component.set('v.caseId', '');
        component.set('v.accountId', '');
        component.set('v.newCase', {
            sobjectType: 'Case',
            Brand__c: '',
            Origin: 'Web',
            AdditionalInformation__c: '',
            How_can_we_help__c: '',
            Product_Type__c: '',
            Product_Size__c: '',
            Issue__c: '',
            Lot_Code__c: '',
            Description: '',
            Do_you_still_have_the_product__c: ''
        });
        component.set('v.newAccount', {
            sobjectType: 'Account',
            FirstName: '',
            LastName: '',
            PersonEmail: '',
            MailingCity: '',
            MailingState: '',
            MailingCountry: '',
            MailingPostalCode: '',
            MailingStreet: '',
            Phone: ''
        });
        component.set('v.fileName', ['No File Selected.']);
        component.set('v.selectedHelpOption', '');
        component.set('v.selectedSampleOption', '');
        component.set('v.address2', '');
        component.set('v.showAdditionalInfo', false);
        component.set('v.confirmEmail', '');
    },
    prepareData: function(component, data, brand) {
        var additionalInformation = {};
        var howCanIHelp = [];
        Object.keys(data['BrandCategoryHelpMapping__c'][0]).forEach(item => {
            howCanIHelp.push({ value: item, label: item });
            var additionalInformationArr = [];
            data['BrandCategoryHelpMapping__c'][0][item].forEach(val =>
                additionalInformationArr.push({ value: val, label: val })
            );
            additionalInformation[item] = additionalInformationArr.sort((a, b) =>
                a.label == b.label ? 0 : +(a.label > b.label) || -1
            );
        });
        component.set('v.lotCodeResource', $A.get('$Resource.' + data['lotCodeResource']));
        component.set('v.additionalInformationMap', additionalInformation);
        component.set('v.products', data[brand]);
        component.set(
            'v.countries',
            data['Country_of_Interest__c'].sort((a, b) => (a.label == b.label ? 0 : +(a.label > b.label) || -1))
        );
        component.set('v.issues', data['Issue__c']);
        component.set('v.sizes', data['Product_Size__c']);
        component.set(
            'v.helpOptions',
            howCanIHelp.sort((a, b) =>
                a.label === 'Product or Packaging issue'
                    ? -1
                    : b.label === 'Product or Packaging issue'
                    ? 1
                    : a.label == b.label
                    ? 0
                    : +(a.label > b.label) || -1
            )
        );
        component.set('v.sampleOptions', data['Do_you_still_have_the_product__c']);
        component.set('v.WebsiteUrl', data['weburl']);
    },
    changeFrame: function(component, index) {
        if (index == 1) {
            document.getElementById('iFrame').contentWindow.postMessage('resetReCaptcha', window.location.origin);
            component.set('v.reCaptchaToken', '');
        }
        var carouselContent = document.getElementsByClassName('slds-carousel__content')[0];
        var modalContent = document.getElementsByClassName('slds-modal__content')[0].clientHeight;
        var innerContent = document.getElementById(`content-0${index + 1}`).clientHeight;
        carouselContent.style.height = innerContent > modalContent ? innerContent + 'px' : modalContent - 52 + 'px';
        if (index == 0) {
            carouselContent.style.height = 'auto';
        }
        document.getElementsByClassName('slds-carousel__panels')[0].style.transform =
            `translateX(-` + `${index}` + `00%)`;
        document.getElementsByClassName('slds-modal__content')[0].scrollTop = 0;
    },
    validateForm: function(component, index) {
        return component.find(`contactUsForm${index}`).reduce(function(validSoFar, inputCmp) {
            inputCmp.showHelpMessageIfInvalid();
            return validSoFar && inputCmp.checkValidity();
            //return validSoFar && !inputCmp.get('v.validity').valueMissing && !inputCmp.get('v.validity').typeMismatch;
        }, true);
    },
    toggleLoader: function(component, isVisible) {
        component.set('v.caseCreated', isVisible);
    },
    setAccountDetails: function(component) {
        this.acc = JSON.parse(JSON.stringify(component.get('v.newAccount')));
        if (component.get('v.address2')) {
            this.acc.PersonMailingStreet = this.acc.PersonMailingStreet + ', ' + component.get('v.address2');
        }
    },
    showToast: function(title, message, type) {
        var toastEvent = $A.get('e.force:showToast');
        toastEvent.setParams({
            title: title,
            message: message,
            type: type
        });
        toastEvent.fire();
    }
});