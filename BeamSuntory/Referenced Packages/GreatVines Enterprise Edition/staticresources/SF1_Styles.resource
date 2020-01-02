/* workaround for https://success.salesforce.com/issues_view?id=a1p300000008Y6nAAE */
html, html body {
    overflow: auto;
    -webkit-overflow-scrolling: touch;
}
body {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
}
/* end workaround for https://success.salesforce.com/issues_view?id=a1p300000008Y6nAAE */
h1, h2, h3, h4, h5, h6 {
    margin-top: 0;
}
.checkbox, .radio {
    min-height: 32px !important;
}
input[type=checkbox], input[type=radio] {
    margin-left: -12px !important;
    margin-right: 14px !important;
    -ms-transform: scale(2);
    -moz-transform: scale(2);
    -webkit-transform: scale(2);
    -o-transform: scale(2);
    transform: scale(2);
}
*[required]:not([disabled]),
*[required]:not([disabled]) > button,
*[required]:not([disabled]) ~ .slds-checkbox--faux,
*[required]:not([disabled]) ~ .slds-radio--faux,
*[required]:not([disabled]) ~ .slds-button,
.validated *:invalid {
    border-color: red;
}
.btn.active {
	background-color: #2f4e7b !important;
	border-color: #1c4a70 !important;
	color: #ffffff !important;
}
summary {
	outline:none;
}
.edit-buttons button {
	margin-right: .5em;
}
.edit-buttons #deleteButton {
	display: none;
}
/****************************************/
/* Absolute Center CSS Spinner          */
/* http://codepen.io/MattIn4D/pen/LiKFC */
/****************************************/
.loading {
  position: fixed;
  z-index: 999;
  height: 2em;
  width: 2em;
  overflow: show;
  margin: auto;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

/* Transparent Overlay */
.loading:before {
  content: '';
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.3);
}

/* :not(:required) hides these rules from IE9 and below */
.loading:not(:required) {
  /* hide "loading..." text */
  font: 0/0 a;
  color: transparent;
  text-shadow: none;
  background-color: transparent;
  border: 0;
}

.loading:not(:required):after {
  content: '';
  display: block;
  font-size: 10px;
  width: 1em;
  height: 1em;
  margin-top: -0.5em;
  -webkit-animation: spinner 1500ms infinite linear;
  -moz-animation: spinner 1500ms infinite linear;
  -ms-animation: spinner 1500ms infinite linear;
  -o-animation: spinner 1500ms infinite linear;
  animation: spinner 1500ms infinite linear;
  border-radius: 0.5em;
  -webkit-box-shadow: rgba(0, 0, 0, 0.75) 1.5em 0 0 0, rgba(0, 0, 0, 0.75) 1.1em 1.1em 0 0, rgba(0, 0, 0, 0.75) 0 1.5em 0 0, rgba(0, 0, 0, 0.75) -1.1em 1.1em 0 0, rgba(0, 0, 0, 0.5) -1.5em 0 0 0, rgba(0, 0, 0, 0.5) -1.1em -1.1em 0 0, rgba(0, 0, 0, 0.75) 0 -1.5em 0 0, rgba(0, 0, 0, 0.75) 1.1em -1.1em 0 0;
  box-shadow: rgba(0, 0, 0, 0.75) 1.5em 0 0 0, rgba(0, 0, 0, 0.75) 1.1em 1.1em 0 0, rgba(0, 0, 0, 0.75) 0 1.5em 0 0, rgba(0, 0, 0, 0.75) -1.1em 1.1em 0 0, rgba(0, 0, 0, 0.75) -1.5em 0 0 0, rgba(0, 0, 0, 0.75) -1.1em -1.1em 0 0, rgba(0, 0, 0, 0.75) 0 -1.5em 0 0, rgba(0, 0, 0, 0.75) 1.1em -1.1em 0 0;
}

/* Animation */

@-webkit-keyframes spinner {
  0% {
    -webkit-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@-moz-keyframes spinner {
  0% {
    -webkit-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@-o-keyframes spinner {
  0% {
    -webkit-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes spinner {
  0% {
    -webkit-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
/***********************************/
/* End Absolute Center CSS Spinner */
/***********************************/

.slds-form-element .slds-checkbox [type="checkbox"] ~ .slds-checkbox--faux {
    margin-right: 0.5rem;
}
.slds-form-element .slds-radio [type="radio"] ~ .slds-radio--faux {
    margin-right: 0.5rem;
}
.slds .slds-button-group .slds-button:last-child[disabled] {
	display: block;
}
.slds .slds-notify-container {
	position: relative;
}
.slds-notify h2 {
	font-size: 110%;
	color: white;
}
.slds .slds-list--horizontal > .slds-list__item > a {
	padding: 0 16px;
}
.slds .slds-breadcrumb .slds-list__item:before {
	left: -12px;
}
.slds select.slds-select[multiple] {
	height: 5em;
}
.slds-hidden {
	display: none;
}