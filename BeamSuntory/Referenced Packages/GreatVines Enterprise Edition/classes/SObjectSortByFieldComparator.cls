/*
This file is generated and isn't the actual source code for this
managed global class.
This read-only file shows the class's global constructors,
methods, variables, and properties.
To enable code to compile, all methods return null.
*/
global class SObjectSortByFieldComparator implements gvp.ISObjectComparator {
    global Boolean sortAscending {
        get;
        set;
    }
    global String sortBy {
        get;
        set;
    }
    global SObjectSortByFieldComparator(String sortBy) {

    }
    global SObjectSortByFieldComparator(String sortBy, Boolean sortAscending) {

    }
    global Integer compare(SObject object1, SObject object2) {
        return null;
    }
    global static List<SObject> qsort(List<SObject> objects) {
        return null;
    }
    global static List<SObject> qsort(List<SObject> objects, Boolean sortAscending) {
        return null;
    }
    global static List<SObject> qsort(List<SObject> objects, String sortBy) {
        return null;
    }
    global static List<SObject> qsort(List<SObject> objects, String sortBy, Boolean sortAscending) {
        return null;
    }
    global static List<SObject> qsort(List<SObject> objects, gvp.SObjectSortByFieldComparator comparator) {
        return null;
    }
}
