/* code to handle manipulation */
var GUITAR_STRINGS;
var COLOR = "green";
var POSSIBLE_COLORS = ["orange", "green", "blue", "yellow", "coffee", "red", "transparent"]
var ERASER = false;
var calculateFretWidths = function(numFrets, firstWidth) {
    var ratio = Math.pow(2, -1/12);
    return Array.from({length: numFrets}, function(_, i) {
        return Math.round(firstWidth * Math.pow(ratio, i));
    });
};
var SINGLE_DOT_FRETS = [3, 5, 7, 9, 15, 17, 19, 21];
var DOUBLE_DOT_FRETS = [12];
var STRING_THICKNESSES = [1, 1.2, 1.5, 1.7, 2, 2.3]; // high E → low E
var CELL_HEIGHT = 34;
var SINGLE_MARKER_STRING = 2;
var DOUBLE_MARKER_STRINGS = [1, 4];
var gen_fretboard = function(numFrets, numStrings, widths) {
    var cols = widths.map(function(w) { return w + 'px'; }).join(' ');
    var html = '<div id="fretboard" style="grid-template-columns:' + cols + '">';
    for (var s = 0; s < numStrings; s++) {
        for (var f = 0; f < numFrets; f++) {
            var markerClass = '';
            if (SINGLE_DOT_FRETS.indexOf(f) >= 0 && s === SINGLE_MARKER_STRING) markerClass = ' has-marker';
            if (DOUBLE_DOT_FRETS.indexOf(f) >= 0 && DOUBLE_MARKER_STRINGS.indexOf(s) >= 0) markerClass = ' has-marker';
            html += '<div class="fretboard-cell transparent' + markerClass + '"><span class="note"></span></div>';
        }
    }
    for (var s = 0; s < numStrings; s++) {
        var t = STRING_THICKNESSES[s];
        var top = (s + 0.5) * CELL_HEIGHT - t / 2;
        html += '<div class="string-line" style="top:' + top + 'px;height:' + t + 'px"></div>';
    }
    html += '</div>';
    return html;
};
var td_paint = function(td, color = "coffee"){
    td.classList.remove(...POSSIBLE_COLORS);
    td.classList.add(color);
}
var td_clear = function(td){
    td_paint(td, 'transparent');
}
var is_painted = function(td){
    return !td.classList.contains('transparent');
}
function is_defined(obj){
    return obj != null && obj != undefined;
}
/*
 * n_string is the index of the string (starts at 0)
 * a note may be a number, or a list with a number and a class name
 */
var note_paint = function(n_string, note){
    if (Array.isArray(note)){
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
    var arr = guitarStrings.map(function(n){
        var s = n.reduce(function(acc, box, j){
            if (is_painted(box.td)){
                acc.push(j + ":" + POSSIBLE_COLORS.indexOf(box.td.className));
            }
            return acc;
        }, []);
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
    href += "&diagram_title=" + encodeURIComponent(document.getElementById('diagram_title').value);
    return href;
}
var update_link = function(){
    document.getElementById('linkthis').href = create_link_from_fretboard();
    document.getElementById('linkquiz').href = create_link_from_fretboard() + "&q=y";
}
// handle url parameters
function get_url_parameters(query = window.location.href){
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
function fill_from_repr(repr, match_color = null){
    var a_rep = repr.split(';');
    for(var i = 0; i < a_rep.length; i++){
	if (is_defined(a_rep[i]) && a_rep[i] != ""){
	    var par = a_rep[i].split(",").reduce(function(acc, e){
		var a = e.split(':');
		var color = POSSIBLE_COLORS[a[1]];
		if (match_color == null || color === match_color){
		    acc.push([a[0], color]);
		}
		return acc;
	    }, []);
	    show_notes_string(i, par);
	}
    }
}
// callback for when a cell is clicked
var td_paint_or_clear = function(td, color = "coffee"){
    if (!td.classList.contains('transparent') && td.classList.contains(color)){
	td.classList.remove(...POSSIBLE_COLORS);
	td.classList.add('transparent');
    } else {
	td.classList.remove(...POSSIBLE_COLORS);
	td.classList.add(color);
    }
}

var getFretboardStrings = function(numFrets, numStrings) {
    var cells = document.querySelectorAll('#fretboard .fretboard-cell');
    var guitarStrings = Array.from({length: numStrings}, function() { return []; });
    cells.forEach(function(cell, idx) {
        var s = Math.floor(idx / numFrets);
        var f = idx % numFrets;
        var box = {
            td: cell,
            paint: function() { td_paint_or_clear(this, COLOR); }
        };
        guitarStrings[s][f] = box;
        cell.addEventListener('click', box.paint);
        cell.addEventListener('mouseover', function() {
            if (ERASER) { td_clear(this); update_link(); }
        });
    });
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
	    var marked_notes = a_rep[i].split(",").map(function(e){
		return e.split(":")[0];
	    });
	    for (var j = 0; j < GUITAR_STRINGS[i].length; j++){
		if (marked_notes.indexOf(j.toString()) >= 0){
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
var pick_note = function(position = 4, offset = 0){
    var scale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return scale[(position + offset) % scale.length];
}
var set_notes = function(){
    var offsets = [4, 11, 7, 2, 9, 4];
    for(var i = 0; i < GUITAR_STRINGS.length; i++){
	for(var j = 0; j < GUITAR_STRINGS[i].length; j++){
	    GUITAR_STRINGS[i][j].td.querySelector('.note').innerHTML = pick_note(j, offsets[i]);
	}
    }
}

var loadFromUrl = function(url_params){
    if (is_defined(url_params['diagram_title'])){
	document.getElementById('diagram_title').value = decodeURIComponent(url_params['diagram_title']);
    }
    if (is_defined(url_params['strings'])){
	if (is_defined(url_params['q']) && url_params['q'] == 'y'){
	    COLOR = "coffee";
	    document.getElementById('checkanswer').addEventListener('click', function(){
		check_answers(url_params['strings']);
	    });
	    document.getElementById('colorchooser').style.display = 'none';
	    document.getElementById('checkanswer').style.display = 'inline';
	} else {
	    fill_from_repr(url_params['strings']);
	}
    }
}
document.addEventListener('DOMContentLoaded', function() {
    var numFrets = 22;
    var ratio = Math.pow(2, -1/12);
    var sumRatios = (1 - Math.pow(ratio, numFrets)) / (1 - ratio);
    var firstFretWidth = (window.innerWidth - 20) / sumRatios;
    var fretWidths = calculateFretWidths(numFrets, firstFretWidth);
    document.getElementById('main').insertAdjacentHTML('beforeend', gen_fretboard(numFrets, 6, fretWidths));
    GUITAR_STRINGS = getFretboardStrings(numFrets, 6);
    set_notes();

    // Examples:
    // show diagram of a C Major chord
    //show_chord([null, 1, null, 2, [3, 'red']]);

    //var a_minor_penta = [[5, 8], [5, 8], [5, 7], [5, 7], [5, 7], [5, 8]];
    // show diagram of an A minor penta scale form
    //show_scale(a_minor_penta);
    loadFromUrl(get_url_parameters());
    update_link();
    var message = document.getElementById('message');
    // update link at every click on a note...
    document.querySelectorAll('#fretboard .fretboard-cell').forEach(function(td){ td.addEventListener('click', update_link); });
    // or when changes are made to the title
    var titleInput = document.getElementById('diagram_title');
    ['change', 'keyup', 'keydown'].forEach(function(ev){ titleInput.addEventListener(ev, update_link); });
    titleInput.addEventListener('click', function(){ this.select(); });

    // set up color buttons according each element's class
    document.querySelectorAll('.color_button').forEach(function(btn){
	btn.addEventListener('click', function(){
	    COLOR = this.className.split(' ')[1];
	    message.innerHTML = '';
	});
    });

    // set up eraser and clear buttons:
    document.getElementById('eraser').addEventListener('click', function(){
	ERASER = !ERASER;
	if (ERASER) {
	    this.classList.remove('blank');
	    this.classList.add('white');
	    message.innerHTML = '<b>Eraser activated!</b><br /><sub>Mouseover the marks to erase them</sub>';
	} else {
	    this.classList.remove('white');
	    this.classList.add('blank');
	    message.innerHTML = '';
	}
    });
    document.getElementById('clear').addEventListener('click', function(){
	message.innerHTML = '';
	clear_fretboard(); update_link();
    });

    document.getElementById('restart').addEventListener('click', function(e){
	e.preventDefault();
	window.location.href = window.location.pathname;
    });

    // set up example links
    document.querySelectorAll('#examples ul li a').forEach(function(a){
	a.addEventListener('click', function(e){
	    e.preventDefault();
	    clear_fretboard();
	    loadFromUrl(get_url_parameters(this.getAttribute('href')));
	    update_link();
	});
    });
    // TODO: fix quiz behavior (do not show note names in quiz mode), and show message on check answer
    // TODO: find a way to show enarmonics
});
