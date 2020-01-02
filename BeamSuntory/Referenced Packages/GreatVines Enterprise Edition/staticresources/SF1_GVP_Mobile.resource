window.$Label = window.$Label || {};
var GVP = GVP || {};
GVP.Mobile = GVP.Mobile || {};
GVP.Mobile.addClass = function(element, cssClass) {
	element.setAttribute('class', (GVP.Mobile.removeClass(element, cssClass) + ' ' + cssClass).trim());
};
GVP.Mobile.antecedentAttribute = function(element, attribute) {
	var getParentAttribute = function(element, attribute) {
		var parent = element && element.parentNode;
		if (parent && parent.getAttribute) {
			var value = parent.getAttribute(attribute);
			return value ? value : getParentAttribute(parent, attribute);
		}
		return;
	};
	return getParentAttribute(element, attribute);
};
GVP.Mobile.cache = GVP.Mobile.cache || {};
GVP.Mobile.create = function(options) {
	options = options || {};
	GVP.Mobile.translateFieldValues(options);
	var o = new options.model();
	options.busy = true;
	o.create(options.values, function(error, records, event) {
		options.busy = false;
		if (error) {
			alert(error.message);
		} else if (options.callback) {
			options.callback.apply(options, [error, records, event]);
		}
	});
};
GVP.Mobile.defaults = function(options) {
	options = options || {};
	var defaults = {
		limit: 20,
		model: SObjectModel[options.name],
		add: function() {
			var editFormOptions = GVP.Mobile[options.name]();
			editFormOptions.modal = true;
			GVP.Mobile.render.editForm(editFormOptions);
			var element = options.element || document.getElementById('content');
			var pageHeader = element.querySelector('.slds-page-header');
			if (!pageHeader) {
				var title = document.createElement('h3');
				title.innerHTML = options.describe.label;
				element.insertBefore(title, element.childNodes[0]);
			}
			element.scrollIntoView(false);
			if (options.callback) {
				options.callback.apply(options, [null, [], { method: 'add' }]);
			}
		},
		delete: function(options) {
			GVP.Mobile.delete(options);
		},
		save: function(options) {
			GVP.Mobile.upsert(options);
		}
	};
	Object.keys(defaults).forEach(function(key) {
		if (!(key in options)) {
			options[key] = defaults[key];
		}
	});
	return options;
};
GVP.Mobile.describe = function(options) {
	options = options || {};
	var o = new options.model();
	o.describe(function(error, describe, event){
		if(error) {
			alert(error.message);
		} else {
			GVP.Mobile[options.name].call().describe = describe;
		}
		if (options.callback) {
			options.callback.apply(GVP.Mobile[options.name].call(), [error, describe, event]);
		}
	});
};
GVP.Mobile.delete = function(options) {
	options = options || {};
	var o = new options.model();
	if (options.recordIds && (options.recordIds.length > 0)) {
		o.del(options.recordIds, function(error, records, event){
			if(error) {
				alert(error.message);
			}
			if (options.callback) {
				options.callback.apply(GVP.Mobile[options.name].call(), [error, records, event]);
			}
		});
	} else {
		options.callback.apply(GVP.Mobile[options.name].call(), [null, [], { method: 'delete' }]);
	}
};
GVP.Mobile.fetchRecords = function(options) {
	options = options || {};
	var batchSize = 100;
	var defaultLimit = 20;
	var o = new options.model();
	options.busy = true;
	o.retrieve({
		where: options.where,
		limit: Math.min(batchSize, options.limit || defaultLimit),
		offset: options.offset,
		orderby: options.orderBy || [{ LastModifiedDate: 'DESC' }]
	}, function(error, records, event) {
		if (error) {
			options.busy = false;
			alert(error.message);
		} else {
			options.recordsFetching = (options.recordsFetching || []).concat(records || []);
			if (records && (records.length === batchSize) && (options.recordsFetching.length < (options.limit || defaultLimit))) {
				options.offset = options.offset ? (options.offset + batchSize) : batchSize;
				GVP.Mobile.fetchRecords(options);
			} else {
				GVP.Mobile[options.name].call().records = options.recordsFetching;
				delete GVP.Mobile[options.name].call().offset;
				delete GVP.Mobile[options.name].call().recordsFetching;
				options.busy = false;
			}
		}
		if (options.callback) {
			options.callback.apply(GVP.Mobile[options.name].call(), [error, records, event]);
		}
	});
};
GVP.Mobile.getCurrentPosition = function(options) {
	options = options || {};
	var callback = options.callback || function() {};
	var result = {
		coords: {
			latitude: null,
			longitude: null
		}
	};
	if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
		navigator.geolocation.getCurrentPosition(
			function(result) {
				callback(result);
			},
			function(error) {
				result.error = error;
				callback(result);
			},
			{
				timeout: 5000,
				maximumAge: 30000
			}
		);
	} else {
		result.error = 'Geolocation unavailable';
		callback(result);
	}
};
GVP.Mobile.initializeObjects = function(options) {
	options = options || {};
	var objects = (options.objects || []).map(function(o) {
		return GVP.Mobile[o] || o;
	}).filter(function(o) {
		return (typeof(o) === 'function');
	});
	objects.forEach(function(o) {
		var model = o();
		if (model.describe || model.records) {
			delete model.describe;
			delete model.records;
			delete GVP.Mobile.cache[model.name];
		}
	});
	var objectsInitialized = function() {
		var initialized = true;
		objects.forEach(function(o) {
			var model = o();
			initialized = initialized && model.describe && model.records;
		});
		if (initialized) {
			options.callback && options.callback.call && options.callback(objects);
		} else {
			setTimeout(objectsInitialized, 1000);
		}
	};
	objectsInitialized();
};
GVP.Mobile.Object = function(options) {
	options = GVP.Mobile.defaults(options);
	var cache = GVP.Mobile.cache[options.name];
	Object.keys(cache || {}).forEach(function(key) {
		options[key] = options[key] || cache[key];
	});
	GVP.Mobile.cache[options.name] = options;
	if (!cache) {
		GVP.Mobile.describe(options);
		GVP.Mobile.fetchRecords(options);
	}
	return options;
};
GVP.Mobile.removeClass = function(element, cssClass) {
	var elementClasses = element.getAttribute('class') || '';
	elementClasses = elementClasses.replace(cssClass, '').replace('  ', ' ').trim();
	element.setAttribute('class', elementClasses);
	return elementClasses;
};
GVP.Mobile.render = {
	boolean: function(options) {
		options = options || {};
		var wrapper = document.createElement('div');
		var checkboxWrapper = document.createElement('div');
		var eventId = 'eid' + new Date().getTime();
		checkboxWrapper.setAttribute('data-event-id', eventId);
		GVP.Mobile.addClass(checkboxWrapper, 'slds-form-element');
		var label = document.createElement('label');
		GVP.Mobile.addClass(label, 'slds-checkbox');
		checkboxWrapper.appendChild(label);
		wrapper.appendChild(checkboxWrapper);
		var input = document.createElement('input');
		input.setAttribute('type', 'checkbox');
		if (options.value) {
			input.setAttribute('checked', '');
		}
		if (options.required) {
			input.setAttribute('required', '');
		}
		label.appendChild(input);
		var slds = document.head.querySelector('link[href*="SLDS"]').href;
		slds = slds.substring(0, slds.indexOf('/assets'));
		var statefulButton = document.createElement('button');
		var notSelectedText = document.createElement('span');
		GVP.Mobile.addClass(notSelectedText, 'slds-text-not-selected');
		notSelectedText.innerHTML = options.label;
		var notSelectedIcon = document.createElement('img');
		notSelectedIcon.setAttribute('src', slds + '/assets/icons/utility/ban_120.png');
		GVP.Mobile.addClass(notSelectedIcon, 'slds-button__icon--stateful slds-button__icon--left');
		notSelectedText.insertBefore(notSelectedIcon, notSelectedText.childNodes[0]);
		statefulButton.appendChild(notSelectedText);
		var selectedText = document.createElement('span');
		GVP.Mobile.addClass(selectedText, 'slds-text-selected');
		selectedText.innerHTML = options.label;
		var selectedIcon = document.createElement('img');
		selectedIcon.setAttribute('src', slds + '/assets/icons/utility/check_120.png');
		GVP.Mobile.addClass(selectedIcon, 'slds-button__icon--stateful slds-button__icon--left');
		selectedText.insertBefore(selectedIcon, selectedText.childNodes[0]);
		statefulButton.appendChild(selectedText);
		var selectedTextFocused = document.createElement('span');
		GVP.Mobile.addClass(selectedTextFocused, 'slds-text-selected-focus');
		selectedTextFocused.innerHTML = options.label;
		var selectedIconFocused = document.createElement('img');
		selectedIconFocused.setAttribute('src', slds + '/assets/icons/utility/check_120.png');
		GVP.Mobile.addClass(selectedIconFocused, 'slds-button__icon--stateful slds-button__icon--left');
		selectedTextFocused.insertBefore(selectedIconFocused, selectedTextFocused.childNodes[0]);
		statefulButton.appendChild(selectedTextFocused);
		GVP.Mobile.addClass(statefulButton, 'slds-button slds-button--neutral ' + (options.value ? 'slds-is-selected' : 'slds-not-selected'));
		label.appendChild(statefulButton);
		var bindEvent = function() {
			var eventElement = document.querySelector('[data-event-id="' + eventId + '"]');
			if (eventElement) {
				var eventInput = eventElement.querySelector('input');
				var eventButton = eventElement.querySelector('button');
				if (eventButton) {
					eventButton.addEventListener('click', function(event) {
						event.preventDefault();
						event.stopPropagation();
						if (eventInput.hasAttribute('checked')) {
							eventInput.removeAttribute('checked');
							GVP.Mobile.removeClass(eventButton, 'slds-is-selected');
							GVP.Mobile.addClass(eventButton, 'slds-not-selected');
						} else {
							eventInput.setAttribute('checked', '');
							GVP.Mobile.removeClass(eventButton, 'slds-not-selected');
							GVP.Mobile.addClass(eventButton, 'slds-is-selected');
						}
					});
				}
			} else {
				setTimeout(bindEvent, 200);
			}
		};
		bindEvent();
		return wrapper.innerHTML;
	},
	editField: function(options) {
		options = options || {};
		var field = options.field;
		if (!field || options.describe.calculated) {
			return '';
		}
		var wrapper = document.createElement('div');
		var container = document.createElement('div');
		GVP.Mobile.addClass(container, 'slds-form-element');
		container.setAttribute('data-field', options.field.name);
		var fieldHtml = '';
		switch(field.type) {
			case 'boolean':
				fieldHtml = GVP.Mobile.render.boolean({
					label: field.label,
					required: field.required,
					value: options.value
				});
				break;
			case 'multipicklist':
			case 'picklist':
				fieldHtml = GVP.Mobile.render.select({
					label: field.label,
					multiple: (field.type === 'multipicklist'),
					required: field.required || !options.describe.nillable,
					options: options.describe.picklistValues
						.filter(function(picklistEntry) {
							return picklistEntry.active;
						})
						.map(function(picklistEntry) {
							return {
								selected: options.value ? (options.value.split(';').indexOf(picklistEntry.value) >= 0) : picklistEntry.defaultValue,
								text: picklistEntry.label,
								value: picklistEntry.value
							};
						})
						.sort(function(a, b) {
							var av = a.text.toLowerCase();
							var bv = b.text.toLowerCase();
							return (av < bv) ? -1 : ((av > bv) ? 1 : 0);
						})
				});
				break;
			case 'reference':
				fieldHtml = GVP.Mobile.render.lookup({
					name: field.name,
					allowAdd: !!options.describe.allowAdd,
					label: field.label,
					referenceTo: options.describe.referenceTo[0],
					required: field.required || !options.describe.nillable,
					value: options.value
				});
				break;
			case 'textarea':
				fieldHtml = GVP.Mobile.render.textarea({
					label: field.label,
					required: field.required || !options.describe.nillable,
					value: options.value
				});
				break;
			default:
				fieldHtml = GVP.Mobile.render.input({
					field: field,
					label: field.label,
					required: field.required || !options.describe.nillable,
					type: function(type) {
						switch(type) {
							case 'datetime':
								return 'datetime-local';
							case 'currency':
							case 'double':
							case 'integer':
							case 'percent':
								return 'number';
							case 'phone':
								return 'tel';
							default:
								return type;
						}
					}(field.type),
					checked: (options.value === true),
					value: options.value
				});
				break;
		}
		container.innerHTML = fieldHtml;
		wrapper.appendChild(container);
		return wrapper.innerHTML;
	},
	editForm: function(options) {
		options = options || {}
		var element = options.element || document.getElementById('content');
		if (options.modal) {
			var modalElement = document.createElement('div');
			modalElement.setAttribute('role', 'dialog');
			GVP.Mobile.addClass(modalElement, 'slds-modal slds-fade-in-open');
			modalElement.setAttribute('aria-hidden', false);
			var modalContainer = document.createElement('div');
			GVP.Mobile.addClass(modalContainer, 'slds-modal__container');
			modalElement.appendChild(modalContainer);
			var modalContent = document.createElement('div');
			GVP.Mobile.addClass(modalContent, 'slds-modal__content');
			modalContainer.appendChild(modalContent);
			element.appendChild(modalElement);
			var modalBackdrop = document.createElement('div');
			GVP.Mobile.addClass(modalBackdrop, 'slds-modal-backdrop slds-modal-backdrop--open');
			element.appendChild(modalBackdrop);
			element = modalContent;
		}
		var html = (element && (options.fields || []).map(function(field) {
			return GVP.Mobile.render.editField({
				describe: options.describe.fields.filter(function(describe) {
					return describe.name === field.name;
				})[0],
				field: field,
				value: options.values && options.values[field.name]
			});
		}).join('\n'));
		if (element && (html !== element.innerHTML)) {
			var formWrapper = document.createElement('div');
			if (options.showHeader) {
				var header = GVP.Mobile.render.header({
					element: formWrapper,
					title: options.title || options.describe.label,
					subtitle: options.subtitle,
					buttons: [
						{
							id: 'cancelButton',
							title: 'Cancel'
						},
						{
							id: 'deleteButton',
							title: 'Delete'
						},
						{
							id: 'saveButton',
							title: 'Save'
						}
					]
				});
				if (!(options.values && options.values.Id)) {
					GVP.Mobile.addClass(header.querySelector('#deleteButton'), 'slds-hidden');
				}
			}
			if (options.modal) {
				var errorMessages = document.createElement('div');
				errorMessages.setAttribute('class', 'error-messages');
				formWrapper.appendChild(errorMessages);
			}
			var form = document.createElement('form');
			GVP.Mobile.addClass(form, 'slds-form--stacked');
			form.setAttribute('data-object', options.name);
			var fieldset = document.createElement('fieldset');
			fieldset.innerHTML = html;
			form.appendChild(fieldset);
			formWrapper.appendChild(form);
			if (!(options.showHeader || options.hideEditButtons)) {
				var editButtons = document.createElement('div');
				GVP.Mobile.addClass(editButtons, 'edit-buttons');
				GVP.Mobile.addClass(editButtons, 'clearfix');
				var cancelButton = document.createElement('button');
				GVP.Mobile.addClass(cancelButton, 'slds-button');
				GVP.Mobile.addClass(cancelButton, 'slds-button--neutral');
				GVP.Mobile.addClass(cancelButton, 'pull-right');
				cancelButton.id = 'cancelButton';
				cancelButton.setAttribute('type', 'button');
				cancelButton.innerHTML = $Label.Cancel || 'Cancel';
				var deleteButton = document.createElement('button');
				GVP.Mobile.addClass(deleteButton, 'slds-button');
				GVP.Mobile.addClass(deleteButton, 'slds-button--neutral');
				GVP.Mobile.addClass(deleteButton, 'pull-right');
				deleteButton.id = 'deleteButton';
				deleteButton.setAttribute('type', 'button');
				deleteButton.innerHTML = $Label.Delete || 'Delete';
				var saveButton = document.createElement('button');
				GVP.Mobile.addClass(saveButton, 'slds-button');
				GVP.Mobile.addClass(saveButton, 'slds-button--neutral');
				GVP.Mobile.addClass(saveButton, 'pull-right');
				saveButton.id = 'saveButton';
				saveButton.setAttribute('type', 'button');
				saveButton.innerHTML = $Label.Save || 'Save';
				editButtons.appendChild(saveButton);
				editButtons.appendChild(deleteButton);
				editButtons.appendChild(cancelButton);
				form.appendChild(editButtons);
			}
			element.innerHTML = formWrapper.innerHTML;
			var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
			if (iOS) {
				[].forEach.call(document.querySelectorAll('input[type="datetime-local"]'), function(dt) {
					dt.addEventListener('change', function(event) {
						dt.value = dt.value.replace(/:[0-9][0-9]\.[0-9][0-9][0-9]/, '');
						dt.value += ':00.000';
					});
				});
			}
			[].forEach.call(element.querySelectorAll('button[data-add-button="true"]'), function(addButton) {
				addButton.addEventListener('click', function(event) {
					event.preventDefault();
					event.stopPropagation();
					var referenceModel = GVP.Mobile[GVP.Mobile.antecedentAttribute(event.target, 'data-reference-to')]();
					if (referenceModel.add) {
						GVP.Mobile.updateValues(options);
						delete referenceModel.values;
						referenceModel.add();
					}
				});
			});
			[].forEach.call(fieldset.querySelectorAll('input select textarea'), function(input) {
				input.addEventListener('invalid', GVP.Mobile.render.errorMessages);
			});
			if (!options.hideEditButtons) {
				element.querySelector('#cancelButton').addEventListener('click', function(event) {
					if (options.callback) {
						options.callback.apply(options, [null, [], { method: 'cancel' }]);
					}
				});
				element.querySelector('#deleteButton').addEventListener('click', function(event) {
					if (confirm($Label.Are_You_Sure || 'Are you sure?') && options.delete) {
						options.recordIds = (options.values && options.values.Id && [options.values.Id]) ||
							GVP.Mobile.antecedentAttribute(event.target, 'data-record-id') ||
							[];
						options.delete(options);
					}
				});
				element.querySelector('#saveButton').addEventListener('click', function(event) {
					var valid = GVP.Mobile.render.errorMessages();
					if (valid && options.save) {
						options.element = element;
						GVP.Mobile.updateValues(options);
						options.save(options);
					}
				});
			}
			return element;
		}
	},
	errorMessages: function() {
		var valid = true;
		var activeContext = document.querySelector('.slds-modal:not(.slds-hidden)[role="dialog"]') || document;
		[].forEach.call(activeContext.querySelectorAll('form'), function(form) {
			GVP.Mobile.addClass(form, 'validated');
			valid = valid && form.checkValidity();
			[].forEach.call(form.querySelectorAll('input, select, textarea'), function(input) {
				valid = valid && !input.validationMessage;
			});
		});
		var errorMessages = activeContext.querySelector('.error-messages');
		if (errorMessages) {
			var clearErrors = function() {
				errorMessages.innerHTML = '';
			};
			clearErrors();
			if (!valid) {
				errorMessages.appendChild(GVP.Mobile.template({
					template: 'error-messages-template'
				}));
				errorMessages.querySelector('.slds-notify__close').addEventListener('click', clearErrors);
				errorMessages.scrollIntoView(false);
			}
		}
		return valid;
	},
	header: function(options) {
		options = options || {}
		var element = options.element || document.getElementById('content');
		var headerWrapper = document.createElement('div');
		var header = document.createElement('div');
		GVP.Mobile.addClass(header, 'slds-m-top-large slds-page-header slds-col slds-col--padded slds-large-size--1-of-1');
		var headerContainer = document.createElement('div');
		GVP.Mobile.addClass(headerContainer, 'slds-col slds-no-flex');
		header.appendChild(headerContainer);
		var headerSubcontainer = document.createElement('div');
		GVP.Mobile.addClass(headerSubcontainer, 'slds-media');
		headerContainer.appendChild(headerSubcontainer);
		if (options.icon) {
			var icon = document.createElement('div');
			GVP.Mobile.addClass(icon, 'slds-media__figure');
			var iconContainer = document.createElement('span');
			GVP.Mobile.addClass(iconContainer, ['slds-icon__container', options.icon.class || ''].join(' '));
			var iconImage = document.createElement('img');
			GVP.Mobile.addClass(iconImage, 'slds-icon slds-icon--large');
			iconImage.setAttribute('src', options.icon.url);
			iconContainer.appendChild(iconImage);
			icon.appendChild(iconContainer);
			headerSubcontainer.appendChild(icon);
		}
		var headerBody = document.createElement('div');
		GVP.Mobile.addClass(headerBody, 'slds-media__body');
		var headerTitle = document.createElement('nav');
		headerTitle.setAttribute('role', 'navigation');
		GVP.Mobile.addClass(headerTitle, 'slds-text-heading--label slds-m-bottom--xx-small');
		var headerTitleBreadcrumbs = document.createElement('ol');
		GVP.Mobile.addClass(headerTitleBreadcrumbs, 'slds-breadcrumb slds-list--horizontal');
		headerTitle.appendChild(headerTitleBreadcrumbs);
		if (typeof(options.title) === 'string') {
			options.title = [{ title: options.title }];
		}
		(options.title || []).forEach(function(crumb) {
			var crumbElement = document.createElement('li');
			GVP.Mobile.addClass(crumbElement, 'slds-list__item slds-text-heading--label');
			if (crumb.callback) {
				var crumbLink = document.createElement('a');
				crumbLink.setAttribute('href', '#');
				crumbLink.innerHTML = crumb.title;
				crumbLink.addEventListener('click', function(event) {
					event.preventDefault();
					event.stopPropagation();
					crumb.callback.call(this, event);
				});
				crumbElement.appendChild(crumbLink);
			} else {
				crumbElement.innerHTML = crumb.title;
			}
			headerTitleBreadcrumbs.appendChild(crumbElement);
		});
		headerBody.appendChild(headerTitle);
		var headerGrid = document.createElement('div');
		GVP.Mobile.addClass(headerGrid, 'slds-grid slds-wrap');
		var headerSubtitle = document.createElement('h1');
		GVP.Mobile.addClass(headerSubtitle, 'slds-text-heading--medium slds-align-left slds-m-right--large');
		headerSubtitle.setAttribute('title', options.subtitle || '');
		headerSubtitle.innerHTML = options.subtitle || '';
		headerGrid.appendChild(headerSubtitle);
		var headerButtons = document.createElement('div');
		GVP.Mobile.addClass(headerButtons, 'slds-col slds-container--right');
		var headerButtonGroup = document.createElement('div');
		GVP.Mobile.addClass(headerButtonGroup, 'slds-button-group slds-float--right');
		headerButtonGroup.setAttribute('role', 'group');
		(options.buttons || []).filter(function(button) {
			return button;
		}).forEach(function(button, index) {
			var buttonElement = document.createElement('button');
			GVP.Mobile.addClass(buttonElement, 'slds-button slds-button--neutral');
			button.id = button.id || 'button-' + new Date().getTime();
			buttonElement.id = button.id;
			buttonElement.innerHTML = $Label[button.title] || button.title || 'Ok';
			buttonElement.addEventListener('click', button.callback);
			headerButtonGroup.appendChild(buttonElement);
		});
		headerButtons.appendChild(headerButtonGroup);
		headerGrid.appendChild(headerButtons);
		headerBody.appendChild(headerGrid);
		headerSubcontainer.appendChild(headerBody);
		headerWrapper.appendChild(header);
		element.appendChild(headerWrapper);
		return headerWrapper;
	},
	input: function(options) {
		options = options || {};
		var wrapper = document.createElement('div');
		var formElement = document.createElement('div');
		GVP.Mobile.addClass(formElement, 'slds-form-element');
		var label = document.createElement('label');
		GVP.Mobile.addClass(label, 'slds-form-element__label');
		GVP.Mobile.addClass(label, 'remove');
		label.innerHTML = options.label;
		formElement.appendChild(label);
		var formControl = document.createElement('div');
		GVP.Mobile.addClass(formControl, 'slds-form-element__control');
		var input = document.createElement('input');
		GVP.Mobile.addClass(input, 'slds-input');
		input.setAttribute('type', options.type || 'text');
		input.setAttribute('value', options.value || '');
		if (options.required) {
			input.setAttribute('required', '');
		}
		switch(options.field.type) {
			case 'date':
			case 'datetime':
				var dateValue = options.value;
				if (dateValue && dateValue.getTimezoneOffset) {
					var timezoneOffset = dateValue.getTimezoneOffset() * 60 * 1000;
					var localDate = new Date(dateValue.getTime() - timezoneOffset);
					var localDateISOString = localDate.toISOString().substr(0, (options.field.type === 'date' ? 10 : 16));
					input.setAttribute('value', localDateISOString);
				} else if (dateValue) {
					input.setAttribute('value', dateValue);
				}
				break;
			case 'currency':
				input.setAttribute('min', 0);
				input.setAttribute('max', 999999999999);
				input.setAttribute('size', 12);
				input.setAttribute('step', .01);
				break;
			case 'double':
				input.setAttribute('min', 0);
				input.setAttribute('max', 999999999999999);
				input.setAttribute('size', 15);
				input.setAttribute('step', .000000000001);
				break;
			case 'integer':
				input.setAttribute('min', -2147483648);
				input.setAttribute('max', 2147483648);
				input.setAttribute('size', 10);
				input.setAttribute('step', 1);
				break;
			case 'phone':
				input.setAttribute('pattern', '^(1\\s*[-\\/\\.]?)?(\\((\\d{3})\\)|(\\d{3}))\\s*[-\\/\\.]?\\s*(\\d{3})\\s*[-\\/\\.]?\\s*(\\d{4})\\s*(([xX]|[eE][xX][tT])\\.?\\s*(\\d+))*$');
				break;
		}
		formControl.appendChild(input);
		formElement.appendChild(formControl);
		wrapper.appendChild(formElement);
		return wrapper.innerHTML;
	},
	loading: {
		hide: function(options) {
			options = options || {};
			var element = options.element || document.getElementById('content');
			var loading = element.querySelector('div.loading');
			if (loading) {
				element.removeChild(loading);
			};
		},
		show: function(options) {
			options = options || {};
			var element = options.element || document.getElementById('content');
			var loading = document.createElement('div');
			GVP.Mobile.addClass(loading, 'loading');
			element.appendChild(loading);
		},
	},
	lookup: function(options) {
		options = options || {};
		var wrapper = document.createElement('div');

		var lookupElement = document.createElement('div');
		var eventId = 'eid' + new Date().getTime();
		lookupElement.setAttribute('data-event-id', eventId);
		lookupElement.setAttribute('data-select', 'single');
		lookupElement.setAttribute('data-scope', 'single');
		lookupElement.setAttribute('data-typeahead', 'true');
		GVP.Mobile.addClass(lookupElement, 'slds-lookup');

		var formElement = document.createElement('div');
		GVP.Mobile.addClass(formElement, 'slds-form-element');
		lookupElement.appendChild(formElement);
		var label = document.createElement('label');
		GVP.Mobile.addClass(label, 'slds-form-element__label');
		GVP.Mobile.addClass(label, 'remove');
		label.innerHTML = options.label;
		formElement.appendChild(label);
		var inputGroup = document.createElement('div');
		GVP.Mobile.addClass(inputGroup, 'slds-form-element__control');
		GVP.Mobile.addClass(inputGroup, 'slds-input-has-icon');
		GVP.Mobile.addClass(inputGroup, 'slds-input-has-icon--right');

		var slds = document.head.querySelector('link[href*="SLDS"]').href;
		slds = slds.substring(0, slds.indexOf('/assets'));
		var searchIcon = document.createElement('img');
		searchIcon.setAttribute('src', slds + '/assets/icons/utility/search_120.png');
		searchIcon.setAttribute('aria-hidden', 'true');
		GVP.Mobile.addClass(searchIcon, 'slds-input__icon');
		inputGroup.appendChild(searchIcon);

		var input = document.createElement('input');
		input.setAttribute('type', 'text');
		input.setAttribute('placeholder', $Label.Search_Placeholder || 'Enter Search Text Here');
		input.setAttribute('aria-autocomplete', 'list');
		input.setAttribute('role', 'combobox');
		input.setAttribute('aria-expanded', 'false');
		input.setAttribute('aria-activedescendant', options.value || '');
		GVP.Mobile.addClass(input, 'slds-input');
		if (options.required) {
			input.setAttribute('required', '');
		}
		inputGroup.appendChild(input);

		var lookupMenu = document.createElement('div');
		lookupMenu.setAttribute('role', 'listbox');
		GVP.Mobile.addClass(lookupMenu, 'slds-lookup__menu');
		GVP.Mobile.addClass(lookupMenu, 'slds-hidden');
		lookupElement.appendChild(lookupMenu);

		var lookupList = document.createElement('ul');
		lookupList.setAttribute('role', 'presentation');
		GVP.Mobile.addClass(lookupList, 'slds-lookup__list');
		lookupMenu.appendChild(lookupList);

		var updateItems = function(options) {
			options = options || {};
			var eventElement = document.querySelector('[data-event-id="' + eventId + '"]');
			if (eventElement) {
				var eventInput = eventElement.querySelector('input');
				var lookupMenu = eventElement.querySelector('.slds-lookup__menu');
				var lookupList = lookupMenu.querySelector('ul');
				var instance = new options.model();
				var activeField = Object.keys(instance._fields).filter(function(field) {
					return (field.toLowerCase().indexOf('active__c') >= 0) ||
						(field.toLowerCase().indexOf('visible_on_auth__c') >= 0);
				})[0];
				var whereClause = options.value ?
					{ Id: { eq: options.value } } :
					(options.searchString ? { Name: { like: '%' + options.searchString.replace(/'/g, "\\'") + '%' } } : undefined);
				if (activeField && !options.value) {
					whereClause = whereClause || {};
					whereClause[activeField] = { eq: true };
				}
				instance.retrieve({
					where: whereClause,
					limit: 100,
					orderby: [{ Name: 'ASC' }]
				}, function(error, records, event) {
					if (options.value) {
						eventInput.setAttribute('value', (records || []).filter(function(record) {
							return record.get('Id') === options.value;
						}).map(function(record) {
							var span = document.createElement('span');
							span.innerHTML = record.get('Name');
							return span.innerText;
						})[0] || '');
					}
					lookupList.innerHTML = '';
					(records || []).forEach(function(record) {
						var option = document.createElement('li');
						GVP.Mobile.addClass(option, 'slds-lookup__item');
						var optionLink = document.createElement('a');
						optionLink.setAttribute('id', record.get('Id'));
						optionLink.setAttribute('href', '#');
						optionLink.setAttribute('role', 'option');
						optionLink.innerHTML = record.get('Name');
						option.appendChild(optionLink);
						lookupList.appendChild(option);
					});
					[].forEach.call(lookupList.querySelectorAll('li a'), function(option) {
						option.addEventListener('click', function(event) {
							event.preventDefault();
							event.stopPropagation();
							if (option.id) {
								eventInput.value = option.innerHTML;
								eventInput.setAttribute('aria-activedescendant', option.id);
								eventInput.blur();
							}
						});
					});
					if (options.callback) {
						options.callback(error, records, event);
					}
				});
			} else {
				setTimeout(function() {
					updateItems(options);
				}, 200);
			}
		};
		updateItems({
			model: GVP.Mobile[options.referenceTo]().model,
			value: options.value
		});

		if (options.allowAdd) {
			var addButtonWrapper = document.createElement('div');
			GVP.Mobile.addClass(addButtonWrapper, 'slds-lookup__item');
			var addButton = document.createElement('button');
			GVP.Mobile.addClass(addButton, 'slds-button');
			addButton.setAttribute('type', 'button');
			addButton.setAttribute('data-reference-to', options.referenceTo);
			addButton.setAttribute('data-add-button', 'true');
			var addIcon = document.createElement('img');
			addIcon.setAttribute('src', slds + '/assets/icons/utility/add_120.png');
			addIcon.setAttribute('aria-hidden', 'true');
			GVP.Mobile.addClass(addIcon, 'slds-button__icon');
			addButton.appendChild(addIcon);
			var addText = document.createElement('span');
			addText.innerHTML = [
				$Label.New || 'New',
				GVP.Mobile[options.referenceTo]().describe.label
			].join(' ');
			addButton.appendChild(addText);
			addButtonWrapper.appendChild(addButton);
			lookupMenu.appendChild(addButtonWrapper);
		}

		formElement.appendChild(inputGroup);
		wrapper.appendChild(lookupElement);
		var bindEvent = function() {
			var eventElement = document.querySelector('[data-event-id="' + eventId + '"]');
			if (eventElement) {
				var eventInput = eventElement.querySelector('input');
				var lookupMenu = eventElement.querySelector('.slds-lookup__menu');
				var lookupList = lookupMenu.querySelector('ul');
				var search = function() {
					updateItems({
						model: GVP.Mobile[options.referenceTo]().model,
						searchString: eventInput.value,
						callback: function() {
							var autocompleteOption;
							[].forEach.call(lookupList.querySelectorAll('li a'), function(option) {
								if ((!eventInput.value) || (option.innerHTML.toLowerCase().indexOf(eventInput.value.toLowerCase()) >= 0)) {
									GVP.Mobile.removeClass(option.parentNode, 'slds-hidden');
									if (!autocompleteOption && eventInput.value && (eventInput.value.length > 1)) {
										autocompleteOption = option;
									}
								} else {
									GVP.Mobile.addClass(option.parentNode, 'slds-hidden');
								}
							});
							if (autocompleteOption) {
								eventInput.setAttribute('aria-activedescendant', autocompleteOption.id);
							}
							var noRecordsOption = lookupList.querySelector('li.no-records');
							if (lookupList.querySelectorAll('li:not(.slds-hidden)').length > 0) {
								if (noRecordsOption) {
									lookupList.removeChild(noRecordsOption);
								}
							} else {
								noRecordsOption = document.createElement('li');
								GVP.Mobile.addClass(noRecordsOption, 'no-records slds-lookup__item');
								var optionLink = document.createElement('a');
								optionLink.setAttribute('href', '#');
								optionLink.setAttribute('role', 'option');
								optionLink.innerHTML = $Label.No_Records || 'There are no records to display';
								noRecordsOption.appendChild(optionLink);
								lookupList.appendChild(noRecordsOption);
							}
						}
					});
				};
				eventInput.addEventListener('keyup', search);
				eventInput.addEventListener('change', search);
				eventInput.addEventListener('focus', function(event) {
					event.preventDefault();
					event.stopPropagation();
					search();
					GVP.Mobile.removeClass(lookupMenu, 'slds-hidden');
					eventInput.setAttribute('aria-expanded', 'true');
				});
				eventInput.addEventListener('blur', function(event) {
					event.preventDefault();
					event.stopPropagation();
					setTimeout(function() {
						GVP.Mobile.addClass(lookupMenu, 'slds-hidden');
						eventInput.setAttribute('aria-expanded', 'false');
						if (eventInput.value) {
							var found = false;
							[].forEach.call(lookupMenu.querySelectorAll('li a'), function(option) {
								if (!found && (option.id === eventInput.getAttribute('aria-activedescendant') && (option.innerHTML.toLowerCase().indexOf(eventInput.value.toLowerCase()) >= 0))) {
									eventInput.value = option.innerHTML;
									found = true;
								}
							});
							if (!found) {
								eventInput.value = '';
								eventInput.setAttribute('aria-activedescendant', '');
							}
						}
					}, 200);
				});
				search();
			} else {
				setTimeout(bindEvent, 200);
			}
		};
		bindEvent();
		return wrapper.innerHTML;
	},
	radio: function(options) {
		options = options || {};
		var wrapper = document.createElement('div');
		var formElement = document.createElement('div');
		var eventId = 'eid' + new Date().getTime();
		formElement.setAttribute('data-event-id', eventId);
		GVP.Mobile.addClass(formElement, 'slds-form-element');
		var label = document.createElement('label');
		GVP.Mobile.addClass(label, 'slds-form-element__label');
		GVP.Mobile.addClass(label, 'remove');
		label.innerHTML = options.label;
		formElement.appendChild(label);
		var type = options.multiple ? 'checkbox' : 'radio';
		if (!options.multiple && !options.required) {
			var noneControl = document.createElement('div');
			GVP.Mobile.addClass(noneControl, 'slds-form-element__control');
			var noneOption = document.createElement('input');
			noneOption.setAttribute('name', options.name);
			noneOption.setAttribute('type', type);
			noneOption.setAttribute('value', '');
			var noneLabel = document.createElement('label');
			GVP.Mobile.addClass(noneLabel, 'slds-' + type);
			noneLabel.appendChild(noneOption);
			var optionSpan = document.createElement('span');
			GVP.Mobile.addClass(optionSpan, 'slds-' + type + '--faux');
			noneLabel.appendChild(optionSpan);
			var labelSpan = document.createElement('span');
			GVP.Mobile.addClass(labelSpan, 'slds-form-element__label');
			labelSpan.innerHTML = '--- None ---';
			noneLabel.appendChild(labelSpan);
			noneControl.appendChild(noneLabel);
			formElement.appendChild(noneControl);
		}
		options.options.forEach(function(o) {
			var optionControl = document.createElement('div');
			GVP.Mobile.addClass(optionControl, 'slds-form-element__control');
			var option = document.createElement('input');
			option.setAttribute('name', options.name);
			option.setAttribute('type', type);
			option.setAttribute('value', o.value);
			if (options.required) {
				option.setAttribute('required', '');
			}
			if (o.selected) {
				option.setAttribute('checked', '');
			}
			var optionLabel = document.createElement('label');
			GVP.Mobile.addClass(optionLabel, 'slds-' + type);
			optionLabel.appendChild(option);
			var optionSpan = document.createElement('span');
			GVP.Mobile.addClass(optionSpan, 'slds-' + type + '--faux');
			optionLabel.appendChild(optionSpan);
			var labelSpan = document.createElement('span');
			GVP.Mobile.addClass(labelSpan, 'slds-form-element__label');
			labelSpan.innerHTML = o.text;
			optionLabel.appendChild(labelSpan);
			optionControl.appendChild(optionLabel);
			formElement.appendChild(optionControl);
		});
		wrapper.appendChild(formElement);
		var bindEvent = function() {
			var eventElement = document.querySelector('[data-event-id="' + eventId + '"]');
			if (eventElement) {
				eventElement.addEventListener('click', function() {
					GVP.Mobile.addClass(eventElement, 'active');
					setTimeout(function() {
						GVP.Mobile.removeClass(eventElement, 'active')
					}, 20);
				});
			} else {
				setTimeout(bindEvent, 200);
			}
		};
		bindEvent();
		return wrapper.innerHTML;
	},
	select: function(options) {
		options = options || {};
		var wrapper = document.createElement('div');
		var formElement = document.createElement('div');
		GVP.Mobile.addClass(formElement, 'slds-form-element');
		var label = document.createElement('label');
		GVP.Mobile.addClass(label, 'slds-form-element__label');
		GVP.Mobile.addClass(label, 'remove');
		label.innerHTML = options.label;
		formElement.appendChild(label);
		var inputGroup = document.createElement('div');
		GVP.Mobile.addClass(inputGroup, 'slds-form-element__control');
		var select = document.createElement('select');
		GVP.Mobile.addClass(select, 'slds-select');
		if (options.required) {
			select.setAttribute('required', '');
		}
		if (options.multiple) {
			select.setAttribute('multiple', '');
		} else {
			var option = document.createElement('option');
			option.setAttribute('value', '');
			option.innerHTML = '--- Select ---';
			select.appendChild(option);
		}
		options.options.forEach(function(o) {
			var option = document.createElement('option');
			option.setAttribute('value', o.value);
			if (o.selected) {
				option.setAttribute('selected', '');
			}
			option.innerHTML = o.text;
			select.appendChild(option);
		});
		inputGroup.appendChild(select);
		if (options.allowAdd) {
			GVP.Mobile.addClass(inputGroup, 'input-group');
			var inputGroupButton = document.createElement('span');
			GVP.Mobile.addClass(inputGroupButton, 'input-group-addon');
			inputGroupButton.style.border = 0;
			inputGroupButton.style.margin = 0;
			inputGroupButton.style.padding = 0;
			var addButton = document.createElement('button');
			GVP.Mobile.addClass(addButton, 'slds-button');
			GVP.Mobile.addClass(addButton, 'slds-button--neutral');
			addButton.setAttribute('type', 'button');
			addButton.setAttribute('data-reference-to', options.referenceTo);
			addButton.setAttribute('data-add-button', 'true');
			addButton.innerHTML = '+';
			inputGroupButton.appendChild(addButton);
			inputGroup.appendChild(inputGroupButton);
		}
		formElement.appendChild(inputGroup);
		wrapper.appendChild(formElement);
		return wrapper.innerHTML;
	},
	textarea: function(options) {
		options = options || {};
		var wrapper = document.createElement('div');
		var formElement = document.createElement('div');
		GVP.Mobile.addClass(formElement, 'slds-form-element');
		var label = document.createElement('label');
		GVP.Mobile.addClass(label, 'slds-form-element__label');
		GVP.Mobile.addClass(label, 'remove');
		label.innerHTML = options.label;
		formElement.appendChild(label);
		var formControl = document.createElement('div');
		GVP.Mobile.addClass(formControl, 'slds-form-element__control');
		var textArea = document.createElement('textarea');
		GVP.Mobile.addClass(textArea, 'slds-textarea');
		textArea.setAttribute('rows', 6);
		textArea.innerHTML = options.value || '';
		if (options.required) {
			textArea.setAttribute('required', '');
		}
		formControl.appendChild(textArea);
		formElement.appendChild(formControl);
		wrapper.appendChild(formElement);
		return wrapper.innerHTML;
	},
	yesno: function(options) {
		options = options || {};
		var wrapper = document.createElement('div');
		var formElement = document.createElement('div');
		GVP.Mobile.addClass(formElement, 'slds-form-element');
		var label = document.createElement('label');
		GVP.Mobile.addClass(label, 'slds-form-element__label');
		GVP.Mobile.addClass(label, 'remove');
		label.innerHTML = options.label;
		formElement.appendChild(label);
		var input = document.createElement('input');
		GVP.Mobile.addClass(input, 'slds-hidden');
		input.setAttribute('type', 'text');
		input.setAttribute('value', options.value || '');
		formElement.appendChild(input);
		var buttonGroup = document.createElement('div');
		GVP.Mobile.addClass(buttonGroup, 'slds-button-group');
		buttonGroup.setAttribute('role', 'group');
		var yesButton = document.createElement('button');
		GVP.Mobile.addClass(yesButton, 'slds-button');
		GVP.Mobile.addClass(yesButton, 'slds-button--neutral');
		yesButton.setAttribute('type', 'button');
		yesButton.setAttribute('name', 'yes');
		yesButton.innerHTML = $Label.Yes || 'Yes';
		buttonGroup.appendChild(yesButton);
		var noButton = document.createElement('button');
		GVP.Mobile.addClass(noButton, 'slds-button');
		GVP.Mobile.addClass(noButton, 'slds-button--neutral');
		noButton.setAttribute('type', 'button');
		noButton.setAttribute('name', 'no');
		noButton.innerHTML = $Label.No || 'No';
		buttonGroup.appendChild(noButton);
		if (options.value === 'true') {
			GVP.Mobile.addClass(yesButton, 'slds-button--brand');
		} else if (options.value === 'false') {
			GVP.Mobile.addClass(noButton, 'slds-button--brand');
		}
		formElement.appendChild(buttonGroup);
		wrapper.appendChild(formElement);

		if (options.required) {
			input.setAttribute('required', '');
			buttonGroup.setAttribute('required', '');
		}

		return wrapper.innerHTML;
	}
};
GVP.Mobile.template = function(options) {
	options = options || {};
	var template = document.querySelector('#' + options.template);
	var wrapper = document.createElement('div');
	wrapper.innerHTML = template.innerHTML;
	template.parentNode.appendChild(wrapper);
	var element = wrapper.children[0];
	for (var key in options.data) {
		var value = options.data[key];
		element.innerHTML = element.innerHTML.replace(new RegExp('=' + key, 'g'), value);
	}
	[].forEach.call(element.querySelectorAll('[data-conditional]'), function(element) {
		var conditional = true;
		try {
			conditional = eval(element.getAttribute('data-conditional'));
		} catch(e) {}
		if (!conditional) {
			element.parentNode.removeChild(element);
		}
	});
	wrapper.parentNode.removeChild(wrapper);
	return element;
};
GVP.Mobile.translateFieldValues = function(options) {
	options = options || {};
	Object.keys(options.values || []).forEach(function(key) {
		var value = options.values[key];
		var describe = options.describe.fields.filter(function(describe) {
			return describe.name === key;
		})[0];
		switch((describe || {}).type) {
			case 'date':
			case 'datetime':
				if (!value) {
					options.values[key] = null;
				} else if (!value.getTime) {
					var localDate = new Date(value);
					options.values[key] = new Date(localDate.getTime() + (localDate.getTimezoneOffset() * 60000 * 2));
				}
				break;
		}
	});
}
GVP.Mobile.update = function(options) {
	options = options || {};
	GVP.Mobile.translateFieldValues(options);
	var o = new options.model(options.values);
	options.busy = true;
	o.update(function(error, records, event) {
		options.busy = false;
		if (error) {
			alert(error.message);
		} else if (options.callback) {
			options.callback.apply(options, [error, records, event]);
		}
	});
};
GVP.Mobile.upsert = function(options) {
	options = options || {};
	GVP.Mobile.translateFieldValues(options);
	var o = new options.model(options.values);
	options.busy = true;
	o.upsert(function(error, records, event) {
		options.busy = false;
		if (error) {
			alert(error.message);
		} else if (options.callback) {
			options.callback.apply(options, [error, records, event]);
		}
	});
};
GVP.Mobile.updateValues = function(options) {
	options = options || {};
	options.values = {};
	var element = options.element || document.getElementById('content');
	var id = GVP.Mobile.antecedentAttribute(element, 'data-record-id');
	if (id) {
		options.values.Id = id;
	}
	[].forEach.call(element.querySelector('form fieldset').querySelectorAll('div[data-field]'),
		function(formField) {
			var input = formField.querySelector('input, select, textarea');
			var field = formField.getAttribute('data-field');
			var value = input.value;
			if (input.type === 'checkbox') {
				value = input.checked;
			} else if (input.type === 'radio') {
				value = formField.querySelector('input:checked').value;
			} else if (input.hasAttribute('multiple')) {
				value = [].filter.call(input.querySelectorAll('option'), function(option) {
					return option.selected;
				}).map(function(option) {
					return option.value;
				}).join(';');
			} else if (input.hasAttribute('aria-activedescendant')) {
				value = input.getAttribute('aria-activedescendant');
			}
			if (value || !(['checkbox', 'radio', 'select'].indexOf(input.type) >= 0)) {
				options.values[field] = value;
			}
		}
	);
	if (options.updateValues) {
		options.updateValues(options);
	}
	GVP.Mobile[options.name]().values = options.values;
	GVP.Mobile[options.name]().activities = options.activities;
	return options.values;
};