/* code to handle manipulation */
var GUITAR_STRINGS;
var COLOR = "green";
var POSSIBLE_COLORS = ["orange", "green", "blue", "yellow", "coffee", "red", "transparent"]
var ERASER = false;
var gen_fret_boxes = function(size, num_strings){
    var tr = "<tr>";
    for (var i = 0; i < size; i++){
	tr += '<td class="transparent"><span class="note"></span></td>';
    }
    tr += "</tr>";
    var table = '<table id="fretclone">';
    for (var i = 0; i < num_strings; i++) {
	table += tr;
    }
    table += "</table>";
    return table;
}
var td_paint = function(td){
    var color = arguments.length > 1 ? arguments[1] : "coffee";
    var td = $(td);
    td.removeClass(POSSIBLE_COLORS.join(" "));
    td.addClass(color);
}
var td_clear = function(td){
    td_paint(td, 'transparent');
}
var is_painted = function(td){
    return !$(td).hasClass('transparent');
}
function is_defined(obj){
    return obj != null && obj != undefined;
}
/*
 * n_string is the index of the string (starts at 0)
 * a note may be a number, or a list with a number and a class name
 */
var note_paint = function(n_string, note){
    if ($.isArray(note)){
	td_paint(GUITAR_STRINGS[n_string][note[0]].td, note[1]);
    } else {
	td_paint(GUITAR_STRINGS[n_string][note].td);
    }
}
/*
 * generate representation of the diagram for url
 *
 * the ';'s separate strings, the commas separate
 * notes definition, the ':'s separate note number
 * from note color.
 */
var uri_diagram_repr = function(guitarStrings){
    var arr = $.map(guitarStrings, function (n, i){
	var s = $.map(n, function (box, j){
	    if (is_painted(box.td)){
		var cls = $(box.td).attr('class');
	       	return j + ":" + POSSIBLE_COLORS.indexOf(cls);
	    }
	    return null;
	});
	return s.join(",");
    });
    return arr.join(";");
}
var create_link_from_fretboard = function(){
    var href = window.location.href;
    if (href.indexOf('#') > 0){
	href = href.substring(0, href.indexOf('#'));
    }
    href += '#';
    href += "strings=" + uri_diagram_repr(GUITAR_STRINGS);
    href += "&diagram_title=" + escape($('#diagram_title').val());
    return href;
}
var update_link = function(){
	    $('#linkthis').attr('href', create_link_from_fretboard());
	    $('#linkquiz').attr('href', create_link_from_fretboard() + "&q=y");
}
// handle url parameters
function get_url_parameters(){
    var query = arguments.length > 0 ? arguments[0] : window.location.href;
    var params = {};
    var index_params = query.indexOf('#');
    if (index_params >= 0){
	var hashes = query.slice(index_params + 1).split('&');
	for(var i = 0; i < hashes.length; i++){
	    var hash = hashes[i].split('=');
	    params[hash[0]] = hash[1];
	}
    }
    return params;
}
function fill_from_repr(repr){
    var a_rep = repr.split(';');
    var match_color = arguments.length > 1 ? arguments[1] : null;
    for(var i = 0; i < a_rep.length; i++){
	if (is_defined(a_rep[i]) && a_rep[i] != ""){
	    var par = $.map(a_rep[i].split(","), function (e, index){
		var a = e.split(':');
		var color = POSSIBLE_COLORS[a[1]];
		if (match_color != null && color != match_color){
		    return null;
		}
		return [[a[0], color]];
	    });
	    show_notes_string(i, par);
	}
    }
}
// callback for when a cell is clicked
var td_paint_or_clear = function(td, color){
    var color = arguments.length > 1 ? arguments[1] : "coffee";
    var td = $(td);
    if (!td.hasClass('transparent') && td.hasClass(color)){
	td.removeClass(POSSIBLE_COLORS.join(" "));
	td.addClass('transparent');
    } else {
	td.removeClass(POSSIBLE_COLORS.join(" "));
	td.addClass(color);
    }
}

var getFretcloneStrings = function(){
    var board_strings = $('#fretclone tr');
    var guitarStrings = [[], [], [], [], [], []];
    for (var i = 0; i < board_strings.length; i++){
		var children = board_strings[i].children;
		for (var j = 0; j < children.length; j++){
		    var box = {
				td: children[j],
				paint: function(){
				    td_paint_or_clear(this, COLOR);
				},
		    }
		    guitarStrings[i].push(box);
		    $(children[j]).click(box.paint);

		    // eraser:
		    $(children[j]).mouseover(function(){
		    	if (ERASER == true){
	    			td_clear(this);
	    		}
	    		update_link();
	    	});
		}
    }
    return guitarStrings;
};
var show_notes_string = function(n_string, notes){
    if (notes != null){
	for (var i = 0; i < notes.length; i++){
	    if (notes[i] != null){
		note_paint(n_string, notes[i]);
	    }
	}
    }
}
var show_chord = function (chord){
    for(var i = 0; i < chord.length; i++){
	show_notes_string(i, [chord[i]]);
    }
}
var show_scale = function (scale){
    for(var i = 0; i < scale.length; i++){
	if (scale[i] != null){
	    show_notes_string(i, scale[i]);
	}
    }
}
var check_answers = function(a_repr) {
    var a_rep = a_repr.split(';');
    for(var i = 0; i < a_rep.length; i++){
		if (is_defined(a_rep[i]) && a_rep[i] != ""){
		    var marked_notes = $.map(a_rep[i].split(","), function (e, index){
		        return [e.split(":")[0]];
		    });
		    for (var j = 0; j < GUITAR_STRINGS[i].length; j++){
				if ($.inArray(j.toString(), marked_notes) >= 0){
				    var color = is_painted(GUITAR_STRINGS[i][j].td) ? "green" : "orange";
				    note_paint(i, [j, color]);
				} else {
				    if (is_painted(GUITAR_STRINGS[i][j].td)){
					// show wrong notes in red
					note_paint(i, [j, "red"]);
				    }
				}
		    }
		}
	}
}
var clear_fretboard = function(){
	for(var i = 0; i < GUITAR_STRINGS.length; i++){
		for(var j = 0; j < GUITAR_STRINGS[i].length; j++){
			td_clear(GUITAR_STRINGS[i][j].td);
		}
	}
}
var pick_note = function(position, offset){
	if(typeof(offset)==='undefined') offset=0; // defaults to E
	if(typeof(position)==='undefined') position=4; // defaults to E
	var scale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
	return scale[(position + offset) % scale.length];
}
var set_notes = function(){
	//var offsets = [4, 9, 2, 7, 11, 4];
	var offsets = [4, 11, 7, 2, 9, 4];
	for(var i = 0; i < GUITAR_STRINGS.length; i++){
		for(var j = 0; j < GUITAR_STRINGS[i].length; j++){
			$(GUITAR_STRINGS[i][j].td).find('.note').html(pick_note(j, offsets[i]));
		}
	}
}
var loadFromUrl = function(url_params){
	if (is_defined(url_params['diagram_title'])){
		$('#diagram_title').val(unescape(url_params['diagram_title']));
	}
	if (is_defined(url_params['strings'])){
		if (is_defined(url_params['q']) && url_params['q'] == 'y'){
			COLOR = "coffee";
			$('#checkanswer').click(function(){
				check_answers(url_params['strings']);
			});
			$('#colorchooser').hide();
			$('#checkanswer').show();
		} else {
			fill_from_repr(url_params['strings']);
		}
	}
}
jQuery(function() {
	$(gen_fret_boxes(19, 6)).insertAfter($('#mainfretboard'));
	GUITAR_STRINGS = getFretcloneStrings();
	set_notes();

	// show diagram of a C Major chord
	//show_chord([null, 1, null, 2, [3, 'red']]);

	//var a_minor_penta = [[5, 8], [5, 8], [5, 7], [5, 7], [5, 7], [5, 8]];
	// show diagram of an A minor penta scale form
	//show_scale(a_minor_penta);
	loadFromUrl(get_url_parameters());
	update_link();
	var message = $('#message');
	// update link at every click on a note...
	$('#fretclone tr td').click(update_link);
	// or when changes are made to the title
	$('#diagram_title').change(update_link)
	    .keyup(update_link)
	    .keydown(update_link);
	$('#diagram_title').click(function(){ this.select(); });

	// set up color buttons according each element's class
	$('.color_button').click(function(){
		COLOR = $(this).attr('class').split(' ')[1];
		message.html('');
	})

	// set up eraser and clear buttons:
	$('#eraser').toggle(function(){
		ERASER = true;
		$(this).removeClass('blank').addClass('white');
		message.html('<b>Eraser activated!</b><br /><sub>Mouseover the marks to erase them</sub>')
	}, function(){
		$(this).removeClass('white').addClass('blank');
		ERASER = false;
		message.html('')
	});
	$('#clear').click(function(){
		message.html('');
		clear_fretboard(); update_link();
	});

	// set up example links
	$('#examples ul li a').click(function(){
		clear_fretboard();
		loadFromUrl(get_url_parameters($(this).attr('href')));
		update_link();
	});
	// TODO: fix quiz behavior (do not show note names in quiz mode), and show message on check answer
	// TODO: find a way to show enarmonics
});
