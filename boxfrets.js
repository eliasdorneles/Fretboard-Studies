/* code to handle manipulation */
var GUITAR_STRINGS;
var COLOR = "green";
var POSSIBLE_COLORS = ["orange", "green", "blue", "yellow", "coffee", "red", "transparent"]
var ERASER = false;
var CURRENT_MODE = 'diagram';
var GAME_RUNNING = false;
var GAME_TARGET_STRING = -1;
var GAME_TARGET_NOTE = '';
var GAME_CHALLENGE_START = 0;
var GAME_TIMER_ID = null;
var GAME_SECONDS_LEFT = 60;
var GAME_CORRECT = 0;
var GAME_WRONG = 0;
var GAME_COMPLETED = [];
var GAME_MISTAKES = [];
var NAME_RUNNING = false;
var NAME_TARGET_STRING = -1;
var NAME_TARGET_FRET = -1;
var NAME_TARGET_NOTE = '';
var NAME_CHALLENGE_START = 0;
var NAME_TIMER_ID = null;
var NAME_SECONDS_LEFT = 60;
var NAME_CORRECT = 0;
var NAME_WRONG = 0;
var NAME_COMPLETED = [];
var NAME_MISTAKES = [];
var calculateFretWidths = function(numFrets, firstWidth) {
    var ratio = Math.pow(2, -1/12);
    return Array.from({length: numFrets}, function(_, i) {
        return Math.round(firstWidth * Math.pow(ratio, i));
    });
};
var SINGLE_DOT_FRETS = [3, 5, 7, 9, 15, 17, 19, 21];
var DOUBLE_DOT_FRETS = [12];
var STRING_THICKNESSES = [1, 1.2, 1.5, 1.7, 2, 2.3]; // high E → low E
var STRING_NAMES = ['high E', 'B', 'G', 'D', 'A', 'low E'];
var STRING_OFFSETS = [4, 11, 7, 2, 9, 4];
var CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
var MOBILE_BREAKPOINT = 540;
var getLayoutParams = function() {
    return window.innerWidth < MOBILE_BREAKPOINT
        ? { numFrets: 13, cellHeight: 34 }
        : { numFrets: 22, cellHeight: 34 };
};
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
            var openClass = f === 0 ? ' open-string' : '';
            html += '<div class="fretboard-cell transparent' + markerClass + openClass + '"><span class="note"></span></div>';
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
    var url = create_link_from_fretboard();
    document.getElementById('linkthis').href = url;
    document.getElementById('linkquiz').href = url + "&q=y";
}
function copyToClipboard(el, url) {
    navigator.clipboard.writeText(url).then(function() {
        var orig = el.textContent;
        el.textContent = 'Copied!';
        setTimeout(function() { el.textContent = orig; }, 1500);
    });
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
            paint: function() {
                if (CURRENT_MODE === 'diagram') {
                    if (ERASER) {
                        td_clear(cell);
                        update_link();
                    } else {
                        td_paint_or_clear(cell, COLOR);
                    }
                } else if (CURRENT_MODE === 'find-note' && GAME_RUNNING) {
                    if (s === GAME_TARGET_STRING) handleGameClick(s, f, cell);
                }
            }
        };
        guitarStrings[s][f] = box;
        cell.addEventListener('click', box.paint);
        cell.addEventListener('mouseover', function() {
            if (ERASER && CURRENT_MODE === 'diagram') { td_clear(this); update_link(); }
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

function getNoteName(s, f) {
    return pick_note(f, STRING_OFFSETS[s]);
}

function highlightTargetString(stringIdx) {
    for (var s = 0; s < GUITAR_STRINGS.length; s++) {
        for (var f = 0; f < GUITAR_STRINGS[s].length; f++) {
            GUITAR_STRINGS[s][f].td.classList.toggle('target-string', s === stringIdx);
        }
    }
}

function highlightTargetCell(s, f) {
    document.querySelectorAll('.target-cell').forEach(function(el) {
        el.classList.remove('target-cell');
    });
    if (s >= 0 && f >= 0) {
        GUITAR_STRINGS[s][f].td.classList.add('target-cell');
    }
}

function switchMode(mode) {
    CURRENT_MODE = mode;
    var isDiagram = mode === 'diagram';
    var isFindNote = mode === 'find-note';
    var isNameNote = mode === 'name-note';
    document.getElementById('diagram_title').style.display = isDiagram ? '' : 'none';
    document.getElementById('form_controls').style.display = isDiagram ? '' : 'none';
    document.getElementById('game-panel').style.display = isFindNote ? '' : 'none';
    document.getElementById('name-note-panel').style.display = isNameNote ? '' : 'none';
    document.body.classList.toggle('game-mode', !isDiagram);
    document.querySelectorAll('.mode-tab').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    if (!isFindNote) stopGame();
    if (!isNameNote) stopNameGame();
    if (!isDiagram) clear_fretboard();
}

function startGame() {
    GAME_RUNNING = true;
    GAME_CORRECT = 0;
    GAME_WRONG = 0;
    GAME_COMPLETED = [];
    GAME_MISTAKES = [];
    GAME_SECONDS_LEFT = 60;
    document.getElementById('game-results').style.display = 'none';
    document.getElementById('game-start-btn').textContent = 'Stop';
    updateGameScore();
    nextChallenge();
    GAME_TIMER_ID = setInterval(function() {
        GAME_SECONDS_LEFT--;
        var m = Math.floor(GAME_SECONDS_LEFT / 60);
        var s = GAME_SECONDS_LEFT % 60;
        document.getElementById('game-timer').textContent =
            m + ':' + (s < 10 ? '0' : '') + s;
        document.getElementById('game-timer').classList.toggle('urgent', GAME_SECONDS_LEFT <= 10);
        if (GAME_SECONDS_LEFT <= 0) endGame();
    }, 1000);
}

function stopGame() {
    if (GAME_TIMER_ID) { clearInterval(GAME_TIMER_ID); GAME_TIMER_ID = null; }
    GAME_RUNNING = false;
    highlightTargetString(-1);
    document.getElementById('game-timer').classList.remove('urgent');
    document.getElementById('game-timer').textContent = '1:00';
    document.getElementById('game-start-btn').textContent = 'Start';
}

function nextChallenge() {
    GAME_TARGET_STRING = Math.floor(Math.random() * 6);
    GAME_TARGET_NOTE = CHROMATIC[Math.floor(Math.random() * 12)];
    GAME_CHALLENGE_START = Date.now();
    highlightTargetString(GAME_TARGET_STRING);
    document.getElementById('target-note').textContent = GAME_TARGET_NOTE;
}

function handleGameClick(s, f, cell) {
    var clicked = getNoteName(s, f);
    if (clicked === GAME_TARGET_NOTE) {
        var elapsed = Date.now() - GAME_CHALLENGE_START;
        GAME_CORRECT++;
        GAME_COMPLETED.push({ note: GAME_TARGET_NOTE, stringName: STRING_NAMES[s], timeMs: elapsed });
        cell.style.backgroundColor = '#6c6';
        setTimeout(function() { cell.style.backgroundColor = ''; nextChallenge(); }, 300);
    } else {
        GAME_WRONG++;
        var key = GAME_TARGET_NOTE + '|' + STRING_NAMES[GAME_TARGET_STRING];
        var existing = GAME_MISTAKES.find(function(m) { return m.key === key; });
        if (existing) {
            existing.count++;
        } else {
            GAME_MISTAKES.push({ key: key, note: GAME_TARGET_NOTE, stringName: STRING_NAMES[GAME_TARGET_STRING], count: 1 });
        }
        cell.style.backgroundColor = '#e66';
        setTimeout(function() { cell.style.backgroundColor = ''; }, 300);
    }
    updateGameScore();
}

function updateGameScore() {
    document.getElementById('game-score').textContent =
        '✓ ' + GAME_CORRECT + '   ✗ ' + GAME_WRONG;
}

function endGame() {
    stopGame();
    document.getElementById('game-timer').textContent = '0:00';
    var total = GAME_CORRECT + GAME_WRONG;
    var pct = total > 0 ? Math.round(100 * GAME_CORRECT / total) : 0;
    var slowest = GAME_COMPLETED
        .slice().sort(function(a, b) { return b.timeMs - a.timeMs; })
        .slice(0, 3);
    var html = '<strong>Game Over!</strong><br>';
    html += '✓ ' + GAME_CORRECT + ' correct &nbsp; ✗ ' + GAME_WRONG + ' wrong &nbsp; (' + pct + '% accuracy)<br>';
    if (slowest.length) {
        html += '<br><em>Slowest correct answers:</em><ul>';
        slowest.forEach(function(r) {
            html += '<li>' + r.note + ' on ' + r.stringName + ' string — ' +
                (r.timeMs / 1000).toFixed(1) + 's</li>';
        });
        html += '</ul>';
    }
    if (GAME_MISTAKES.length) {
        var sortedMistakes = GAME_MISTAKES.slice().sort(function(a, b) { return b.count - a.count; });
        html += '<br><em>Mistakes:</em><ul>';
        sortedMistakes.forEach(function(m) {
            html += '<li>' + m.note + ' on ' + m.stringName + ' string' +
                (m.count > 1 ? ' — ' + m.count + '×' : '') + '</li>';
        });
        html += '</ul>';
    }
    var resultsEl = document.getElementById('game-results');
    resultsEl.innerHTML = html;
    resultsEl.style.display = '';
    document.getElementById('game-start-btn').textContent = 'Play Again';
}

function startNameGame() {
    NAME_RUNNING = true;
    NAME_CORRECT = 0; NAME_WRONG = 0;
    NAME_COMPLETED = []; NAME_MISTAKES = [];
    NAME_SECONDS_LEFT = 60;
    document.getElementById('name-results').style.display = 'none';
    document.getElementById('name-start-btn').textContent = 'Stop';
    updateNameScore();
    nextNameChallenge();
    NAME_TIMER_ID = setInterval(function() {
        NAME_SECONDS_LEFT--;
        var m = Math.floor(NAME_SECONDS_LEFT / 60);
        var s = NAME_SECONDS_LEFT % 60;
        var timerEl = document.getElementById('name-timer');
        timerEl.textContent = m + ':' + (s < 10 ? '0' : '') + s;
        timerEl.classList.toggle('urgent', NAME_SECONDS_LEFT <= 10);
        if (NAME_SECONDS_LEFT <= 0) endNameGame();
    }, 1000);
}

function stopNameGame() {
    if (NAME_TIMER_ID) { clearInterval(NAME_TIMER_ID); NAME_TIMER_ID = null; }
    NAME_RUNNING = false;
    highlightTargetCell(-1, -1);
    document.getElementById('name-timer').textContent = '1:00';
    document.getElementById('name-start-btn').textContent = 'Start';
}

function nextNameChallenge() {
    NAME_TARGET_STRING = Math.floor(Math.random() * 6);
    NAME_TARGET_FRET = Math.floor(Math.random() * NUM_FRETS);
    NAME_TARGET_NOTE = getNoteName(NAME_TARGET_STRING, NAME_TARGET_FRET);
    NAME_CHALLENGE_START = Date.now();
    highlightTargetCell(NAME_TARGET_STRING, NAME_TARGET_FRET);
    document.getElementById('name-string-label').textContent =
        'on the ' + STRING_NAMES[NAME_TARGET_STRING] + ' string';
}

function handleNameKeyClick(note) {
    if (!NAME_RUNNING) return;
    var btn = document.querySelector('.piano-key[data-note="' + note + '"]');
    if (note === NAME_TARGET_NOTE) {
        var elapsed = Date.now() - NAME_CHALLENGE_START;
        NAME_CORRECT++;
        NAME_COMPLETED.push({ note: NAME_TARGET_NOTE, stringName: STRING_NAMES[NAME_TARGET_STRING], fret: NAME_TARGET_FRET, timeMs: elapsed });
        if (btn) { btn.classList.add('correct-flash'); setTimeout(function() { btn.classList.remove('correct-flash'); }, 300); }
        setTimeout(nextNameChallenge, 300);
    } else {
        NAME_WRONG++;
        var key = NAME_TARGET_NOTE + '|' + STRING_NAMES[NAME_TARGET_STRING];
        var existing = NAME_MISTAKES.find(function(m) { return m.key === key; });
        if (existing) { existing.count++; }
        else { NAME_MISTAKES.push({ key: key, note: NAME_TARGET_NOTE, stringName: STRING_NAMES[NAME_TARGET_STRING], count: 1 }); }
        if (btn) { btn.classList.add('wrong-flash'); setTimeout(function() { btn.classList.remove('wrong-flash'); }, 300); }
    }
    updateNameScore();
}

function updateNameScore() {
    document.getElementById('name-score').textContent = '✓ ' + NAME_CORRECT + '   ✗ ' + NAME_WRONG;
}

function endNameGame() {
    stopNameGame();
    document.getElementById('name-timer').textContent = '0:00';
    var total = NAME_CORRECT + NAME_WRONG;
    var pct = total > 0 ? Math.round(100 * NAME_CORRECT / total) : 0;
    var slowest = NAME_COMPLETED.slice().sort(function(a, b) { return b.timeMs - a.timeMs; }).slice(0, 3);
    var html = '<strong>Game Over!</strong><br>';
    html += '✓ ' + NAME_CORRECT + ' correct &nbsp; ✗ ' + NAME_WRONG + ' wrong &nbsp; (' + pct + '% accuracy)<br>';
    if (slowest.length) {
        html += '<br><em>Slowest correct answers:</em><ul>';
        slowest.forEach(function(r) { html += '<li>' + r.note + ' on ' + r.stringName + ' string — ' + (r.timeMs / 1000).toFixed(1) + 's</li>'; });
        html += '</ul>';
    }
    if (NAME_MISTAKES.length) {
        var sorted = NAME_MISTAKES.slice().sort(function(a, b) { return b.count - a.count; });
        html += '<br><em>Mistakes:</em><ul>';
        sorted.forEach(function(m) { html += '<li>' + m.note + ' on ' + m.stringName + ' string' + (m.count > 1 ? ' — ' + m.count + '\xd7' : '') + '</li>'; });
        html += '</ul>';
    }
    var resultsEl = document.getElementById('name-results');
    resultsEl.innerHTML = html;
    resultsEl.style.display = '';
    document.getElementById('name-start-btn').textContent = 'Play Again';
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
	    document.getElementById('tool-row').style.display = 'none';
	    document.getElementById('share-controls').style.display = 'none';
	    document.getElementById('checkanswer').style.display = 'inline';
	} else {
	    fill_from_repr(url_params['strings']);
	}
    }
}
var NUM_FRETS = getLayoutParams().numFrets;
var computeFretWidths = function() {
    var ratio = Math.pow(2, -1/12);
    var numActualFrets = NUM_FRETS - 1;
    var sumRatios = (1 - Math.pow(ratio, numActualFrets)) / (1 - ratio);
    var lastFretRatio = Math.pow(ratio, numActualFrets - 1);
    var totalWidth = document.documentElement.clientWidth - 22;
    var firstWidth = totalWidth / (sumRatios + lastFretRatio);
    var openStringWidth = Math.round(firstWidth * lastFretRatio);
    var fretWidths = calculateFretWidths(numActualFrets, firstWidth);
    var allWidths = [openStringWidth].concat(fretWidths);
    var roundingError = allWidths.reduce(function(a, b) { return a + b; }, 0) - totalWidth;
    allWidths[allWidths.length - 1] -= roundingError;
    return allWidths;
};
var updateFretboardWidth = function() {
    var cols = computeFretWidths().map(function(w) { return w + 'px'; }).join(' ');
    document.getElementById('fretboard').style.gridTemplateColumns = cols;
};
document.addEventListener('DOMContentLoaded', function() {
    var fretWidths = computeFretWidths();
    document.getElementById('main').insertAdjacentHTML('beforeend', gen_fretboard(NUM_FRETS, 6, fretWidths));
    GUITAR_STRINGS = getFretboardStrings(NUM_FRETS, 6);
    set_notes();

    var rebuildFretboard = function() {
        var newParams = getLayoutParams();
        if (newParams.numFrets === NUM_FRETS) {
            updateFretboardWidth();
            return;
        }
        var savedRepr = uri_diagram_repr(GUITAR_STRINGS);
        NUM_FRETS = newParams.numFrets;
        CELL_HEIGHT = newParams.cellHeight;
        var old = document.getElementById('fretboard');
        if (old) old.remove();
        var fretWidths = computeFretWidths();
        document.getElementById('main').insertAdjacentHTML('beforeend', gen_fretboard(NUM_FRETS, 6, fretWidths));
        GUITAR_STRINGS = getFretboardStrings(NUM_FRETS, 6);
        set_notes();
        document.querySelectorAll('#fretboard .fretboard-cell').forEach(function(td) {
            td.addEventListener('click', update_link);
        });
        if (savedRepr) fill_from_repr(savedRepr);
        update_link();
    };

    var resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(rebuildFretboard, 50);
    });

    // Examples:
    // show diagram of a C Major chord
    //show_chord([null, 1, null, 2, [3, 'red']]);

    //var a_minor_penta = [[5, 8], [5, 8], [5, 7], [5, 7], [5, 7], [5, 8]];
    // show diagram of an A minor penta scale form
    //show_scale(a_minor_penta);
    document.querySelectorAll('.mode-tab').forEach(function(btn) {
        btn.addEventListener('click', function() { switchMode(this.dataset.mode); });
    });
    document.getElementById('game-start-btn').addEventListener('click', function() {
        if (GAME_RUNNING) stopGame();
        else startGame();
    });
    document.querySelectorAll('.piano-key').forEach(function(btn) {
        btn.addEventListener('click', function() { handleNameKeyClick(this.dataset.note); });
    });
    document.getElementById('name-start-btn').addEventListener('click', function() {
        if (NAME_RUNNING) stopNameGame();
        else startNameGame();
    });

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
	    message.innerHTML = '<b>Eraser activated!</b><br /><sub>Tap/click marks to erase them</sub>';
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

    document.getElementById('linkthis').addEventListener('click', function(e) {
        e.preventDefault();
        copyToClipboard(this, create_link_from_fretboard());
    });
    document.getElementById('linkquiz').addEventListener('click', function(e) {
        e.preventDefault();
        copyToClipboard(this, create_link_from_fretboard() + '&q=y');
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

    var savedTheme = localStorage.getItem('fretboard-theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('theme-toggle').textContent = '☀';
    }
    document.getElementById('theme-toggle').addEventListener('click', function() {
        var isDark = document.body.classList.toggle('dark-theme');
        this.textContent = isDark ? '☀' : '☾';
        localStorage.setItem('fretboard-theme', isDark ? 'dark' : 'light');
    });
});
