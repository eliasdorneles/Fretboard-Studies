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
var CHECKANSWER = 'Check Answer!';
var HELP_TEXT = "HEre is some help";

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
var QUIZZINGINTERVAL = false // state where interval quiz is awaiting check answer
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
			if(QUIZZINGINTERVAL){
				ctl_updateQuizzingInterval(false);
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
		if(mFB.getNotegroupDict() != dictArps){msg += " ";}
		msg += mFB.getNotegroup().name+"</strong>";
		$('#message').html(msg);
		} else{
			$('#message').html("");
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

		if(QUIZZINGINTERVAL){
				ctl_updateQuizzingInterval(false);
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

var ctl_updateQuizzingInterval = function(stQuizzing){
		QUIZZINGINTERVAL = stQuizzing;
		// actions from change in QUIZZINGINTERVAL state from clicking Random Interval on UI
		if(stQuizzing){
			ctl_newIntQuiz();
				// redo button text
			$("#intervalQuiz").attr('value', CHECKANSWER );
		}else{
				// redo button text
			$("#intervalQuiz").attr('value','Random Interval');
		}
	}
var ctl_newIntQuiz = function(){
	// clear FB
	clear_fretboard();
	// set IntervalMode state to false and ColorByIntervals to False
	COLORBYINTERVALS = false;
	INTERVALMODE = false;
	var lowFret = 0;
	var highFret = GUITAR_STRINGS[0].length;
	var rngFrets= 6;// the range of frets from root can be set here
	var rngLo =1;
	var rngHi =1;
	// get two randmon notes on FB
	var rootString = Math.floor((Math.random() * GUITAR_STRINGS.length) );
	var intString= Math.floor((Math.random() * GUITAR_STRINGS.length) );
	var rootFret=-1;
	var intFret=-1;

	while (!(rootFret >= lowFret && rootFret <= highFret)){
		var rootFret =  Math.floor(Math.random() * highFret );
	}

	while (!(intFret >= lowFret && intFret <= highFret && rootFret != intFret) ){
			var intFret =  Math.floor(Math.random() * highFret );
			if(intFret <= (rootFret - rngFrets) || intFret >= (rootFret + rngFrets)){
				// out of range; invalid
				intFret = -1;
			}
	}
	// get safeName from note
	var newRootNoteName = $('#'+'ns_'+rootString+'_'+rootFret).attr('notename');
	//var newRootNoteName="A&#9837;";

	// if(newRootNoteName.length>1){
	// 	// accidental
	// 	// accidentals (eg, Csharp or Cflat) will depend on last notegroup.
	// 	// flip coin on all accidentals
	// 	var acc = getAccTypeStr(newRootNoteName);

	// 	if(Math.floor(Math.random() * 2 )==1){
	// 		// switch accidental
	// 		// switch accidental only if room on fretboard and in key Dictionary

	// 	} else{
	// 		 // keep accidental

	// 	}
	// } else {
	// 	newRootNoteName = newRootNoteName.charAt(0)+"natural";
	// }

	ctl_change_key.setRoot(getKeyObjFromNoteName(newRootNoteName));
		// remove text in notecontainer's notespan, setting interval will return text
	$('#'+'ns_'+rootString+'_'+rootFret).text(' ');
	td_paint('#'+'nc_'+rootString+'_'+rootFret, "red");

	$('#'+'ns_'+intString+'_'+intFret).text(' ');
	td_paint('#'+'nc_'+intString+'_'+intFret, "lightgreen");

}


// more utilities
//
var set_notes_per_notegroup = function(keySafeName, ngType, ng){
			// if color by intervals is off, turn on and save state
			var paletteState = !COLORBYINTERVALS;
			COLORBYINTERVALS = true;
			ctl_change_key.keyChangeNotegroup(keySafeName);
			var ng = ngType+'_'+ng;
			mFB.setNotegroup(ng);
			set_notespans();
			ctl_updateQuizzingInterval(false);
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
			if(QUIZZINGINTERVAL){
				ctl_updateQuizzingInterval(false);
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
        html += '<li><a href="#tb_arppegios_'+dictKeys[key].safename+'">Arpeggios</a></li>';
        html += '<li><a href="#tb_scales_'+dictKeys[key].safename+'">Scales</a></li>';
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
	$(gen_fret_boxes(19, 6)).insertAfter($('#mainfretboard'));
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

// get any url parameters and adjust model(s) appropriately
	var url_params = get_url_parameters();
	var loadFromUrl = function(){

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
// per url params, put notegroups in abridged dashboard playermodel area
		if (is_defined(url_params['dash'])){
				var arrNotgroups = url_params['dash'];
				ctl_populateDash(arrNotgroups);
			}
		if (is_defined(url_params['diagram_title'])){
			$('#diagram_title').val(unescape(url_params['diagram_title']));
		}
		if (is_defined(url_params['strings'])){
			if (is_defined(url_params['q']) && url_params['q'] == 'y'){
				COLOR = "black";
				$('#checkanswer').click(function(){
					check_answers(url_params['strings']);
				});
				$('#colorchooser').hide();
				$('#checkanswer').show();
			} else {
				fill_from_repr(url_params['strings']);
			}
		}

// per url params, set key
		if (is_defined(url_params['key'])){
				// key should use safename, eg 'Cnatural'
				ctl_change_key.setRoot(getKeyObjFromSafeName(url_params['key']));
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

 $(function() {
			$( "#helpText" ).dialog({
				autoOpen: false
			},{
				width: 640
			},{
				dialogClass:".helpInstructions",
			});
	});


// bind help button to show help dialog
	$('#btnHelp').click(function(){
			$( "#helpText" ).dialog( "open" );
	});



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
		ctl_updateQuizzingInterval(false);
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
		ctl_updateQuizzingInterval(false);
	});

// bind button for 'Interval/Notes' -- set Fretboard Model state to paint fretboard notes with interval colors or
// selected pallate color
	$('#colorByInterval').click(function(){
		if(COLORBYINTERVALS){
			ctl_updateColorIntMode(false);
		} else {
			ctl_updateColorIntMode(true);
		}

		ctl_updateQuizzingInterval(false);

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
	    ctl_updateQuizzingInterval(false);
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
				QUIZZINGINTERVAL = false;
				ctl_updateQuizzingInterval(QUIZZINGINTERVAL);
				ctl_updateIntervalMode(true);
			} else {
				ctl_updateIntervalMode(false);
	  		QUIZZINGINTERVAL = !QUIZZINGINTERVAL;
		  	ctl_updateQuizzingInterval(QUIZZINGINTERVAL);
		  }
  })

	// set up example links
	$('#examples ul li a').click(function(){
		url_params = get_url_parameters($(this).attr('href'));
		clear_fretboard();
		//update_link();
		loadFromUrl();
	});




	// TODO: generate jTab
	// TODO: show chord in standard notation
});
