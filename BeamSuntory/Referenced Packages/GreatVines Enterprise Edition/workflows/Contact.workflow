<?xml version="1.0" encoding="UTF-8"?>
<Workflow xmlns="http://soap.sforce.com/2006/04/metadata">
    <fieldUpdates>
        <fullName>Email_Key</fullName>
        <field>Email_Key__c</field>
        <formula>Email</formula>
        <name>Email Key</name>
        <notifyAssignee>false</notifyAssignee>
        <operation>Formula</operation>
        <protected>false</protected>
    </fieldUpdates>
    <rules>
        <fullName>Copy Email Key</fullName>
        <actions>
            <name>Email_Key</name>
            <type>FieldUpdate</type>
        </actions>
        <active>false</active>
        <criteriaItems>
            <field>Contact.Email</field>
            <operation>notEqual</operation>
        </criteriaItems>
        <criteriaItems>
            <field>Contact.Email_Key__c</field>
            <operation>equals</operation>
        </criteriaItems>
        <description>Will copy the Contact.Email key for future upserts</description>
        <triggerType>onAllChanges</triggerType>
    </rules>
</Workflow>
