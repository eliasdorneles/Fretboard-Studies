/* code to handle manipulation */

// OVERVIEW:
// Hopefully this outline will give direction.  I tried following some OOP and MCV principles best I could
// with Javascript. The Models, controllers and such are not discreetly encapsulated; just a 'road-map'.
// There are now basically three 'model-controller-views' to be aware of and an 'uber-model'
// Perhaps uber-model would be better encapsulated in a Panel Model, in any case, it
//  is just capitalized vars holding states.
//
// The Fretboard MCV paints the Fretboard at the top of the UI.
// The FretboardModel tracks how to paints notes with appropriate text based on:
// -color by interval vs color by pallete
// -text of interval or text of note-name
// -interval color is governed by KEY
//
// Below the fretboard are grey buttons (fretpainters) which paint or erase all notes in that fret
//
// The UI buttons below the fretboard change these states.
// When 'brush' is 'on' moused-Over notes are painted according to state
// When 'eraser' is 'on' moused-Over notes are erased according to state
// Clicking set root button turns on until a fret note is chosen, then turns off
// The interval and color buttons select the color and text mode for painted notes
// the color button opens a color pallete which sets color for newly painted notes
// The Key pulldown is an alternative to set root button,
// 		sets key in uber model and recolors/renames painted notes if required
//
// The div to the left under the UI buttons is the 'Dictionary' for 'unabridged' notegroups -- scales, arpeggios, etc.
// Tabbing allows collections of notegroups sorted by key, etc.
// The colored divs are buttons serving as "notegroup" objects.
// Clicking a notegroup recolors/renames the painted fret notes
//     and changes states governing how new notes will be painted in the Uber-Model/FretboardModel
// The unabridged notegroups can be dragged to the "dashboard" to the right on the UI.
// At this point notegroups are "abridged" notegroups and are added to the PlayerModel
//
// The PlayerModel governs the playable dashboard to the right of the unabridged notegroup dictionary
// The abridged notegroups can be rearranged and deleted with a double click.
// Single-click of abridged notegroups repaints the fretboard like unabridged notegroups.
// The play button cycles through the abridged notegroups in the dashboard, repainting the FB accordingly
//
// Also in the 'panel' below the fretboard are links and quizzes.
//
// A link provides an html link with a snapshot of the app.  Anytime the dashboard player or Fretboard is changed,
// a new link must be created with update_link
//
// The quiz link creates the same snapshot, except the painted notes are not painted, but stored as answers.
// When a quiz link is used, the user paints the notes and the "check answer" button (only available in this instance)
//   will color the user's painted notes as good or bad (red)
//
// The 'New Interval Quiz' will randomly paint a new interval for the user to gues the relationship.

// constants
//

var CHECKANSWER = 'Check Answer!';
var GTR_FRETS = 19;
var GTR_STRINGS = 6;
var GUITAR_STRINGS; // will be array of strings
var INTERVAL_COLORS = [
	"i_root",
	"i_flatnine",
	"i_nine",
	"i_flatthird",
	"i_third",
	"i_fourth",
	"i_flatfifth",
	"i_fifth",
	"i_flatsixth",
	"i_sixth",
	"i_flatseventh",
	"i_seventh",
	"i_passing",
	"white",
	"black"
	]

var PALLETE_COLORS = [
	"orange",
	"green",
	"blue",
	"yellow",
	"lightgreen",
	"red",
	"transparent"
	]

var POSSIBLE_COLORS = INTERVAL_COLORS.concat(PALLETE_COLORS);// concat  interval and pallete colors

// ###################
// UBER-MODEL STATES
// The capitalized vars below represent the 'Uber-Model' governing entire app
// generally a collection of 'states'
// ideally these should be cordoned off in a discreet model, but all other models need access to these states
// States include Key, color mode, eraser on, brush on, etc

var ERASER = false; // state of erase mode is on
var BRUSH = false; // state of brush mode is on
var SETTINGROOT = false; // state of setting the root with set root button
var ST_QUIZZING_INTERVAL = "QUIZZING_INTERVAL"// Random Interval Quiz is underway
var ST_QUIZZING_RANDOMROOT ="QUIZZING_RANDOMROOT" // Random Root Quiz is underway
var ST_QUIZZING_URL = "QUIZZING_URL" // URL Quiz is underway
var ST_QUIZZING_NONE ="QUIZZING_NONE" // no quizzes underway
var QUIZZING = ST_QUIZZING_NONE // state where interval quiz is awaiting check answer
var CHECKING_URL_QUIZ = false // state where URL quiz is awaiting check answer, check answer button is visible
var INTERVALMODE = false; // state of paint intervals as opposed to note-names
var COLORBYINTERVALS = false; // state of color scheme according to interval vs. pallate selection
var COLOR = "lightgreen"; // current pallete color for painting new notes

var KEY = 0; // current key to inform painted note text, values

// fretboard model to hold states
var mFB = FretboardModel;

// player model to hold states for player -- 'playable' user-selected dashboard of notegroups to paint fretboard with
// holds the 'abridged' notegroup div objects
var mPlayer = PlayerModel;

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
var td_paint = function(td, newColor){
	var color = arguments.length > 1 ? arguments[1] : "lightgreen";
	var td = $(td);
	td.removeClass(POSSIBLE_COLORS.join(" "));
	td.addClass(color);
}

var td_clear = function(td){
    td_paint(td, 'transparent');
}

var is_painted = function(td){
	var isPainted = !$(td).hasClass('transparent');
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

// get the notegroups in dashboard for url params for link
var getArrNotegroupsInDash = function(){
		var str =""
		var dash = $('#ngDashboard').children(".cNoteGroup");
		if (dash.length > 0){
			for (var i = 0; i < dash.length; i++)
			{
				str += $(dash[i]).attr("notegroup") +",";
			}
		}
		str = str.replace(/,+$/, ""); // eliminate last comma
		return str;
	}

	//generate URL based on snapshot of fretboard and dashboard player
var create_link_from_fretboard = function(){
    var href = window.location.href;
    if (href.indexOf('#') > 0){
	href = href.substring(0, href.indexOf('#'));
    }
    href += '#';
    href += "strings=" + uri_diagram_repr(GUITAR_STRINGS);
	href += "&key="+mFB.getKeyObj().safename;
	href +="&ng="+mFB.getNotegroup().varname;
	href += "&intColor="+COLORBYINTERVALS;
	href += "&intNames="+INTERVALMODE;
    href += "&diagram_title=" + escape($('#diagram_title').val());
	var dashGroups = getArrNotegroupsInDash();
	if(dashGroups != ""){
		href += "&dash="+dashGroups;
	}
    return href;
}

// update link should be called whenever view changes
var update_link = function(){
	    $('#linkthis').attr('href', create_link_from_fretboard());
	    $('#linkquiz').attr('href', create_link_from_fretboard() + "&q=y");
}

// handler to get url parameters
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

// paint fretboard based on URL params for strings/frets
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
var td_paint_or_clear = function(td){
    var td = $(td);
    if (!td.hasClass('transparent') && (td.hasClass(COLOR) || COLORBYINTERVALS )){
		// make transparent
		td.removeClass(POSSIBLE_COLORS.join(" "));
		td.addClass('transparent');
    } else {
		// repaint colored td
		if(COLORBYINTERVALS)
		{
			var arrStringFret = getStringFret(td);
			ctl_color_td_by_interval(arrStringFret[0],arrStringFret[1]);
		}
		else
		{
			// repaint with new pallete color
			td_paint(td, COLOR );
		}
    }

}

var getFretcloneStrings = function(){
    var board_strings = $('#fretclone tr');
    var guitarStrings = [[], [], [], [], [], []];
    for (var i = 0; i < board_strings.length; i++){
		var children = board_strings[i].children;
		for (var j = 0; j < children.length; j++){
		    // fretnote object
			var box = {
				td: children[j],
				paint: function(){
					if(SETTINGROOT){
						// todo fix this
						SETTINGROOT = false;
						updateSetRootView();
						var newNote = $(this).attr('notename');
						// get safeName from note
						ctl_change_key.setRoot(getKeyObjFromNoteName(newNote));
						td_clear(this);// will paint after
						//var newKey = $("#selKey").val(getChromaticInt(newNote, CHROMFLAT));
					}
				    td_paint_or_clear(this, COLOR);
				},
		    }
		    guitarStrings[i].push(box);
		    $(children[j]).click(box.paint);

		    // eraser:
		    $(children[j]).mouseover(function(){
		    	if (ERASER == true){
	    			td_clear(this);
					update_link();
	    		} else if (BRUSH == true){
					if(COLORBYINTERVALS){
						var arr = (this.id).split('_');
						ctl_color_td_by_interval(arr[1], arr[2]);
						update_link();
					} else {
						td_paint(this, COLOR); // current palette color
						update_link();
					}
				}
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
				    var color = is_painted(GUITAR_STRINGS[i][j].td) ? "lightgreen" : "orange";
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
			if(QUIZZING == ST_QUIZZING_INTERVAL){
				ctl_updateQuizzing(ST_QUIZZING_NONE);
			}
	ctrl_updateMessage();
}
var pick_note = function(position, offset){
	if(typeof(offset)==='undefined') offset=0; // defaults to E
	if(typeof(position)==='undefined') position=4; // defaults to E
	return mFB.getChromNames()[(position + offset) % mFB.getChromNames().length];
}
var set_notes = function(){
	var offsets = [4, 11, 7, 2, 9, 4];
	for(var i = 0; i < GUITAR_STRINGS.length; i++){
		for(var j = 0; j < GUITAR_STRINGS[i].length; j++){
			var note_td = $(GUITAR_STRINGS[i][j].td);
			var notespan = $(GUITAR_STRINGS[i][j].td).find('.note');
			var note = pick_note(j, offsets[i]);

			notespan.attr('id','ns_'+i+'_'+j );// ns_(string)_(fret)
			note_td.attr('id','nc_'+i+'_'+j );
			notespan.attr('notename', note );
			note_td.attr('notename', note );
			notespan.html($('#'+'ns_'+i+'_'+j).attr('notename'));
			var chromFromC = (j + offsets[i]) % mFB.getChromNames().length;
			note_td.attr('semiInts', chromFromC );
			notespan.attr('semiInts', chromFromC );

		}
	}
}


var set_notespans = function(){

	var offsets = [4, 11, 7, 2, 9, 4];
	for(var i = 0; i < GUITAR_STRINGS.length; i++){
		for(var j = 0; j < GUITAR_STRINGS[i].length; j++){
			var ns = $('#'+'ns_'+i+'_'+j);
			ns.attr('id','ns_'+i+'_'+j );// ns_(string)_(fret)
			var note = ns.attr('notename');

			var arrLen = mFB.getNGintnames().length;
			var nsSemiInt = ((mFB.getNGintnames().length + Number(ns.attr("semiInts"))) - mFB.getKeyInt()) % mFB.getNGintnames().length;

			if(INTERVALMODE)
			{
				if (nsSemiInt == 0){
					ns.html(mFB.getChromNames()[0]);
				}
				else
				{
					ns.html(mFB.getNGintnames()[nsSemiInt]);
				}

			}
			else
			{
				ns.html(mFB.getChromNames()[nsSemiInt]);
			}

			var isPainted = is_painted($('#nc_'+i+'_'+j));
			if(COLORBYINTERVALS && is_painted($('#nc_'+i+'_'+j)) )
			{

				ctl_color_td_by_interval(i,j); //send string, fret
			}
		}
	}
	ctrl_updateMessage();

}

// ##############
// controllers -- these should be used for broadest functionality to ensure model updates,
// should be point-of-entry for bindings of UI buttons
var ctrl_updateMessage = function(){
		if(COLORBYINTERVALS){
		var msg = "Painting notes for <strong>"+mFB.getKeyTextName();
		// update link url
		if(mFB.getNotegroupDict() != dictArps){msg += " ";}
		msg += mFB.getNotegroup().name+"</strong>";
		$('#message').html(msg);
		} else{
			if(CHECKING_URL_QUIZ){
				// if URL Quiz underway, put message to choose correct answers and check
				$('#message').html('<span style="color:red">Click notes to answer quiz, the press "Check Quiz Answer!"</style>');
			} else {
				$('#message').html("");
			}
		}
	}

var ctl_updateIntervalMode = function(isIntervalMode){

		if(isIntervalMode){
			$('#modeNoteInt').attr('value', 'Notes');
			INTERVALMODE = true;
			set_notespans();
			update_link();
		} else {
			$('#modeNoteInt').attr('value', 'Intervals');
			INTERVALMODE = false;
			set_notespans();
			update_link();
		}

		if(QUIZZING==ST_QUIZZING_RANDOMROOT || QUIZZING == ST_QUIZZING_INTERVAL){
				ctl_updateQuizzing(ST_QUIZZING_NONE);
		}
	}

var ctl_populateDash = function(str){
		var nGroups = str.split(",");
		for(var i=0	; i < nGroups.length; i++){
			ctrl_addDashNotegroups(nGroups[i]);
		}
	}

// add a notegroup to dashboard, governed by player model, the abridged, user-selected dashboard of notegroups
var ctrl_addDashNotegroups = function(idStr){
			var arrID = idStr.split('_');
			var key = arrID[0];
			var ngType = arrID[1];
			var ng = arrID[2]; // notegroup
			var htmlTxt = getKeyObjFromSafeName(arrID[0]).name;

			var ngBoxClrClass;

			switch(ngType){
				case "ARP":
					htmlTxt += dictArps[ngType+'_'+ng].name;
					ngBoxClrClass="ngboxArp";
					break;
				case "SC":
					htmlTxt += ' '+dictScales[ngType+'_'+ng].name;
					ngBoxClrClass="ngboxScale";
					break;
				case "CHD":
					htmlTxt += ' '+dictChords[ngType+'_'+ng].name;
					ngBoxClrClass="ngboxChd";
					break;
			}
			var $abDiv = $("<div>", {class: "cNoteGroup "+ngBoxClrClass, notegroup: idStr}).html(htmlTxt);
			$abDiv.dblclick(
					// remove abridgedDiv on doubleclick
					function(){
					  ctl_stopPlayer();
					  $(this).remove();
					  //update_link();
					}
				).click(
					// set notegroups on abridged Div click
				   function(){
					//var abDivArrID = this.attributes["notegroup"].value.split('_');
					set_notes_per_notegroup(arrID[0], arrID[1], arrID[2]);
					//update_link();
				   }
				);

			if(mPlayer.getPlaystate() == PS_PLAYING){
				ctl_stopPlayer();
			}

			$("#ngDashboard").append($abDiv); // add dragged notegroup to Dashboard
			$("#ngDashboard").sortable({
			stop: function( event, ui ) {
					mPlayer.reloadNotegroups($("#ngDashboard"));
					update_link();
				},
			start: function( event, ui ) {
					ctl_stopPlayer();
				}
			});
			mPlayer.reloadNotegroups($("#ngDashboard"));
			update_link();

	}
var ctl_updateColorIntMode = function(boolNewMode){
		if(boolNewMode){
			COLORBYINTERVALS = true;
			$('#colorByInterval').attr('value', 'Pallete Color' );
			// hide color pallete
			$('#colorchooser').hide();
			set_notespans();
			update_link();
		} else{
			COLORBYINTERVALS = false;
			$('#colorByInterval').attr('value', 'Color Intervals' );
			// hide color pallete
			$('#colorchooser').show();
			set_notespans();
			update_link();
		}
	}

var ctl_color_td_by_interval = function(string, fret){
		var nsSemiInt = ((mFB.getNGintnames().length + Number($('#ns_'+string+'_'+fret).attr("semiInts"))) - mFB.getKeyInt()) % mFB.getNGintnames().length;
		var newColor = mFB.getNGintcolor()[Number(nsSemiInt)]; // need to be a number?
		td_paint($('#nc_'+string+'_'+fret), newColor );
	}

var ctl_change_key = {
	"setRoot" : function(kObj){
			mFB.setKey(kObj);
			if($("#selKey").val() != kObj.safename){
				$("#selKey").val(kObj.safename);
			}
			set_notespans();
		},
	"keyChangeNotegroup" : function(kSafeName){
			mFB.setKey(dictKeys[kSafeName]);
			var selKeyVal = $("#selKey").val();
			if(selKeyVal != kSafeName){
				$("#selKey").val(kSafeName);
			}
		},
	"selKeyChange" : function(selKeyVal){

			mFB.setKey(dictKeys[selKeyVal]);
			set_notespans();
			update_link();
		}

	}

var ctl_updateQuizzing = function(stQuizzing){
		QUIZZING = stQuizzing;
		// actions from change in QUIZZING state from clicking Random Interval on UI
		switch(stQuizzing){
				case ST_QUIZZING_INTERVAL:
					ctl_newIntQuiz();
					// redo button text
					$("#intervalQuiz").attr('value', CHECKANSWER );
					break;
				case ST_QUIZZING_URL:
					$('#colorchooser').hide();
					$('#checkanswer').show();
					break;
				case ST_QUIZZING_RANDOMROOT:
					ctl_newRandRoot();
					break;
				case ST_QUIZZING_NONE:
					$("#intervalQuiz").attr('value','Random Interval');
					$("#randomRootQuiz").attr('value', 'Random Root' );
					//hide URL quiz answer check
					$("#checkanswer").hide();
					break;
				default:
					// bad state given
					break;
		}
		if(stQuizzing){

		}else{
				// redo button text

		}
	}
var ctl_newIntQuiz = function(){
	// clear FB
	clear_fretboard();
	// set IntervalMode state to false and ColorByIntervals to False
	//COLORBYINTERVALS = false;
	INTERVALMODE = false;
	var lowFret = mPref.aPrefs.riq_LoFret;
	var highFret = mPref.aPrefs.riq_HiFret;
	var rngFrets = mPref.aPrefs.riq_FretDepth;
	var rngStr = mPref.aPrefs.riq_StrDepth;// the range of frets from root can be set here
	var rngLo =1;
	var rngHi =1;
	// get two randmon notes on FB
	var rootString = Math.floor((Math.random() * GUITAR_STRINGS.length) );
	var intString = Math.floor((Math.random() * GUITAR_STRINGS.length) );
	var rootFret =randomIntFromInterval(lowFret, highFret);

	var strMin;
	var strMax;

	while(Math.abs(intString - rootString) > rngStr ){
		intString = randomIntFromInterval(0, GUITAR_STRINGS.length);
	}

	var intFretMin;
	var intFretMax;
	(rootFret - rngFrets < lowFret)?intFretMin = lowFret:intFretMin = rootFret - rngFrets;
	(rootFret + rngFrets > highFret)?intFretMax = highFret:intFretMax = rootFret + rngFrets;
	intFret = randomIntFromInterval(intFretMin, intFretMax);

	while ((intString == rootString && rootFret == intFret) || (intFret < lowFret) || (intFret > highFret)){
		intFret = randomIntFromInterval(intFretMin, intFretMax);
	}



	// while (!(intFret >= lowFret && intFret <= highFret && rootFret != intFret) ){
	// 		intFret =  Math.floor(Math.random() * highFret +1 )  ;
	// 		if(intFret - rngFrets < rootFret || intFret + rngFrets > rootFret ){
	// 			// out of range; invalid
	// 			intFret = -1;
	// 		}
	// }

	// while (!((Math.abs(intStr - rootString)) <= rngStr )){
	// 	var rootString = Math.floor((Math.random() * GUITAR_STRINGS.length) );
	// 	var intString= Math.floor((Math.random() * GUITAR_STRINGS.length) );
	// }

	// get safeName from note
	var newRootNoteName = $('#'+'ns_'+rootString+'_'+rootFret).attr('notename');

	ctl_change_key.setRoot(getKeyObjFromNoteName(newRootNoteName));
		// remove text in notecontainer's notespan, setting interval will return text
	$('#'+'ns_'+rootString+'_'+rootFret).text('R');
	td_paint('#'+'nc_'+rootString+'_'+rootFret, "red");

	$('#'+'ns_'+intString+'_'+intFret).text(' ');
	td_paint('#'+'nc_'+intString+'_'+intFret, "lightgreen");

}

var ctl_newRandRoot = function(){
		clear_fretboard();
		// random string, fret according to mPrefs
		var lowFret = mPref.aPrefs.rrq_LoFret;
		var highFret = mPref.aPrefs.rrq_HiFret;
		var lowString = mPref.aPrefs.rrq_LoStr -1;
		var highString = mPref.aPrefs.rrq_HiStr -1;
		var stringFret= [-1, -1];// random string/fret
		while(!(stringFret[0] >= lowString && stringFret[0] <= highString)){
			stringFret[0] = Math.floor((Math.random() * GUITAR_STRINGS.length) );// string
		}
		while (!(stringFret[1] >= lowFret && stringFret[1] <= highFret)){
			stringFret[1] =  Math.floor(Math.random() * highFret );
		}
		td_paint('#'+'nc_'+stringFret[0]+'_'+stringFret[1], "red");
		var sKey = getKeyObjFromNoteName($('#'+'nc_'+stringFret[0]+'_'+stringFret[1]).attr('notename')).safename;

		// get random dictionary notegroup key that is in user preferences
		checkedNG =[];// notegroups checked in preferences
		for(ng in mPref.aPrefs.rrq_Notegroups){
			if(mPref.aPrefs.rrq_Notegroups[ng][1]){
				checkedNG.push(mPref.aPrefs.rrq_Notegroups[ng][0]);
			}
		}
		var arrNg =  checkedNG[Math.floor((Math.random() * checkedNG.length))].split('_');
		set_notes_per_notegroup(sKey, arrNg[0] , arrNg[1])
}

	// check boxes according to Pref model
var	ctl_updateRRQnotegroupsToPrefModel = function(){
		for (var ng in mPref.aPrefs.rrq_Notegroups){
		//0: scale name, 1: t/f checked in prefs
		if(mPref.aPrefs.rrq_Notegroups[ng][1]){
		// control eg 'prefRRQ_SC_DORIAN'
			$('#prefRRQ_'+mPref.aPrefs.rrq_Notegroups[ng][0]).prop('checked', true);
		}else{
			$('#prefRRQ_'+mPref.aPrefs.rrq_Notegroups[ng][0]).prop('checked', false);
		}
	}
};

var ctl_setPrefFormToPrefModel = function(){

	$( "#spRIQ_LoFret" ).spinner("value",mPref.aPrefs.riq_LoFret);
	$( "#spRIQ_HiFret" ).spinner("value",mPref.aPrefs.riq_HiFret);
	$( "#spRIQ_StrDepth" ).spinner("value",mPref.aPrefs.riq_StrDepth);
	$( "#spRIQ_FretDepth" ).spinner("value",mPref.aPrefs.riq_FretDepth);

	$( "#spRR_LoFret" ).spinner("value",mPref.aPrefs.rrq_LoFret);
	$( "#spRR_HiFret" ).spinner("value",mPref.aPrefs.rrq_HiFret);
	$( "#spRR_LoStr" ).spinner("value",mPref.aPrefs.rrq_LoStr);
	$( "#spRR_HiStr" ).spinner("value",mPref.aPrefs.rrq_HiStr);
	ctl_updateRRQnotegroupsToPrefModel();


}
	 	//when dialog is closed, update the Pref model with data in popup form controls
var ctl_updatePrefs = function(){
		//RandomRootQuiz
		mPref.rrq_LoFret = $("#spRR_LoFret").spinner( "value" );
		mPref.rrq_HiFret = $("#spRR_HiFret").spinner( "value" );
		mPref.writePrefCookie();

};
	// returns preferences to defaults and rewrites cookie
var ctl_resetDefaultPrefs = function(){
	mPref.removePrefCookie();
	//var testRemoveCookie = fs_userPrefs =(this.is_chrome)?$.localStorage('fs_userPrefs'):$.cookie('fs_userPrefs');
	mPref.init(dictScales, GUITAR_STRINGS[0].length, GUITAR_STRINGS.length); // should set initialized prefs
	mPref.checkAllNotegroups();
	ctl_setPrefFormToPrefModel();
	//ctl_updateRRQprefView();
	mPref.writePrefCookie();

}

// more utilities
//
//
var get_random_stringFret = function(){
		var lowFret = 0;
		var highFret = GUITAR_STRINGS[0].length;
		var stringFret= [-1, -1];
		stringFret[0] = Math.floor((Math.random() * GUITAR_STRINGS.length) );// string
	while (!(stringFret[1] >= lowFret && stringFret[1] <= highFret)){
		stringFret[1] =  Math.floor(Math.random() * highFret );
	}
	return stringFret;
}

var get_random_scale_notegroup_key = function(){
	var scaleKeys = Object.keys(dictScales);
  var rndKey = Math.floor((Math.random() * scaleKeys.length) );
	//var scale = dictScales[scaleKeys[rndKey]];
	//var sc =dictScales[Math.floor((Math.random() * dictScales.length) )];
	return scaleKeys[rndKey];

}

var set_notes_per_notegroup = function(keySafeName, ngType, ng){
			// if color by intervals is off, turn on and save state
			var paletteState = !COLORBYINTERVALS;
			COLORBYINTERVALS = true;
			ctl_change_key.keyChangeNotegroup(keySafeName);
			var ng = ngType+'_'+ng;
			mFB.setNotegroup(ng);
			set_notespans();
			ctl_updateQuizzing(ST_QUIZZING_NONE);
			COLORBYINTERVALS = !paletteState; // keep pallete if open
}

var isPalleteColor = function(c){
		for(var pc in PALLETE_COLORS){
			if (c == pc) return true;
		}
		return false;
	}

// get step integer in a scale
var getChromaticInt = function(noteStr, chromNamesScale){

	if(chromNamesScale == null){
		chromNamesScale = mFB.getChromNames();
	}
	for(var i = 0; i < chromNamesScale.length; i++){
		if (noteStr == chromNamesScale[i])
		return i;
	}
}


// return safename enharmonic
var getEnharmonic = function(noteStr){
	// make sure more than 1 chars
	if(noteStr.length > 1){
		getAccTypeStr(noteStr)
		switch(getAccTypeStr(noteStr)) {
			case FLATTED:
				//flat
				enStr = acc[0]+"&#9837;";
				noteStr = CHROMSHARP[getChromaticInt(enStr,CHROMFLAT)];
				break;
			case SHARPED:
				//sharp
				enStr = acc[0]+"&#9839;";
				noteStr = CHROMFLAT[getChromaticInt(enStr,CHROMSHARP)];
				break;
			default:
				//natural
				noteStr = noteStr.charAt(0);
		}
	}


	return noteStr;

}

var getAccTypeStr = function(noteStr){
	var accType;
	var acc = escape(noteStr).split('%');
		switch(acc[1]) {
			case 'u266D':
				//flat
				accType = FLATTED;
				break;
			case 'u266F':
				//sharp
				accType = SHARPED;
				break;
			default:
				//natural
				accType= NATURAL;
		}

	return accType;
}

var getKeyObjFromNoteName = function(noteStr){
		var intFromC = getKeyObjFromUnsafeName(noteStr).fromC
		var newKeyHtmlName = mFB.getKeyObj().baseScale[intFromC];
		return  getKeyObjFromUnsafeName(newKeyHtmlName);
	}

// safename eplicitly spells flat, natural or sharp with root
var getSafeNameFromNoteName = function(noteStr){
		var intFromC = getKeyObjFromUnsafeName(noteStr).fromC
		var newKeyHtmlName = mFB.getKeyObj().baseScale[intFromC];
		return  getKeyObjFromUnsafeName(newKeyHtmlName).safename;
	}

// keyObj is a key object with various names, steps from C
var getKeyObjFromSafeName = function(safenameStr){
		var keyObj = "";
		for(ko in dictKeys){
			if (safenameStr == dictKeys[ko].safename){
				keyObj = dictKeys[ko];
				break;
			}
		}
		return keyObj;
	}

var getKeyObjFromUnsafeName = function(htmlStr){
		var keyObj = "";
		for(ko in dictKeys){
			if (htmlStr == dictKeys[ko].name){
				keyObj = dictKeys[ko];
				break;
			}
		}

		if(keyObj == ""){
			// likely a sharp key that needs to be a flat key = get Enharmonic
			for(var i = 0; i < CHROMSHARP.length; i++){
				if(htmlStr == CHROMSHARP[i]){
					htmlStr = CHROMFLAT[i];
					break;
				}
			}

			for(ko in dictKeys){
				if (htmlStr == dictKeys[ko].name){
					keyObj = dictKeys[ko];
					break;
				}
			}
		}
		return keyObj;
	}

// the notespan is a span with note text inside at td notecontainer
var getNotespanFromTD = function(td){
		var arr = td.attr('id').split('_');
		return $('#ns_'+arr[1]+'_'+arr[2]);
	}

var getStringFret = function(el){
		var aStringFret = el.attr('id').split('_');
		aStringFret.shift();
		return aStringFret;
	}

var updateSetRootView = function(){
		if(SETTINGROOT){
			$("#setRoot").addClass( 'setRootArmed' );
		}else{
			$("#setRoot").removeClass( 'setRootArmed' );
			if(QUIZZING==ST_QUIZZING_RANDOMROOT || QUIZZING == ST_QUIZZING_INTERVAL){
				ctl_updateQuizzing(ST_QUIZZING_NONE);
			}
		}
	}


var populateColorPalleteChooser = function(){
	html = "Palette:";
	for(var i=0; i < PALLETE_COLORS.length; i++){
		html += '<input type="button" value="&nbsp;" class="color_button '+PALLETE_COLORS[i]+'" />';
	}
	$('#colorchooser').append(html);

}
var populateNotegroupsUnabridged = function(){
	var html = '<ul id="unabridgedKeyTabs">';
	for (var key in dictKeys) {
		html += '<li><a href="#tb_'+dictKeys[key].safename+'">'+dictKeys[key].name+'</a></li>';
	}
	html += '</ul>';
	$('#notegroupsUnabridged').append(html);

	html ="";
	for(var key in dictKeys){
		html += '<div id="tb_'+dictKeys[key].safename+'" class="tabs-nobg">';
		//populateKeyWithUnabridgedNotegroups();
		html += '<div id="ngTab_'+dictKeys[key].safename+'" class="tabs-nohdr">';
		html += '<ul  >';
				html += '<li><a href="#tb_scales_'+dictKeys[key].safename+'">Scales</a></li>';
        html += '<li><a href="#tb_arppegios_'+dictKeys[key].safename+'">Arpeggios</a></li>';
        html += '<li><a href="#tb_chords_'+dictKeys[key].safename+'">Chords</a></li>';
    html += '</ul>';

		// ~~~~~~ arpeggios
		html += '<div id="tb_arppegios_'+dictKeys[key].safename+'" class="tabs-nobg ngExchange">';

		// divs
		for(var ng in dictArps){
			//var obj = ng;
			html += '<div id="'+dictKeys[key].safename+'_'+ng+'" class="ngUnabDiv ngboxArp">';
			html += dictKeys[key].name+dictArps[ng].name;
			html += '</div>';
		}


        html += '</div>';

		// ~~~~~~ scales
		html += '<div id="tb_scales_'+dictKeys[key].safename+'" class="tabs-nobg  ngExchange">';

		for(var ng in dictScales){
			//var obj = ng;
			html += '<div id="'+dictKeys[key].safename+'_'+ng+'" class="ngUnabDiv ngboxScale">';
			html += dictKeys[key].name +' '+ dictScales[ng].name;
			html += '</div>';
		}

		html += '</div>';

		// ~~~~~~ chords
		html += '<div id="tb_chords_'+dictKeys[key].safename+'" class="tabs-nobg ngExchange">';
		//html += dictKeys[key].name+' chords';
		html += 'Maybe in the next update!'
        html += '</div>';
		html += '</div>';
		// end of div for key
		html += '</div>';
	}
	$('#notegroupsUnabridged').append(html);

 	};

var populateNotegroupsRandRootTab = function(){
	var itemsPerCol =7;
	var colItem=0;
	html="";
	html+='<span class="RR_scaleOptionsCol">';
	for (var ng in mPref.aPrefs.rrq_Notegroups){
		colItem = colItem+1;
		if(colItem > itemsPerCol){
			html+='</span><span class="RR_scaleOptionsCol">';
			colItem = 1;
		}
		ng = dictScales[mPref.aPrefs.rrq_Notegroups[ng][0]]; // 0 is name, 1 is t/f for checked box
		html += '<input type="checkbox" id="prefRRQ_'+ng.ngtype+'_'+ng.varname+'" name="'+ng.ngtype+'_'+ng.varname+'" value="'+ng.ngtype+'_'+ng.varname+'"> '+ng.name+'<br>';
	}
	//html+='<span class="RR_scaleOptionsCol">';
	html+='</span>';
	$("#RR_scaleOptionsDiv").append(html);
	// attach function that makes sure at least one ng selection is checked.
	for (var ng in mPref.aPrefs.rrq_Notegroups){
		$('#prefRRQ_'+mPref.aPrefs.rrq_Notegroups[ng][0]).click(function(){
			oneRRQalwaysChecked(this);
		});
   		// if($('#prefRRQ_'+mPref.aPrefs.rrq_Notegroups[ng][0]).is(':checked')){
     //    mPref.aPrefs.rrq_Notegroups[ng][1] = true;
     //  } else{
     //    mPref.aPrefs.rrq_Notegroups[ng][1] = false;
     //  }
    }
};

var randomIntFromInterval = function(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

var oneRRQalwaysChecked = function(lastClicked){
		var checkedNGs =0;
	  for (var ng in mPref.aPrefs.rrq_Notegroups){
	  if($('#prefRRQ_'+mPref.aPrefs.rrq_Notegroups[ng][0]).is(':checked')){
	    	checkedNGs++;
	  	}
		}
	  if (checkedNGs == 0){
		$(lastClicked).prop('checked', true);
		}
}


// Unabridged divs are the notegroup div objects in the left hand div under the fretboard
// with all the tabs for each key.  These are all the scales and arpeggios, unabridged.
// These become draggable over to the right hand div under the fretboard which is governed by
// PlayerModel
// Dragging notegroups to the 'Abridged' PlayerModel allows a user-selected 'dashboard' to quickly
// jump between notegroups.  Functionality for player model includes automatically cycling through them
// at a chosen speed.
// 'Notegroups' are objects which provide instructions on how to paint the fretboard (color and text).

var	makeUnabridgedDragDroppable = function(){
	var x = null;
	//Make element draggable
	$(".ngUnabDiv").draggable({
		helper: 'clone',
		containment: 'document' ,
		 start: function(e, ui)
		 {
		  $(ui.helper).addClass("ui-draggable-helper");
		 },
		cursor: 'move',
		tolerance: 'fit',
		revert: true
	}).click(function(){
		var arrID = this.id.split('_');
		set_notes_per_notegroup(arrID[0], arrID[1], arrID[2]);
		update_link();
		});


	$("#ngDashboard").droppable({
    accept: '.ngUnabDiv',
    activeClass: "drop-area",
    drop: function (e, ui) {
        if ($(ui.draggable)[0].id != "") {
			// on dropping unabridgedtd
            var x = ui.helper.clone();
			var helperID = ui.helper.clone().context.id;
			ui.helper.remove();
			ctrl_addDashNotegroups(x.context.id);
			x.remove(); // get rid of clone
        }
    }
});

$("#remove-drag").droppable({
    drop: function (event, ui) {
        $(ui.draggable).remove();
    },
    hoverClass: "remove-drag-hover",
    accept: '.remove'
});

}

var onDocReady = function(){

}

jQuery(document).ready(function() {
	//START

// set up UI
	populateColorPalleteChooser();

	populateNotegroupsUnabridged();
	$("#notegroupsUnabridged").tabs();
	makeUnabridgedDragDroppable();
	for(var key in dictKeys){
		$("#ngTab_"+dictKeys[key].safename).tabs();
	}

	// generate tabs for all Unabridged notegroups
	$("#notegroupsUnabridged2").tabs();

	$( ".cNoteGroup" ).draggable({ addClasses: false });



	// make fretboard

	$(gen_fret_boxes(GTR_FRETS, GTR_STRINGS)).insertAfter($('#mainfretboard'));
	GUITAR_STRINGS = getFretcloneStrings();
	set_notes();

	// add another row onto Fretclone to serve as fretpaint buttons
	var newRow = function(){
		var html ="<tr>"
		var board_strings = $('#fretclone tr');

		var children = board_strings[0].children;
		for (var f = 0; f < children.length; f++){
			html +='<td id="fretpaint_'+f+'" class="fretpainter"></td>';
		}
		html +="</tr>"
		return html;
	}
	$('#fretclone > tbody:last').append(newRow);


	// instantiate prefsModel -- for user preferences to govern and be saved as cookie or storage
	mPref = PrefModel;
	mPref.init(dictScales, GUITAR_STRINGS[0].length, GUITAR_STRINGS.length); // notegroups array, maxFrets, maxStrings


	// make tabs in popup
	$("#prefTabs").tabs();

// setup Start UI prefs
switch(mPref.aPrefs.startNoteLabel){
	case "note":
		$('input[name=sp_Label][value=note]').prop("checked",true);
		break;
	case "int":
		$('input[name=sp_Label][value=int]').prop("checked",true);
		break;
	default:
		$('input[name=sp_Label][value=note]').prop("checked",true);
		break;
}

switch(mPref.aPrefs.startNoteColor){
	case "note":
		$('input[name=sp_Color][value=pallete]').prop("checked",true);
		break;
	case "int":
		$('input[name=sp_Color][value=interval]').prop("checked",true);
		break;
	default:
		$('input[name=sp_Color][value=pallete]').prop("checked",true);
		break;
}

$('input[name=sp_Color][value=pallete]').prop("checked",true);
// set up Random Interval quiz prefs
  var spRI_LoFret = $( "#spRIQ_LoFret" ).spinner({
               min: mPref.aPrefs.riq_LoFret,
               max: mPref.aPrefs.riq_HiFret -1,
               value: mPref.aPrefs.riq_LoFret,
               change: function( event, ui ) {
               	if(this.value >= $("#spRIQ_HiFret").spinner( "value" )){
               		$( "#spRIQ_LoFret" ).spinner("value", $("#spRIQ_HiFret").spinner( "value" ) - 1);
               	}
               },
            });
	var spRI_HiFret = $( "#spRIQ_HiFret" ).spinner({
               min: mPref.aPrefs.riq_LoFret + 1,
               max: mPref.aPrefs.riq_HiFret,
               value: mPref.aPrefs.riq_HiFret,
               change: function( event, ui ) {
               	if(this.value <= $("#spRIQ_LoFret").spinner( "value" )){
               		$( "#spRIQ_HiFret" ).spinner("value", $("#spRIQ_LoFret").spinner( "value" ) + 1 );
               	}
               },
            });

	var spRI_StrDepth = $( "#spRIQ_StrDepth" ).spinner({
               min: 0,
               max: mPref.aPrefs.riq_HiStr - 1,
               value: mPref.aPrefs.riq_StrDepth
            });
	var spRI_FretDepth = $( "#spRIQ_FretDepth" ).spinner({
               min: 1,
               max: mPref.aPrefs.riq_HiFret - 1,
               value: mPref.aPrefs.riq_FretDepth,
            });
	// set up Random Root quiz prefs
	var spRR_LoFret = $( "#spRR_LoFret" ).spinner({
               min: mPref.aPrefs.rrq_LoFret,
               max: mPref.aPrefs.rrq_HiFret -1,
               value: mPref.aPrefs.rrq_LoFret,
               change: function( event, ui ) {
               	if(this.value >= $("#spRR_HiFret").spinner( "value" )){
               		$( "#spRR_LoFret" ).spinner("value", $("#spRR_HiFret").spinner( "value" ) +1);
               	}
               },
            });
	var spRR_HiFret = $("#spRR_HiFret").spinner({
               min: mPref.aPrefs.rrq_LoFret +1,
               max: mPref.aPrefs.rrq_HiFret,
               value: mPref.aPrefs.rrq_HiFret,
               change: function( event, ui ) {
               	if(this.value <= $("#spRR_LoFret").spinner("value")){
               		$("#spRR_HiFret").spinner( "value", $("#spRR_LoFret").spinner("value") - 1 );
               	}
               },
            });
	var spRR_LoStr = $("#spRR_LoStr").spinner({
               min: mPref.aPrefs.rrq_LoStr,
               max: mPref.aPrefs.rrq_HiStr,
               value: mPref.aPrefs.rrq_LoStr,
               change: function( event, ui ) {
               	if(this.value > $("#spRR_HiStr").spinner( "value" )){
               		$("#spRR_HiStr").spinner( "value", this.value );
               	}
               },
            });
	var spRR_HiStr = $("#spRR_HiStr").spinner({
               min: mPref.aPrefs.rrq_LoStr,
               max: mPref.aPrefs.rrq_HiStr,
               value: mPref.aPrefs.rrq_HiStr,
               change: function( event, ui ) {
               	if(this.value < $("#spRR_LoStr").spinner( "value" )){
               		$("#spRR_LoStr").spinner( "value", this.value );
               	}
               },
            });

// set up prefs per user cookie or default
	mPref.retrieveUserPrefs();


	// dynamically insert notegroup checkboxes
	populateNotegroupsRandRootTab();
	// check boxes according to Pref model
	ctl_setPrefFormToPrefModel();
	//ctl_updateRRQprefView();


// get any url parameters and adjust model(s) appropriately
	var url_params = get_url_parameters();
	var loadFromUrl = function(){

// per url params, put notegroups in abridged dashboard playermodel area
		if (is_defined(url_params['dash'])){
				var arrNotgroups = url_params['dash'];
				ctl_populateDash(arrNotgroups);
			}
		if (is_defined(url_params['diagram_title'])){
			$('#diagram_title').val(unescape(url_params['diagram_title']));
		}
		// if there are a bunch of string/fret data in URL and q is y, then it's a quiz
		// show the 'check answer' button to color code per the tester's string/fret data
		if (is_defined(url_params['strings'])){
			if (is_defined(url_params['q']) && url_params['q'] == 'y'){
				COLOR = "black";
				$('#checkanswer').click(function(){
					check_answers(url_params['strings']);
					//CHECKING_URL_QUIZ = false;
				});
				ctl_updateQuizzing(ST_QUIZZING_URL)
				// $('#colorchooser').hide();
				// $('#checkanswer').show();
				//CHECKING_URL_QUIZ = true;
			} else {
				fill_from_repr(url_params['strings']);
			}
		}

// per url params, set key
		if (is_defined(url_params['key'])){
				// key should use safename, eg 'Cnatural'
				ctl_change_key.setRoot(getKeyObjFromSafeName(url_params['key']));
		}

		// Change painting as Notegroup (scale or arp) by url params
		if (is_defined(url_params['ng'])){
			// check for valid notegroup and add to validNG
				var validNG = false;
				var keys =[];
				for (var key in Notegroups) {
				  if (Notegroups.hasOwnProperty(key)) {
				    keys.push(key);
				  }
				}
				for (var i = 0; i < keys.length; i++){
					if(url_params['ng'] == keys[i]){
							validNG =Notegroups[url_params['ng']];
							var s = validNG;
					}
				}

				if(validNG){
					// set notegroup in fretboard model to notegroup from URL
					set_notes_per_notegroup(mFB.getKeySafeName(), validNG.ngtype, validNG.varname);
					//mFB.setNotegroup(validNG, validNG.ngtype);
					//ctrl_updateMessage();
				}
			}
	}
	loadFromUrl();
	update_link();
	var message = $('#message');
	// update link at every click on a note...
	$('#fretclone tr td').click(update_link);
	// or when changes are made to the title
	$('#diagram_title').change(update_link)
	    .keyup(update_link)
	    .keydown(update_link);
	$('#diagram_title').click(function(){ this.select(); });

 //################# Button Bindings
	// set up color buttons according each element's class
	$('.color_button').click(function(){
		COLOR = $(this).attr('class').split(' ')[1];
		message.html('');
	})

	// set up fret painters which paint or erase fret
	$('.fretpainter').click(function(){
		//get the corresponding fret
		var fret = this.id.split('_')[1];
		var fpainted = false;
		for(var s = 0; s < GUITAR_STRINGS.length; s++){
				var nc = $('#'+'nc_'+s+'_'+fret);
				if(is_painted(nc)){
					fpainted = true;
					break;
				}
		}

// respond to color by intervals setting true or false by repainting fretboard
		for(var s = 0; s < GUITAR_STRINGS.length; s++){
				if(fpainted){
					td_clear($('#'+'nc_'+s+'_'+fret));
				} else{
					var ns = $('#'+'nc_'+s+'_'+fret);
					if(COLORBYINTERVALS){
						ctl_color_td_by_interval(s,fret)
					} else
					{
						td_paint($('#'+'nc_'+s+'_'+fret), COLOR);
					}
				}
		}
		// create new link
		update_link();

	})

// help text instructions dialog
 $(function() {
			$( "#helpText" ).dialog({
				autoOpen: false
			},{
				width: 640,
				height: 372

			},{
				dialogClass:".helpInstructions",
			});
	});


// bind help button to show help dialog
	$('#btnHelp').button({
		text: false,
		icons:
      {
          primary: "ui-icon-help"
      }
	}).click(function(){
		$( "#helpText" ).html(HELP_TEXT);
			$( "#helpText" ).dialog( "open" );
	});

// preferences dialog
 $(function() {
			$( "#prefWin" ).dialog({
				autoOpen: false,
				modal: true,
				//closeOnEscape: false,
				//open: function(event, ui) { $(".ui-dialog-titlebar-close", $(this).parent()).hide(); },
				buttons:{
					'Save and Close':function(){
						//save prefs PrefModel and then write cookie
						ctl_updatePrefs();

						 $(this).dialog('close');
					}
				}
			},{
				width: 640,
				height: 472

			},{
				dialogClass:".helpInstructions",
			});
	});

// bind pref button to show preferences dialog
	$('#btnPref').button({
		text: false,
		icons:
      {
          primary: "ui-icon-gear"
      }
	}).click(function(){
			$( "#prefWin" ).dialog( "open" );
	});

	//  $('#prefWin').bind('dialogclose', function(event) {
	//  	//when dialog is closed, update the Pref model with data in popup form controls
 //    ctl_updatePrefs();
 // });

	// set up eraser brush and clear buttons:

	// bind brush button functionality -- paints notes based on note color and interval onMouseOver
	$('#brush').click(function(){
		var iteration=$(this).data('iteration')||1
		switch ( iteration) {
		case 1:
			BRUSH = true;
			ERASER = false;
			$(this).removeClass('blank').addClass('white');
			//message.html('<b>Brush activated!</b><br /><sub>Mouseover the marks to paint them</sub>');
			break;
		case 2:
			$(this).removeClass('white').addClass('blank');
			BRUSH = false;
			//message.html('')
			break;
		}
		iteration++;
		if (iteration>2) iteration=1
		$(this).data('iteration',iteration)
	});

// bind eraser button functionality -- erases fret notes moused-over
	$('#eraser').click(function(){
		var iteration=$(this).data('iteration')||1
		switch ( iteration) {
		case 1:
			ERASER = true;
			BRUSH = false;
			$(this).removeClass('blank').addClass('white');
			//message.html('<b>Eraser activated!</b><br /><sub>Mouseover the marks to erase them</sub>');
			break;
		case 2:
			$(this).removeClass('white').addClass('blank');
			ERASER = false;
			//message.html('')
			break;
		}
		iteration++;
		if (iteration>2) iteration=1
		$(this).data('iteration',iteration)
	});

// bind 'clear' button functionality -- clears all notes from fretboard
	$('#clear').click(function(){
		message.html('');
		clear_fretboard();
		if(QUIZZING==ST_QUIZZING_RANDOMROOT || QUIZZING == ST_QUIZZING_INTERVAL){ctl_updateQuizzing(ST_QUIZZING_NONE);}
		update_link();
	});

// bind button for 'Interval/Notes' -- sets Fretboard Model state to paint fretboard notes with text
// of intervals or note-names
	$('#modeNoteInt').click(function(){
		INTERVALMODE = !INTERVALMODE;
		ctl_updateIntervalMode(INTERVALMODE);
		// if(INTERVALMODE == true){
		// 	ctl_updateIntervalMode(false);
		// } else{
		// 	ctl_updateIntervalMode(true);
		// }
		if(QUIZZING==ST_QUIZZING_RANDOMROOT || QUIZZING == ST_QUIZZING_INTERVAL){ctl_updateQuizzing(ST_QUIZZING_NONE);}
	});

// bind button for 'Interval/Notes' -- set Fretboard Model state to paint fretboard notes with interval colors or
// selected pallate color
	$('#colorByInterval').click(function(){
		if(COLORBYINTERVALS){
			ctl_updateColorIntMode(false);
		} else {
			ctl_updateColorIntMode(true);
		}

		if(QUIZZING==ST_QUIZZING_RANDOMROOT || QUIZZING == ST_QUIZZING_INTERVAL){ctl_updateQuizzing(ST_QUIZZING_NONE);}

	});


// Bind set root button -- when on, next fret note clicked will be new Key in Fretboard Model, then button reverts to off
//
	$('#setRoot').click(function(){
		if(!SETTINGROOT){
			SETTINGROOT=true;
		} else {
			SETTINGROOT=false;
		}
		updateSetRootView();
	});

	$('#selKey').change(function(){
		ctl_change_key.selKeyChange($('#selKey').val());
	    if(QUIZZING==ST_QUIZZING_RANDOMROOT || QUIZZING == ST_QUIZZING_INTERVAL){ctl_updateQuizzing(ST_QUIZZING_NONE);}
	});

	// dash player controls -- for Abridged Player Model
	$('#dashPlayStop').click(function(){
		if (mPlayer.getPlaystate() == PS_PLAYING){
			ctl_stopPlayer();
		} else {
			ctl_playPlayer();
		}
	});

	$('#dashBack').click(function(){
			ctl_backPlayer();

	});

	$('#dashFwd').click(function(){
			ctl_fwdPlayer();
	});


	$('#dashSpeed').change(function(){
		ctl_changeSpeed();
	});

  // bind 'interval quiz' button to functionality -- each click generates new interval, with root colored red
  // button will read "check answer" until new paint note or clear note.
  $('#intervalQuiz').click(function(){
			if($('#intervalQuiz').val() == CHECKANSWER){
				// stop quiz
				ctl_updateQuizzing(ST_QUIZZING_NONE);
				ctl_updateIntervalMode(true);
			} else {
				// start interval quiz
				ctl_updateIntervalMode(false);
		  	ctl_updateQuizzing(ST_QUIZZING_INTERVAL);
		  }
  })

// bind 'random note quiz' to functionality -- each click generates a random root note and loads a scale
// where you can guess the rest
  $('#randomRootQuiz').click(function(){
  	ctl_updateQuizzing(ST_QUIZZING_NONE);
  	ctl_updateQuizzing(ST_QUIZZING_RANDOMROOT);
  })

	// set up example links
	$('#examples ul li a').click(function(){
		url_params = get_url_parameters($(this).attr('href'));
		clear_fretboard();
		//update_link();
		loadFromUrl();
	});

	// reset defaults in preferences/general
	$('#btnResetDefaults').click(function(){
		ctl_resetDefaultPrefs();
	});

	// set start UI per Pref Model
	if(mPref.aPrefs.startNoteLabel != "note" ){
		if(!INTERVALMODE){
			// assumes we are not in interval mode
			$('#modeNoteInt').click();
			$('input[name=sp_Label][value=int]').prop("checked",true); // set radio button in pref tab
		}
	}
	if(mPref.aPrefs.startNoteColor != "pallete" ){
		if(!COLORBYINTERVALS){
			// assumes we are not in color by interval mode
			$('#colorByInterval').click();
			$('input[name=sp_Color][value=interval]').prop("checked",true);// set in pref tab
		}
	}

	// interval color or pallete color switched by url params
		if (is_defined(url_params['intColor'])){
				if(url_params['intColor'] == "true"){

					ctl_updateColorIntMode(true);
				}
			}

// interval names or note names switched by url params
		if (is_defined(url_params['intNames'])){
				if(url_params['intNames'] == "true"){
					ctl_updateIntervalMode(true);
				}
			}


	// TODO: generate jTab
	// TODO: show chord in standard notation
});
