/*
** Name: UpdateBrandTerritory_CalendarSettings
** Description: This trigger will add territory and brand in calendar values custom settings whenever 
                record is inserted or updated and on delete trigger will delete the corresponding record 
                from the custom settings
** Version History
Date                   By                    Description
---------------------------------------------------------------------------------------
01/20/2016        TCS DEV team          created UpdateBrandTerritory_CalendarSettings
02/17/2016        TCS DEV team          Added Brand Family Hierarchy for PL4Brand

*/
trigger UpdateBrandTerritory_CalendarSettings on Tags__c (after Insert,after Update, after delete) {
    List<Calendar_Values__c> lstCalendarvalues= new List<Calendar_Values__c>();
    List<Calendar_Dependent_Values__c> lstCalendarDependentVal= new List<Calendar_Dependent_Values__c>();
    Map<Id,List<Tags__c>> brandfamilyMap = new Map<Id,List<Tags__c>>();
    set<Id> brandfamilyIdSet= new Set<Id>();
    List<Tags__c>  relatedBrandFamilyLst;
    set<String> inactiveBrandSet= new set<String>();
    Map<id, RecordType> recordTypeMap= new Map<id, RecordType>([select id , name from RecordType where SobjectType='Tags__c']);
    if(trigger.isInsert || trigger.isUpdate){
        for(Tags__c tag: trigger.new){
           
           if(recordTypeMap.get(tag.recordtypeId).name=='Territory'){   
                Calendar_Values__c calenValueObject= new Calendar_Values__c();
                calenValueObject.Setting__c='Program__c.TerritoryName__c';
                calenValueObject.Value__c=tag.Name;
                calenValueObject.Count__c=0;
                calenValueObject.Name=tag.id;
                calenValueObject.isdata__c=true;
                lstCalendarvalues.add(calenValueObject);  
            }    
            
            if(recordTypeMap.get(tag.recordtypeId).name=='PL4 Brand' && tag.BrandFamily__c!=null && tag.IsActive__c==true)   {
                if(brandfamilyMap.get(tag.BrandFamily__c)!=null){
                    brandfamilyMap.get(tag.BrandFamily__c).add(tag);
                }
                else{
                    List<Tags__c> brandfamilyLst= new List<Tags__c>();
                    brandfamilyLst.add(tag);
                    brandfamilyMap.put(tag.BrandFamily__c,brandfamilyLst);
                }
                brandfamilyIdSet.add(tag.BrandFamily__c);
                if(trigger.isUpdate && trigger.newmap.get(tag.id).BrandFamily__c!= trigger.oldmap.get(tag.id).BrandFamily__c){
                    inactiveBrandSet.add(string.valueof(trigger.oldmap.get(tag.id).BrandFamily__c)+string.valueof(tag.id));
                } 
                 
                
            }
           
            if(recordTypeMap.get(tag.recordtypeId).name=='PL4 Brand' && tag.BrandFamily__c!=null && tag.IsActive__c==false){
                inactiveBrandSet.add(string.valueof(tag.BrandFamily__c)+string.valueof(tag.id));
            } 
                    
        }
        
        if(inactiveBrandSet.size()>0){
             List<Calendar_Dependent_Values__c> delCalendarDepenedentval=[select id from Calendar_Dependent_Values__c where External_Id__c in :inactiveBrandSet];
             try{
                 if(!delCalendarDepenedentval.isEmpty() && delCalendarDepenedentval!=null){
                    delete delCalendarDepenedentval;
                 }   
             }
             catch(Exception e){
                system.debug('Error in deleting inactive brands'+ delCalendarDepenedentval);
             }
        }
        if(brandfamilyIdSet.size()>0){
                relatedBrandFamilyLst= [select Id, name from Tags__c where Id in : brandfamilyIdSet and recordtype.name='Brand Family'];
            
            
            If(!relatedBrandFamilyLst.isEmpty() && relatedBrandFamilyLst!=null){
                for(Tags__c bFamily : relatedBrandFamilyLst){
                    Calendar_Values__c brandFamilyVal= new Calendar_Values__c();
                    brandFamilyVal.Setting__c='Program__c.BrandFamilyName__c';
                    brandFamilyVal.Value__c=bFamily.Name;
                    brandFamilyVal.Count__c=0;
                    brandFamilyVal.Name=bFamily.id;
                    brandFamilyVal.isdata__c=true;
                    lstCalendarvalues.add(brandFamilyVal); 
                    for(Tags__c pl4Brand: brandfamilyMap.get(bFamily.id)){
                        Calendar_Dependent_Values__c calDependentObj= new Calendar_Dependent_Values__c();
                        calDependentObj.Name=pl4Brand.id;
                        calDependentObj.Setting__c='Program__c.Brand__c';
                        calDependentObj.Value__c=pl4Brand.Name;
                        calDependentObj.Controlling_Value__c=bFamily.Name ;
                        calDependentObj.External_Id__c=string.valueOf(bFamily.id)+string.valueOf(pl4Brand.id);
                        calDependentObj.Object__c='Tags__c';
                        lstCalendarDependentVal.add(calDependentObj);
                    }
                }
                
            }
            
            if(!lstCalendarDependentVal.isEmpty() && lstCalendarDependentVal!=null){
                 upsert lstCalendarDependentVal External_Id__c;
             }
             
            if(!lstCalendarvalues.isEmpty() && lstCalendarvalues!=null){
                 upsert lstCalendarvalues name;
             }
         }  
     }    
     
     if(Trigger.isDelete) {
         set<string> deleteTagSet= new set<string>();
         set<string> brandFamilyNameSet= new set<string>();
         set<string> brandnameSet= new set<string>();
         for(Tags__c tag: trigger.old){
              if(recordTypeMap.get(tag.recordtypeId).name=='Territory' || recordTypeMap.get(tag.recordtypeId).name=='Brand Family'){
                   deleteTagSet.add(string.valueof(tag.id));
                   
              }
              if(recordTypeMap.get(tag.recordtypeId).name=='Brand Family'){
                brandFamilyNameSet.add(tag.name);
              }
              if(recordTypeMap.get(tag.recordtypeId).name=='PL4 Brand'){
                brandnameSet.add(tag.id);
              }
              
         }
         List<Calendar_Values__c> delCalendarvalues=[select id from Calendar_Values__c where isdata__c=true and Name in :deleteTagSet];    
         List<Calendar_Dependent_Values__c> delCalendarDepenedentval=[select id from Calendar_Dependent_Values__c where Controlling_Value__c in :brandFamilyNameSet or Value__c in : brandnameSet];    
         if(!delCalendarvalues.isEmpty() && delCalendarvalues!=null){
             delete delCalendarvalues;
         } 
         if(!delCalendarDepenedentval.isEmpty() && delCalendarDepenedentval!=null){
             delete delCalendarDepenedentval;
         } 
                   
     }
 
}