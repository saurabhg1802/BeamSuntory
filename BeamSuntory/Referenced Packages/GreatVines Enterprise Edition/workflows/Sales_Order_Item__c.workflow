<?xml version="1.0" encoding="UTF-8"?>
<Workflow xmlns="http://soap.sforce.com/2006/04/metadata">
    <fieldUpdates>
        <fullName>Update_Item_Price</fullName>
        <field>Price__c</field>
        <formula>CASE( Price_Level_Native__c ,
&quot;Level 2&quot;,  Item__r.Price_Level_2__c,
&quot;Level 3&quot;,  Item__r.Price_Level_3__c,
&quot;Level 4&quot;,  Item__r.Price_Level_4__c,
&quot;Level 5&quot;,  Item__r.Price_Level_5__c,
Item__r.Price_List__c)</formula>
        <name>Update Item Price</name>
        <notifyAssignee>false</notifyAssignee>
        <operation>Formula</operation>
        <protected>true</protected>
    </fieldUpdates>
    <rules>
        <fullName>Check Pricing Level</fullName>
        <actions>
            <name>Update_Item_Price</name>
            <type>FieldUpdate</type>
        </actions>
        <active>false</active>
        <criteriaItems>
            <field>Sales_Order_Item__c.Price_Level_Native__c</field>
            <operation>notEqual</operation>
            <value>Custom</value>
        </criteriaItems>
        <triggerType>onAllChanges</triggerType>
    </rules>
</Workflow>
