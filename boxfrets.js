/* code to handle manipulation */
var GUITAR_STRINGS;
var COLOR = "red";
var POSSIBLE_COLORS = "coffee red green orange transparent"
var gen_fret_boxes = function(size, num_strings){
    var tr = "<tr>";
    for (var i = 0; i < size; i++){
	tr += '<td class="transparent">&nbsp;</td>';
    }
    tr += "</tr>";
    var table = '<table id="fretclone">';
    for (var i = 0; i < num_strings; i++) {
	table += tr;
    }
    table += "</table>\n";
    return table;
}
var td_paint = function(td){
    var color = arguments.length > 1 ? arguments[1] : "coffee";
    var td = $(td);
    td.removeClass(POSSIBLE_COLORS);
    td.addClass(color);
}
var td_clear = function(td){
    td_paint(td, 'transparent');
}
var td_paint_or_clear = function(td, color){
    var color = arguments.length > 1 ? arguments[1] : "coffee";
    var td = $(td);
    if (!td.hasClass('transparent') && td.hasClass(color)){
	td.removeClass(POSSIBLE_COLORS);
	td.addClass('transparent');
    } else {
	td.removeClass(POSSIBLE_COLORS);
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
	}
    }
    return guitarStrings;
};
var show_notes_string = function(n, notes){
    if (notes != null){
	for (var i = 0; i < notes.length; i++){
	    if (notes[i] != null){
		td_paint(GUITAR_STRINGS[n][notes[i]].td);
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
jQuery(function() {
	$(gen_fret_boxes(19, 6)).insertAfter($('#mainfretboard'));
	GUITAR_STRINGS = getFretcloneStrings();

	// show diagram of a C Major chord
	show_chord([null, 1, null, 2, 3]);

	var a_minor_penta = [[5, 8], [5, 8], [5, 7], [5, 7], [5, 7], [5, 8]];
	// show diagram of an A minor penta scale form
	show_scale(a_minor_penta);
});
