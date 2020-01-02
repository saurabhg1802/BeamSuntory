/*
@license
dhtmlxGantt v.3.3.0 Stardard
This software is covered by GPL license. You also can obtain Commercial or Enterprise license to use it in non-GPL project - please contact sales@dhtmlx.com. Usage without proper license is prohibited.
(c) Dinamenta, UAB.
*/
gantt._tooltip = {};
gantt._tooltip_class = "gantt_tooltip";
gantt.config.tooltip_timeout = 30;//,
gantt.config.tooltip_offset_y = 2;
gantt.config.tooltip_offset_x = 1;//,
	// timeout_to_hide: 50,
	// delta_x: 15,
	// delta_y: -20

gantt._create_tooltip = function(){
	if (!this._tooltip_html){
		this._tooltip_html = document.createElement('div');
		this._tooltip_html.className = gantt._tooltip_class;
	}
	return this._tooltip_html;
};

gantt._is_cursor_under_tooltip = function(mouse_pos, tooltip) {
	if(mouse_pos.x >= tooltip.pos.x && mouse_pos.x <= (tooltip.pos.x + tooltip.width)) return true;
	if(mouse_pos.y >= tooltip.pos.y && mouse_pos.y <= (tooltip.pos.y + tooltip.height)) return true;
	return false;
};

/* quantifies date data into a values.
	higher the value, later the date.
*/
gantt._time_hash = function(month, day, year) {
	return (year*100) + parseInt(month) + (parseInt(day)/100);
};

gantt._show_tooltip = function(text, pos, ev, task) {
	//if (gantt.config.touch && !gantt.config.touch_tooltip) return;

	if(gantt.config.view == "year"){
		var cursor = this._date_from_cursor(ev);
	}
	else if (gantt.config.view == "quarter"){
		var cursor = this._date_from_cursor_quarter(ev, gantt.config.month);
	}
	else if (gantt.config.view == "month"){
		var cursor = this._date_from_cursor_month(ev, gantt.config.month);
	}
	else {
		// do nothing
	}
	//console.log(_currentCursorPositionDate);

	var start_month = task.start_date.getMonth() + 1;
	var start_day = task.start_date.getDate();
	var start_year = task.start_date.getFullYear();
	var end_month = task.end_date.getMonth() + 1;
	var end_day = task.end_date.getDate();
	var end_year = task.end_date.getFullYear();	

	curs = this._time_hash(cursor[0], cursor[1], gantt.config.year);
	star = this._time_hash(start_month, start_day, start_year);
	end = this._time_hash(end_month, end_day, end_year);

	/*
		This code separates the calendar events from eventless calendar time based on cursor position on the viewable window.
	*/
	/*
	if (curs >= star && curs <= end){
		//console.log("there");
	}
	else {
		//console.log("here");
		//this._hide_tooltip();
		//return;
	}
	*/

	var tip = this._create_tooltip();

	gantt.$task.appendChild(tip);

	
	var width = tip.offsetWidth + 20;
	var height = tip.offsetHeight + 10;
	var max_height = this.$task.offsetHeight;
	var max_width = this.$task.offsetWidth;
	var scroll = this.getScrollState();
	
	//pos.x += scroll.x;    X axis does not scroll although it does extend
	

	var mouse_pos = {
		x: pos.x,
		y: pos.y
	};

	//pos.y += scroll.y;  This wasn't needed. The mouse position and scroll view position stayed in perfect relativity
	
	
	pos.x += (gantt.config.tooltip_offset_x*1 || 0);
	pos.y += (gantt.config.tooltip_offset_y*1 || 0);

	/* I commented this out to try the 2 statements below

	pos.y = Math.min(Math.max(scroll.y, pos.y), scroll.y+max_height - height);
	pos.x = Math.min(Math.max(scroll.x, pos.x), scroll.x+max_width - width);

	*/

	/* gantt.config.left_panel is flag that indicates whether the left panel is open or closed, 1 if closed, 0 if open) */
	pos.y = Math.min(pos.y, max_height - height); 
	pos.x = Math.min(pos.x, max_width - width - (235 * gantt.config.left_panel)); // subtracted 235 to account for the div left panel as a safety measure 


	/* REMOVED THE ABOVE MODAL WINDOW ADJUSTMENT BECAUSE OF 2 REASONS
		(1) The flip position yielded off screen modal window display
		(2) The above 2 statements yielded a cleaner solution

	if (gantt._is_cursor_under_tooltip(mouse_pos, {pos: pos, width: width, height: height})) {
		
		if((mouse_pos.x+width) > (max_width + scroll.x)) 
			pos.x = mouse_pos.x - (width - 20) - (gantt.config.tooltip_offset_x*1 || 0);
		
		if((mouse_pos.y+height) > (max_height + scroll.y)) 
			pos.y = mouse_pos.y - (height + 10) - (gantt.config.tooltip_offset_y*1 || 0);
	}

	*/

	var taskLeft = parseInt(ev.taskLeft);
	var taskWidth = parseInt(ev.taskWidth);
	

	if( taskLeft > 800 ) {
		tooltipX = taskLeft - 500 + taskWidth * .7;
		tip.style.left = tooltipX + "px";
	} else {
		tip.style.left = pos.x + "px";
	}
	
	tip.style.top  = pos.y + "px";

	//tip.style.width = "200px";
	tip.innerHTML = text;


	/***  DEBUG VALUES  ****/
	
};

gantt._hide_tooltip = function(){
	if (this._tooltip_html && this._tooltip_html.parentNode)
		this._tooltip_html.parentNode.removeChild(this._tooltip_html);
	this._tooltip_id = 0;
};

gantt._is_tooltip = function(ev) {
	var node = ev.target || ev.srcElement;
	return gantt._is_node_child(node, function(node){
		return (node.className == this._tooltip_class);
	});
};

gantt._is_task_line = function(ev){
	var node = ev.target || ev.srcElement;
	return gantt._is_node_child(node, function(node){
		return (node == this.$task_data);
	});
};

gantt._is_node_child = function(node, condition){
	var res = false;
	while (node && !res) {
		res = condition.call(gantt, node);
		node = node.parentNode;
	}
	return res;
};

gantt._tooltip_pos = function(ev) {
	if (ev.pageX || ev.pageY)
		var pos = {x:ev.pageX, y:ev.pageY};

	var d = _isIE ? document.documentElement : document.body;
	var pos = {
		x:ev.clientX + d.scrollLeft - d.clientLeft,
		y:ev.clientY + d.scrollTop - d.clientTop
	};

	var box = gantt._get_position(gantt.$task_data);
	pos.x = pos.x - box.x;
	pos.y = pos.y - box.y;
	return pos;
};

// generates date from cursor position on the viewable window within the year (12 months viewable)
gantt._date_from_cursor = function(ev) {
	
	// the offset on the X axis is 39 pixels.  Could change
	var pos = ev.pageX - 37 - (225 * gantt.config.left_panel);
	var month = this.$task.offsetWidth / 12;
	var factor = Math.floor(this.$task.offsetWidth / 12.0);
	var day = pos % factor;
	var day_factor = 0;
	var final_month = 0;
	var final_day = 0;

	//console.log(pos)

	if(pos >= 0 && pos < month){
		day_factor = 31;
		final_month = 1;
	}
	else if(pos > month && pos < (month*2)){
		day_factor = 28;
		final_month = 2;
	}
	else if(pos > (month*2) && pos < (month*3)){
		day_factor = 31;
		final_month = 3;
	}
	else if(pos > (month*3) && pos < (month*4)){
		day_factor = 30;
		final_month = 4;
	}
	else if(pos > (month*4) && pos < (month*5)){
		day_factor = 31;
		final_month = 5;
	}
	else if(pos > (month*5) && pos < (month*6)){
		day_factor = 30;
		final_month = 6;
	}
	else if(pos > (month*6) && pos < (month*7)){
		day_factor = 31;
		final_month = 7;
	}
	else if(pos > (month*7) && pos < (month*8)){
		day_factor = 31;
		final_month = 8;
	}
	else if(pos > (month*8) && pos < (month*9)){
		day_factor = 30;
		final_month = 9;
	}
	else if(pos > (month*9) && pos < (month*10)){
		day_factor = 31;
		final_month = 10;
	}
	else if(pos > (month*10) && pos < (month*11)){
		day_factor = 30;
		final_month = 11;
	}
	else if(pos > (month*11) && pos < (month*12)){
		day_factor = 31;
		final_month = 12;
	}
	else {
		// nothing
	}

	final_day = Math.floor( (day/factor) * day_factor ) + 1;

	//console.log(final_month + " " + final_day);

	return [final_month, final_day];

};

// generates date from cursor position on the viewable window within the quarter (3 months viewable)
gantt._date_from_cursor_quarter = function(ev, start_month) {
	
	// the offset on the X axis is 39 pixels.  Could change
	var pos = ev.pageX - 37 - (225 * gantt.config.left_panel);
	var month = this.$task.offsetWidth / 3;
	var factor = Math.floor(this.$task.offsetWidth / 3.0);
	var day = pos % factor;
	var day_factor = 0;
	var final_month = 0;
	var final_day = 0;

	//console.log(pos)

	if(pos >= 0 && pos < month){
		day_factor = 31;
		final_month = 0;
	}
	else if(pos > month && pos < (month*2)){
		day_factor = 31;
		final_month = 1;
	}
	else if(pos > (month*2) && pos < (month*3)){
		day_factor = 31;
		final_month = 2;
	}
	else {
		// nothing
	}

	final_day = Math.floor( (day/factor) * day_factor ) + 1;
	final_month = start_month + final_month;

	//console.log(final_month + " " + final_day);

	return [final_month, final_day];

};

// generates date from cursor position on the viewable window within the month
gantt._date_from_cursor_month = function(ev, start_month) {
	
	// the offset on the X axis is 39 pixels.  Could change
	var pos = ev.pageX - 37 - (225 * gantt.config.left_panel);
	var month = this.$task.offsetWidth / 1;
	var factor = Math.floor(this.$task.offsetWidth / 1.0);
	var day = pos % factor;
	var day_factor = 31;
	var final_month = 0;
	var final_day = 0;

	//console.log(pos)

	final_day = Math.floor( (day/factor) * day_factor ) + 1;
	final_month = start_month;

	//console.log(final_month + " " + final_day);

	return [final_month, final_day];

};

/*
gantt.attachEvent("onMouseMove", function(event_id, ev) { // (gantt event_id, browser event)
	console.log('gantt onMouseMove event fired...');
	if(this.config.tooltip_timeout){
		//making events survive timeout in ie
		if(document.createEventObject && !document.createEvent)
			ev = document.createEventObject(ev);

		var delay = this.config.tooltip_timeout;

		if(this._tooltip_id && !event_id){
			if(!isNaN(this.config.tooltip_hide_timeout)){
				delay = this.config.tooltip_hide_timeout;
			}
		}

		clearTimeout(gantt._tooltip_ev_timer);
		gantt._tooltip_ev_timer = setTimeout(function(){
			gantt._init_tooltip(event_id, ev);
		}, delay);

	}else{
		gantt._init_tooltip(event_id, ev);
	}
});
*/
gantt._init_tooltip = function(event_id, ev){
	/*
	if (this._is_tooltip(ev)) return;
	if (event_id == this._tooltip_id && !this._is_task_line(ev)) return;
	if (!event_id)
		return this._hide_tooltip();
	*/

	this._tooltip_id = event_id;

	var task = this.getTask(event_id);
	var text = this.templates.tooltip_text(task.start_date, task.end_date, task);

	//console.log(gantt.config.view);
	//console.log(gantt.config.month);
	if (!text){
		this._hide_tooltip();
		console.log('no text... hence hiding tooltip...');
		return;
	}
	this._show_tooltip(text, this._tooltip_pos(ev), ev, task);
};


gantt.attachEvent("onMouseLeave", function(ev){
	if (gantt._is_tooltip(ev)) return;
	this._hide_tooltip();
});

// gantt.attachEvent("onBeforeDrag", function() {
// 	gantt._tooltip.hide();
// 	return true;
// });
// gantt.attachEvent("onEventDeleted", function() {
// 	gantt._tooltip.hide();
// 	return true;
// });


/* Could be redifined */
gantt.templates.tooltip_date_format = gantt.date.date_to_str("%Y-%m-%d");
gantt.templates.tooltip_text = function(start, end, event) {
	return "<b>Task:</b> " + event.text + "<br/><b>Start date:</b> " + gantt.templates.tooltip_date_format(start) + "<br/><b>End date:</b> " + gantt.templates.tooltip_date_format(end);
};

/*************** The Bindings ************/
$(function(){
	<!-- Code for Hover/Tooltip -->
	$(document).on('mouseover mouseenter', '.gantt_task_line', function(ev){
		 ev.stopPropagation();
		 var taskID =  $(this).attr('task_id');
		 //console.log('Caling gantt._init_tooltip... id = ' + taskID);
		 //console.log(gantt.getTask(taskID));
		 gantt._hide_tooltip();
		 ev.taskLeft = $(this).css('left');
		 ev.taskWidth = $(this).css('width');
		 //console.log(ev);
		 gantt._init_tooltip(taskID, ev);
	 }); 
	 
	 $(document).on('mouseleave', '.gantt_tooltip', function(ev){
		 ev.stopPropagation();
		 gantt._hide_tooltip();
	 });
						  
	 $(document).on('mouseover', '.gantt_task_row', function(ev){
		 ev.stopPropagation();
		 //console.log(ev);
		 if($(ev.target).hasClass('gantt_task_line')) {
			 console.log('on a task');
		 }
		 gantt._hide_tooltip();
	 });
})

