({
    init: function(component, event, helper) {
        component.set('v.columns', [{
            label: 'Type',
            fieldName: 'Type__c',
            type: 'text'
        }, {
            label: 'Insert Text',
            fieldName: 'Insert_Text__c',
            type: 'text'
        },
        {
            label: 'Attention',
            fieldName: 'Attention__c',
            type: 'text'
        },{
            label: 'Company',
            fieldName: 'Company__c',
            type: 'text'
        },{
            label: 'Street',
            fieldName: 'Street__c',
            type: 'text'
        },{
            label: 'City',
            fieldName: 'City__c',
            type: 'text'
        },{
            label: 'State',
            fieldName: 'State__c',
            type: 'text'
        },{
            label: 'Zip',
            fieldName: 'Zip__c',
            type: 'text'
        },{
            label: 'Phone',
            fieldName: 'Phone__c',
            type: 'text'
        }
        ]);




        helper.fetchData(component, event, helper);
    }
})