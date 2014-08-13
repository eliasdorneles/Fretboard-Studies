/* code to handle manipulation */
var GUITAR_STRINGS;
var COLOR = "lightgreen";
//var PALLETE_COLORS = ["orange", "green", "blue", "yellow", "lightgreen", "red", "transparent"]
//var POSSIBLE_COLORS2 = ["orange", "green", "blue", "yellow", "lightgreen", "red", "i_root", "transparent"]
var POSSIBLE_COLORS = [
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
	"orange", 
	"green", 
	"blue", 
	"yellow", 
	"lightgreen", 
	"red", 
	"black",
	"white",
	"transparent"];
var ERASER = false;
var BRUSH = false;
var SETTINGROOT = false;
var INTERVALMODE = false;
var COLORBYINTERVALS = false;


var KEY = 0;

//var mScale = ScaleModel;
var mFB = FretboardModel;

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

var ctl_updateIntervalMode = function(boolNewMode){
	
		if(boolNewMode){
			$('#modeNoteInt').attr('value', 'Intervals');
			INTERVALMODE = true;
			set_notespans();
			update_link();
		} else {
			$('#modeNoteInt').attr('value', 'Notes');
			INTERVALMODE = false;
			set_notespans();
			update_link();
		}
	}

var ctl_populateDash = function(str){
		var nGroups = str.split(",");
		for(var i=0	; i < nGroups.length; i++){
			ctrl_addDashNotegroups(nGroups[i]);
		}
	}

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
					  update_link();
					}
				).click(
					// set notegroups on abridged Div click
				   function(){
					//var abDivArrID = this.attributes["notegroup"].value.split('_');
					set_notes_per_notegroup(arrID[0], arrID[1], arrID[2]);		
				   }
				);
			
			if(mPlayer.getPlaystate() == PS_PLAYING){
				ctl_stopPlayer();
			}
			
			$("#ngDashboard").append($abDiv); // add dragged notegroup to Dashboard
			$("#ngDashboard").sortable({
			stop: function( event, ui ) {mPlayer.reloadNotegroups($("#ngDashboard"))},
			start: function( event, ui ) {ctl_stopPlayer();}
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
 
var set_notes_per_notegroup = function(keySafeName, ngType, ng){
			// if color by intervals is off, turn on and save state
			var paletteState = !COLORBYINTERVALS;				   
			COLORBYINTERVALS = true;
			ctl_change_key.keyChangeNotegroup(keySafeName);
			var ng = ngType+'_'+ng;
			mFB.setNotegroup(ng);
			set_notespans();
			COLORBYINTERVALS = !paletteState; // keep pallete if open
			//var msg = "Painting notes for <strong>"+mFB.getKeyTextName();
//			if(ngType != "ARP"){msg += " ";}
//			msg += mFB.getNotegroup().name+"</strong>";
//			$('#message').html(msg);
}

var isPalleteColor = function(c){
		for(var pc in PALLETE_COLORS){
			if (c == pc) return true;
		}
		return false;
	}

var getChromaticInt = function(noteStr, chromNamesScale){
	
	if(chromNamesScale == null){
		chromNamesScale = mFB.getChromNames();
	}
	for(var i = 0; i < chromNamesScale.length; i++){
		if (noteStr == chromNamesScale[i])
		return i;
	}
}



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

var getSafeNameFromNoteName = function(noteStr){	
		var intFromC = getKeyObjFromUnsafeName(noteStr).fromC
		var newKeyHtmlName = mFB.getKeyObj().baseScale[intFromC];
		return  getKeyObjFromUnsafeName(newKeyHtmlName).safename;
	}

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
			$("#setRoot").removeClass( 'setRootArmed' )
		}
	}
	
//var populateScaleMenu = function(){
//		var scaleSel =  $('#selScale');
//		var arrScales = dictScales;
//		$.each(arrScales, function(val, text) {
//		scaleSel.append(
//			$('<option></option>').val(val).html(text["name"])
//				 );
//		});	
//	}

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
		});
	
	$("#ngDashboard").droppable({
    accept: '.ngUnabDiv',
    activeClass: "drop-area",
    drop: function (e, ui) {
        if ($(ui.draggable)[0].id != "") {
			// on dropping unabridged div
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

	populateNotegroupsUnabridged();
	$("#notegroupsUnabridged").tabs();
	makeUnabridgedDragDroppable();
	for(var key in dictKeys){
		$("#ngTab_"+dictKeys[key].safename).tabs();
	}
	
	$("#notegroupsUnabridged2").tabs();

	$( ".cNoteGroup" ).draggable({ addClasses: false });
	
	
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
	
	//populateScaleMenu(); // removed from view

	var url_params = get_url_parameters();
	var loadFromUrl = function(){
		if (is_defined(url_params['intColor'])){
				if(url_params['intColor'] == "true"){
	
					ctl_updateColorIntMode(true);
				} 
			}
		if (is_defined(url_params['intNames'])){
				if(url_params['intNames'] == "true"){
					ctl_updateIntervalMode(true);
				} 
			}
		if (is_defined(url_params['key'])){
				// key should use safename
				ctl_change_key.keyChangeNotegroup(url_params['key']);
			}
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

	})

	// set up eraser brush and clear buttons:
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
	

	
	$('#clear').click(function(){
		message.html('');
		clear_fretboard(); update_link();
	});
	
	$('#modeNoteInt').click(function(){
		if(INTERVALMODE == true){
				ctl_updateIntervalMode(false);
			} else{
				ctl_updateIntervalMode(true);
			}
		
	});
	
	$('#colorByInterval').click(function(){
		if(COLORBYINTERVALS){
			ctl_updateColorIntMode(false);
		} else {
			ctl_updateColorIntMode(true);
		}

		
	});

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

	});
	
	// dash player controls
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
		var timerSpeed = Math.round(1000 * 60 / $('#dashSpeed').val() );
		mPlayer.setPlaySpeed(timerSpeed);
	});
	
	// removed from view
//	$('#selScale').change(function(){
//		var newScale = $('#selScale').val();
//		//var key = $('#selKey').val();
//		mFB.setNotegroup(newScale, dictScales);
////		mScale.setScale(newScale);
////		A_INTERVAL_COLOR = mScale.getIntColorArr();
////		A_INTERVAL_NAMES = mScale.getIntNamesArr();
// 		set_notespans();
//	});

	// set up example links
	$('#examples ul li a').click(function(){
		url_params = get_url_parameters($(this).attr('href'));
		clear_fretboard(); update_link();
		loadFromUrl();
	});
	

	
	
	// TODO: generate jTab
	// TODO: show chord in standard notation
});
