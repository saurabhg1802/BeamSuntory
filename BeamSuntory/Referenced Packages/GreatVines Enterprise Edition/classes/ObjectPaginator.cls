/*
This file is generated and isn't the actual source code for this
managed global class.
This read-only file shows the class's global constructors,
methods, variables, and properties.
To enable code to compile, all methods return null.
*/
global class ObjectPaginator {
    global List<Object> all {
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
    global List<gvp.ObjectPaginatorListener> listeners {
        get;
    }
    global static Integer MAX_SKIP_SIZE;
    global List<Integer> nextSkipPageNumbers {
        get;
    }
    global List<Object> page {
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
    global ObjectPaginator() {

    }
    global ObjectPaginator(List<Integer> pageSizeIntegerOptions) {

    }
    global ObjectPaginator(gvp.ObjectPaginatorListener listener) {

    }
    global ObjectPaginator(Integer pageSize) {

    }
    global ObjectPaginator(List<Integer> pageSizeIntegerOptions, gvp.ObjectPaginatorListener listener) {

    }
    global ObjectPaginator(List<Integer> pageSizeIntegerOptions, Integer skipSize) {

    }
    global ObjectPaginator(Integer pageSize, List<Integer> pageSizeIntegerOptions) {

    }
    global ObjectPaginator(Integer pageSize, gvp.ObjectPaginatorListener listener) {

    }
    global ObjectPaginator(Integer pageSize, Integer skipSize) {

    }
    global ObjectPaginator(List<Integer> pageSizeIntegerOptions, Integer skipSize, gvp.ObjectPaginatorListener listener) {

    }
    global ObjectPaginator(Integer pageSize, List<Integer> pageSizeIntegerOptions, gvp.ObjectPaginatorListener listener) {

    }
    global ObjectPaginator(Integer pageSize, List<Integer> pageSizeIntegerOptions, Integer skipSize) {

    }
    global ObjectPaginator(Integer pageSize, Integer skipSize, gvp.ObjectPaginatorListener listener) {

    }
    global ObjectPaginator(Integer pageSize, List<Integer> pageSizeIntegerOptions, Integer skipSize, gvp.ObjectPaginatorListener listener) {

    }
    global void addListener(gvp.ObjectPaginatorListener listener) {

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
    global void setRecords(List<Object> all) {

    }
    global void setSkipSize(Integer skipSize) {

    }
    global System.PageReference skipToPage(Integer pageNumber) {
        return null;
    }
}
