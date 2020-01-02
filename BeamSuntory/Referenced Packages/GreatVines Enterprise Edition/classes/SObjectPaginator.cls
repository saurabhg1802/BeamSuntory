/*
This file is generated and isn't the actual source code for this
managed global class.
This read-only file shows the class's global constructors,
methods, variables, and properties.
To enable code to compile, all methods return null.
*/
global class SObjectPaginator {
    global List<SObject> all {
        get;
    }
    global static Integer DEFAULT_PAGE_SIZE;
    global static List<Integer> DEFAULT_PAGE_SIZE_OPTIONS;
    global static Integer DEFAULT_SKIP_SIZE;
    global Boolean hasNext {
        get;
    }
    global Boolean hasPrevious {
        get;
    }
    global List<gvp.SObjectPaginatorListener> listeners {
        get;
    }
    global static Integer MAX_SKIP_SIZE;
    global List<Integer> nextSkipPageNumbers {
        get;
    }
    global List<SObject> page {
        get;
    }
    global Integer pageCount {
        get;
    }
    global Integer pageEndPosition {
        get;
    }
    global Integer pageEndPositionDisplayFriendly {
        get;
    }
    global Integer pageNumber {
        get;
    }
    global Integer pageNumberDisplayFriendly {
        get;
    }
    global Integer pageSize {
        get;
    }
    global List<Integer> pageSizeIntegerOptions {
        get;
    }
    global List<System.SelectOption> pageSizeSelectOptions {
        get;
    }
    global Integer pageStartPosition {
        get;
    }
    global Integer pageStartPositionDisplayFriendly {
        get;
    }
    global List<Integer> previousSkipPageNumbers {
        get;
    }
    global Integer recordCount {
        get;
    }
    global Integer skipSize {
        get;
    }
    global SObjectPaginator() {

    }
    global SObjectPaginator(List<Integer> pageSizeIntegerOptions) {

    }
    global SObjectPaginator(gvp.SObjectPaginatorListener listener) {

    }
    global SObjectPaginator(Integer pageSize) {

    }
    global SObjectPaginator(List<Integer> pageSizeIntegerOptions, gvp.SObjectPaginatorListener listener) {

    }
    global SObjectPaginator(List<Integer> pageSizeIntegerOptions, Integer skipSize) {

    }
    global SObjectPaginator(Integer pageSize, List<Integer> pageSizeIntegerOptions) {

    }
    global SObjectPaginator(Integer pageSize, gvp.SObjectPaginatorListener listener) {

    }
    global SObjectPaginator(Integer pageSize, Integer skipSize) {

    }
    global SObjectPaginator(List<Integer> pageSizeIntegerOptions, Integer skipSize, gvp.SObjectPaginatorListener listener) {

    }
    global SObjectPaginator(Integer pageSize, List<Integer> pageSizeIntegerOptions, gvp.SObjectPaginatorListener listener) {

    }
    global SObjectPaginator(Integer pageSize, List<Integer> pageSizeIntegerOptions, Integer skipSize) {

    }
    global SObjectPaginator(Integer pageSize, Integer skipSize, gvp.SObjectPaginatorListener listener) {

    }
    global SObjectPaginator(Integer pageSize, List<Integer> pageSizeIntegerOptions, Integer skipSize, gvp.SObjectPaginatorListener listener) {

    }
    global void addListener(gvp.SObjectPaginatorListener listener) {

    }
    global void firePageChangeEvent() {

    }
    global System.PageReference first() {
        return null;
    }
    global Integer getPageSize() {
        return null;
    }
    global List<System.SelectOption> getPageSizeOptions() {
        return null;
    }
    global System.PageReference last() {
        return null;
    }
    global System.PageReference next() {
        return null;
    }
    global System.PageReference previous() {
        return null;
    }
    global void setPageSize(Integer pageSize) {

    }
    global void setPageSizeOptions(List<Integer> pageSizeIntegerOptions) {

    }
    global void setRecords(List<SObject> all) {

    }
    global void setSkipSize(Integer skipSize) {

    }
    global System.PageReference skipToPage(Integer pageNumber) {
        return null;
    }
}
