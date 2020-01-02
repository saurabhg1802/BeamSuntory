({
    init: function(component, event, helper) {
        helper.getStaticResource(component, event, helper);
    },
    selectProgram: function(component, event, helper) {
        console.log('program has been selected');
        helper.selectProgram(component, event, helper);
    },
    selectProgramType: function(component, event, helper) {
        helper.selectProgramType(component, event, helper);
    },
    hoverOverProgramType: function(component, event, helper) {
        helper.hoverOverProgramType(component, event, helper);
    }
})