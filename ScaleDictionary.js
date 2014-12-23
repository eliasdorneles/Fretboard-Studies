// JavaScript Document

// for get enharmonic
var FLATTED = -1;
var NATURAL = 0;
var SHARPED = 1;

var SCALE = "SC"; // constant
var ARP = "ARP"; // constant

var CHROMFLAT = ['C', 'D&#9837;', 'D', 'E&#9837;', 'E', 'F', 'G&#9837;', 'G', 'A&#9837;', 'A', 'B&#9837;', 'B'];
var CHROMSHARP = ['C', 'C&#9839;', 'D', 'D&#9839;', 'E', 'F', 'F&#9839;', 'G', 'G&#9839;', 'A', 'A&#9839;', 'B'];


kC = {"name" : "C", "safename" : "Cnatural", "baseScale" : CHROMFLAT, "fromC" : 0};
kDflat = {"name" : "D&#9837;", "safename" : "Dflat",  "baseScale" : CHROMFLAT, "fromC" : 1};
kD = {"name" : "D",  "safename" : "Dnatural", "baseScale" : CHROMSHARP, "fromC" : 2};
kEflat = {"name" : "E&#9837;",  "safename" : "Eflat", "baseScale" : CHROMFLAT, "fromC" : 3};
kE = {"name" : "E",  "safename" : "Enatural", "baseScale" : CHROMSHARP, "fromC" : 4};
kF = {"name" : "F",  "safename" : "Fnatural", "baseScale" : CHROMSHARP, "fromC" : 5};
kGflat = {"name" : "G&#9837;",  "safename" : "Gflat", "baseScale" : CHROMFLAT, "fromC" : 6};
kG = {"name" : "G",  "safename" : "Gnatural", "baseScale" : CHROMSHARP, "fromC" : 7};
kAflat = {"name" : "A&#9837;",  "safename" : "Aflat", "baseScale" : CHROMFLAT, "fromC" : 8};
kA = {"name" : "A",  "safename" : "Anatural", "baseScale" : CHROMSHARP, "fromC" : 9};
kBflat = {"name" : "B&#9837;",  "safename" : "Bflat", "baseScale" : CHROMFLAT, "fromC" : 10};
kB = {"name" : "B",  "safename" : "Bnatural", "baseScale" : CHROMFLAT, "fromC" : 11};
kCsharp = {"name" : "C&#9839;",  "safename" : "Csharp", "baseScale" : CHROMSHARP, "fromC" : 1};
kFsharp = {"name" : "F&#9839;",  "safename" : "Fsharp", "baseScale" : CHROMSHARP, "fromC" : 6};
kGsharp = {"name" : "G&#9839;",  "safename" : "Gsharp","baseScale" : CHROMSHARP, "fromC" : 8};
kAsharp = {"name" : "A&#9839;",  "safename" : "Asharp","baseScale" : CHROMSHARP, "fromC" : 10};

// dict keys collects above objects
var dictKeys = {
	"Cnatural" : kC,
	"Dflat" : kDflat,
	"Dnatural" : kD,
	"Eflat" : kEflat,
	"Enatural" : kE,
	"Fnatural" : kF,
	"Gflat" : kGflat,
	"Gnatural" : kG,
	"Aflat" : kAflat,
	"Anatural" : kA,
	"Bflat" : kBflat,
	"Bnatural" : kB,
	"Csharp" : kCsharp,
	"Fsharp" : kFsharp,
	"Gsharp" : kGsharp,
	"Asharp" : kAsharp};



// old
//var INTS_FLATS = ['R', '&#9837;9', '9', '&#9837;3', '3', '11', '&#9837;5', '5', '&#9837;13', '13', '&#9837;7', '7'];
//var INTS_SHARP4 = ['R', '&#9837;9', '9', '&#9837;3', '3', '11', '&#9839;11', '5', '&#9837;13', '13', '&#9837;7', '7'];
//var INTS_DOM = ['R', '&#9837;9', '9', '&#9839;9', '3', '11', '&#9837;5', '5', '&#43;5', '13', '&#9837;7', '7'];

//var INTS_SHARP4AUG = ['R', '&#9837;9', '9', '&#9837;3', '3', '11', '&#9839;11', '5', '&#43;5', '13', '&#9837;7', '7'];
//var INTS_DIM = ['R', '&#9837;9', '9', '&#9837;3', '3', '11', '&#9837;5', '5', '&#43;5', '&#9837;&#9837;7', '&#9837;7', '7'];
//var INTS_SUPERLOCRIAN = ['R', '&#9837;9', '9', '&#9837;3', '&#9837;4', '11', '&#9837;5', '5', '&#9837;13', '13', '&#9837;7', '7'];



var dictInt = {
'ROOT': {
	'SEMI' : 0,
	'INT' : 'R',
	'CLR' : 'i_root'
},

'FLATNINE' : {
	'SEMI' : 1,
	'INT' : '&#9837;9',
	'CLR' : 'i_flatnine'
},

'NINE' : {
	'SEMI' : 2,
	'INT' : '9',
	'CLR' : 'i_flatnine'
},

'SHARPNINE' : {
	'SEMI' : 3,
	'INT' : '&#9839;9',
	'CLR' : 'i_sharpnine'
},

'FLATTHREE' : {
	'SEMI' : 3,
	'INT' : '&#9837;3',
	'CLR' : 'i_third'
},

'THIRD' : {
	'SEMI' : 4,
	'INT' : '3',
	'CLR' : 'i_third'
},

'DIMELEVEN' : {
	'SEMI' : 4,
	'INT' : '&#9837;11',
	'CLR' : 'i_fourth'
},

'ELEVEN' : {
	'SEMI' : 5,
	'INT' : '11',
	'CLR' : 'i_fourth'
},

'SHARPELEVEN' : {
	'SEMI' : 6,
	'INT' : '&#9839;11',
	'CLR' : 'i_fourth'
},

'FLATFIVE' : {
	'SEMI' : 6,
	'INT' : '&#9837;5',
	'CLR' : 'i_fifth'
},

'FIFTH' : {
	'SEMI' : 7,
	'INT' : '5',
	'CLR' : 'i_fifth'
},

'AUGFIVE' : {
	'SEMI' : 8,
	'INT' : '&#43;5',
	'CLR' : 'i_fifth'
},

'FLATTHIRTEEN' : {
	'SEMI' : 8,
	'INT' : '&#9837;13',
	'CLR' : 'i_sixth'
},

'THIRTEEN' : {
	'SEMI' : 9,
	'INT' : '13',
	'CLR' : 'i_sixth'
},

'AUGTHIRTEEN' : {
	'SEMI' : 10,
	'INT' : '&#43;13',
	'CLR' : 'i_sixth'
},

'DBLFLATSEVEN' : {
	'SEMI' : 10,
	'INT' : '&#9837;&#9837;7',
	'CLR' : 'i_seventh'
},

'FLATSEVEN' : {
	'SEMI' : 10,
	'INT' : '&#9837;7',
	'CLR' : 'i_seventh'
},

'SEVENTH' : {
	'SEMI' : 11,
	'INT' : '7',
	'CLR' : 'i_seventh'
},

'TX' : {
	// tone outside of scale, inherit semitone and int
	'SEMI' : -1,
	'INT' : '',
	'CLR' : 'white'
},

'TI' : {
	// tone in scale, inherit semitone and int
	'SEMI' : -1,
	'INT' : '',
	'CLR' : 'black'
},

'TP' : {
	// passing tone in scale, inherit semitone and int
	'SEMI' : -1,
	'INT' : '',
	'CLR' : 'i_passing'
}
}

var INTS_FLATS = [dictInt.ROOT.INT, dictInt.FLATNINE.INT, dictInt.NINE.INT, dictInt.FLATTHREE.INT, dictInt.THIRD.INT, dictInt.ELEVEN.INT, dictInt.FLATFIVE.INT, dictInt.FIFTH.INT, dictInt.FLATTHIRTEEN.INT, dictInt.THIRTEEN.INT, dictInt.FLATSEVEN.INT, dictInt.SEVENTH.INT];
var INTS_SHARP4 = [dictInt.ROOT.INT, dictInt.FLATNINE.INT, dictInt.NINE.INT, dictInt.FLATTHREE.INT, dictInt.THIRD.INT, dictInt.ELEVEN.INT, dictInt.SHARPELEVEN.INT, dictInt.FIFTH.INT, dictInt.FLATTHIRTEEN.INT, dictInt.THIRTEEN.INT, dictInt.FLATSEVEN.INT, dictInt.SEVENTH.INT];
var INTS_DOM = [dictInt.ROOT.INT, dictInt.FLATNINE.INT, dictInt.NINE.INT, dictInt.SHARPNINE.INT, dictInt.THIRD.INT, dictInt.ELEVEN.INT, dictInt.FLATFIVE.INT, dictInt.FIFTH.INT, dictInt.AUGFIVE.INT, dictInt.THIRTEEN.INT, dictInt.FLATSEVEN.INT, dictInt.SEVENTH.INT];

var INTS_SHARP4AUG = [dictInt.ROOT.INT, dictInt.FLATNINE.INT, dictInt.NINE.INT, dictInt.FLATTHREE.INT, dictInt.THIRD.INT, dictInt.ELEVEN.INT, dictInt.SHARPELEVEN.INT, dictInt.FIFTH.INT, dictInt.AUGFIVE.INT, dictInt.THIRTEEN.INT, dictInt.FLATSEVEN.INT, dictInt.SEVENTH.INT];
var INTS_DIM = [dictInt.ROOT.INT, dictInt.FLATNINE.INT, dictInt.NINE.INT, dictInt.FLATTHREE.INT, dictInt.THIRD.INT, dictInt.ELEVEN.INT, dictInt.FLATFIVE.INT, dictInt.FIFTH.INT, dictInt.AUGFIVE.INT, dictInt.DBLFLATSEVEN.INT, dictInt.FLATSEVEN.INT, dictInt.SEVENTH.INT];
var INTS_SUPERLOCRIAN = [dictInt.ROOT.INT, dictInt.FLATNINE.INT, dictInt.NINE.INT, dictInt.SHARPNINE.INT, dictInt.DIMELEVEN.INT, dictInt.ELEVEN.INT, dictInt.FLATFIVE.INT, dictInt.FIFTH.INT, dictInt.AUGFIVE.INT, dictInt.THIRTEEN.INT, dictInt.FLATSEVEN.INT, dictInt.SEVENTH.INT];



// Scale Formulas
var IF_IONIAN = [dictInt.ROOT, dictInt.TX, dictInt.TI, dictInt.TX, dictInt.THIRD, dictInt.TI, dictInt.TX, dictInt.FIFTH, dictInt.TX, dictInt.TI, dictInt.TX, dictInt.SEVENTH];
var IF_LYDIAN = [dictInt.ROOT, dictInt.TX, dictInt.TI, dictInt.TX, dictInt.THIRD, dictInt.TX, dictInt.SHARPELEVEN, dictInt.FIFTH, dictInt.TX, dictInt.TI, dictInt.TX, dictInt.SEVENTH];
var IF_MIXOLYDIAN = [dictInt.ROOT, dictInt.TX, dictInt.TI, dictInt.TX, dictInt.THIRD, dictInt.TI, dictInt.TX, dictInt.FIFTH, dictInt.TX, dictInt.TI, dictInt.FLATSEVEN, dictInt.TX];
var IF_DORIAN = [dictInt.ROOT, dictInt.TX, dictInt.TI, dictInt.FLATTHREE, dictInt.TX, dictInt.TI, dictInt.TX, dictInt.FIFTH, dictInt.TX, dictInt.TI, dictInt.FLATSEVEN, dictInt.TX];
var IF_AEOLIAN = [dictInt.ROOT, dictInt.TX, dictInt.TI, dictInt.FLATTHREE, dictInt.TX, dictInt.TI, dictInt.TX, dictInt.FIFTH, dictInt.FLATTHIRTEEN, dictInt.TX, dictInt.FLATSEVEN, dictInt.TX];
var IF_PHRYGIAN = [dictInt.ROOT, dictInt.FLATNINE, dictInt.TX, dictInt.FLATTHREE, dictInt.TX, dictInt.TI, dictInt.TX, dictInt.FIFTH, dictInt.FLATTHIRTEEN, dictInt.TX, dictInt.FLATSEVEN, dictInt.TX];
var IF_LOCRIAN = [dictInt.ROOT, dictInt.FLATNINE, dictInt.TX, dictInt.FLATTHREE, dictInt.TX, dictInt.TI, dictInt.FLATFIVE, dictInt.TX, dictInt.FLATTHIRTEEN, dictInt.TX, dictInt.FLATSEVEN, dictInt.TX];


// scales
/// guide         = ["ROOT", "FLAT_NINE","NINE","FLAT_THREE","THIRD","ELEVEN","FLAT_FIVE","FIFTH","FLAT_THIRTEEN","THIRTEEN","FLAT_SEVEN","SEVENTH"];

var INTCLR_IONIAN = ["i_root", "white","black","white","i_third","black","white","i_fifth","white","black","white","i_seventh"];
var INTCLR_LYDIAN = ["i_root", "white","black","white","i_third","white","black","i_fifth","white","black","white","i_seventh"];
var INTCLR_MIXOLYDIAN = ["i_root", "white","black","white","i_third","black","white","i_fifth","white","black","i_seventh","white"];
var INTCLR_DORIAN = ["i_root", "white","black","i_third","white","black","white","i_fifth","white","black","i_seventh","white"];
var INTCLR_AEOLIAN = ["i_root", "white","black","i_third","white","black","white","i_fifth","black","white","i_seventh","white"];
var INTCLR_PHRYGIAN = ["i_root","black","white","i_third","white","black","white","i_fifth","black","white","i_seventh","white"];
var INTCLR_LOCRIAN = ["i_root","black","white","i_third","white","black","i_fifth","white","black","white","i_seventh","white"];
var INTCLR_AEOLIAN = ["i_root", "white","black","i_third","white","black","white","i_fifth","black","white","i_seventh","white"];
var INTCLR_SYMDIM = ["i_root", "black","white","i_third","black","white","i_fifth","black","white","i_seventh","black","white"];
var INTCLR_MINHARM = ["i_root", "white","black","i_third","white","black","white","i_fifth","black","white","white","i_seventh"];
var INTCLR_MINMEL = ["i_root", "white","black","i_third","white","black","white","i_fifth","white","black","white","i_seventh"];
var INTCLR_ALTERED = ["i_root", "black","white","i_third","black","white","i_fifth","white","black","white","i_seventh","white"];
var INTCLR_LYDDOM = ["i_root", "white","black","white","i_third","white","black","i_fifth","white","black","i_seventh","white"];
var INTCLR_PHRYGDOM = ["i_root","black","white","white","i_third","black","white","i_fifth","black","white","i_seventh","i_passing"];
var INTCLR_LYDAUG = ["i_root", "white","black","white","i_third","white","black","white","i_fifth","black","white","i_seventh"];
var INTCLR_PENTMIN = ["i_root", "white","white","i_third","white","black","white","i_fifth","white","white","i_seventh","white"];
var INTCLR_PENTMAJ = ["i_root", "white","black","white","i_third","white","white","i_fifth","white","black","white","white"];
var INTCLR_PENTDOM = ["i_root", "white","black","white","i_third","white","white","i_fifth","white","white","black","white"];
var INTCLR_PENTMINMEL = ["i_root", "white","black","i_third","white","white","white","i_fifth","white","black","white","white"];

var SC_MAJOR =  { "ngtype": SCALE, "varname" : "MAJOR", "name" : "Ionian", "intnames": INTS_FLATS, "color" : INTCLR_IONIAN };
var SC_LYDIAN =  { "ngtype": SCALE, "varname" : "LYDIAN", "name" : "Lydian", "intnames": INTS_SHARP4, "color" : INTCLR_LYDIAN };
var SC_MIXOLYDIAN =  { "ngtype": SCALE, "varname" : "MIXOLYDIAN", "name" : "Mixolydian", "intnames": INTS_DOM, "color" : INTCLR_MIXOLYDIAN };
var SC_DORIAN =  { "ngtype": SCALE,"varname" : "DORIAN", "name" : "Dorian", "intnames": INTS_FLATS, "color" : INTCLR_DORIAN };
var SC_AEOLIAN =  { "ngtype": SCALE, "varname" : "AEOLIAN", "name" : "Aeolian", "intnames": INTS_FLATS, "color" : INTCLR_AEOLIAN };
var SC_PHRYGIAN =  { "ngtype": SCALE, "varname" : "PHRYGIAN", "name" : "Phrygian", "intnames": INTS_FLATS, "color" : INTCLR_PHRYGIAN };
var SC_LOCRIAN =  { "ngtype": SCALE, "varname" : "LOCRIAN","name" : "Locrian", "intnames": INTS_FLATS, "color" : INTCLR_LOCRIAN };
var SC_DIMINISHED =  { "ngtype": SCALE, "varname" : "DIMINISHED", "name" : "Symmetrical Diminished", "intnames": INTS_DIM, "color" : INTCLR_SYMDIM };
var SC_MINHARM =  { "ngtype": SCALE, "varname" : "MINHARM", "name" : "Harmonic Minor", "intnames": INTS_FLATS, "color" : INTCLR_MINHARM };
var SC_MINMEL =  { "ngtype": SCALE, "varname" : "MINMEL", "name" : "Melodic Minor", "intnames": INTS_FLATS, "color" : INTCLR_MINMEL };
var SC_ALTERED =  { "ngtype": SCALE, "varname" : "ALTERED", "name" : "Altered", "intnames": INTS_SUPERLOCRIAN, "color" : INTCLR_ALTERED };
var SC_LYDIANDOM =  { "ngtype": SCALE, "varname" : "LYDIANDOM", "name" : "Lydian Dominant", "intnames": INTS_SHARP4, "color" : INTCLR_LYDDOM };
var SC_PHRYGDOM =  { "ngtype": SCALE, "varname" : "PHRYGDOM", "name" : "Phrygian Dominant", "intnames": INTS_FLATS, "color" : INTCLR_PHRYGDOM };
var SC_LYDIANAUG =  { "ngtype": SCALE, "varname" : "LYDIANAUG", "name" : "Lydian Augmented", "intnames": INTS_SHARP4AUG, "color" : INTCLR_LYDAUG };
var SC_MINNAT =  { "ngtype": SCALE, "varname" : "MINNAT", "name" : "Natural Minor", "intnames": INTS_FLATS, "color" : INTCLR_AEOLIAN };
var SC_MINJAZZ =  { "ngtype": SCALE, "varname" : "MINJAZZ", "name" : "Jazz Minor", "intnames": INTS_FLATS, "color" : INTCLR_MINMEL };

var SC_PENTMIN =  { "ngtype": SCALE, "varname" : "PENTMIN", "name" : "Minor Pentatonic", "intnames": INTS_FLATS, "color" : INTCLR_PENTMIN };
var SC_PENTMAJ =  { "ngtype": SCALE, "varname" : "PENTMAJ", "name" : "Major Pentatonic", "intnames": INTS_FLATS, "color" : INTCLR_PENTMAJ };
var SC_PENTDOM =  { "ngtype": SCALE, "varname" : "PENTDOM", "name" : "Dominant Pentatonic", "intnames": INTS_FLATS, "color" : INTCLR_PENTDOM };
var SC_PENTMELMIN =  { "ngtype": SCALE, "varname" : "PENTMELMIN", "name" : "Pentatonic Melodic Minor", "intnames": INTS_FLATS, "color" : INTCLR_PENTMINMEL };


var dictScales = {
	"SC_MAJOR": SC_MAJOR,
	"SC_LYDIAN": SC_LYDIAN,
	"SC_MIXOLYDIAN": SC_MIXOLYDIAN,
	"SC_DORIAN": SC_DORIAN,
	"SC_AEOLIAN": SC_AEOLIAN,
	"SC_PHRYGIAN": SC_PHRYGIAN,
	"SC_LOCRIAN": SC_LOCRIAN,
	"SC_DIMINISHED": SC_DIMINISHED,
	"SC_PENTMIN": SC_PENTMIN,
	"SC_PENTMAJ": SC_PENTMAJ,
	"SC_PENTDOM": SC_PENTDOM,
	"SC_MINHARM": SC_MINHARM,
	"SC_MINMEL": SC_MINMEL,
	"SC_ALTERED": SC_ALTERED,
	"SC_LYDIANDOM": SC_LYDIANDOM,
	"SC_PHRYGDOM": SC_PHRYGDOM,
	"SC_LYDIANAUG": SC_LYDIANAUG,
	"SC_MINNAT": SC_MINNAT,
	"SC_PENTMELMIN": SC_PENTMELMIN,
	//"SC_MINJAZZ": SC_MINJAZZ
	};

var ScaleModel = {

	"scale" : dictScales["SC_MAJOR"]
	,
	"setScale" : function(newScale){
			this["scale"] = dictScales[newScale];
		}
	,
	"getIntColorArr" : function(){
			var s = this["scale"];
			return s["color"];
		}
	,
	"getIntNamesArr" : function(){
			var s = this["scale"];
			return s["intnames"];
		}
	,
	"getScaleName" : function(){
			var s = this["scale"];
			return s["name"];
		}


	};




//arps
var INTCLR_MAJ = ["i_root", "white","white","white","i_third","white","white","i_fifth","white","white","white","white"];
var INTCLR_MAJ7 = ["i_root", "white","white","white","i_third","white","white","i_fifth","white","white","white","i_seventh"];
var INTCLR_DOM7 = ["i_root", "white","white","white","i_third","white","white","i_fifth","white","white","i_seventh","white"];
var INTCLR_MIN = ["i_root", "white","white","i_third","white","white","white","i_fifth","white","white","white","white"];
var INTCLR_MIN7 = ["i_root", "white","white","i_third","white","white","white","i_fifth","white","white","i_seventh","white"];
var INTCLR_MIN7b5 = ["i_root", "white","white","i_third","white","white","i_fifth","white","white","white","i_seventh","white"];
var INTCLR_DIM = ["i_root", "white","white","i_third","white","white","i_fifth","white","white","i_seventh","white","white"];

var ARP_MAJ =  { "ngtype": ARP, "varname" : "MAJ", "name" : "maj", "intnames": INTS_FLATS, "color" : INTCLR_MAJ };
var ARP_MAJ7 =  { "ngtype": ARP, "varname" : "MAJ7", "name" : "maj7", "intnames": INTS_SHARP4, "color" : INTCLR_MAJ7 };
var ARP_DOM7 =  { "ngtype": ARP, "varname" : "DOM7", "name" : "7", "intnames": INTS_DOM, "color" : INTCLR_DOM7 };
var ARP_MIN =  { "ngtype": ARP, "varname" : "MIN", "name" : "min", "intnames": INTS_FLATS, "color" : INTCLR_MIN };
var ARP_MIN7 =  { "ngtype": ARP, "varname" : "MIN7", "name" : "min7", "intnames": INTS_FLATS, "color" : INTCLR_MIN7 };
var ARP_MIN7b5 =  { "ngtype": ARP, "varname" : "MIN7b5", "name" : "min7&#9837;5", "intnames": INTS_FLATS, "color" : INTCLR_MIN7b5 };
var ARP_DIM =  { "ngtype": ARP, "varname" : "DIM", "name" : "dim", "intnames": INTS_DIM, "color" : INTCLR_DIM };


var dictArps = {
	"ARP_MAJ" : ARP_MAJ,
	"ARP_MAJ7" : ARP_MAJ7,
	"ARP_DOM7" : ARP_DOM7,
	"ARP_MIN" : ARP_MIN,
	"ARP_MIN7" : ARP_MIN7,
	"ARP_MIN7b5" : ARP_MIN7b5,
	"ARP_DIM" : ARP_DIM
}



var CHD_MAJDROP2 =  { "name" : "MAJ7", "intnames": INTS_FLATS, "color" : INTCLR_MAJ7 };

var dictChords={
	//"CHD_MAJDROP2" : CHD_MAJDROP2
	}

var Notegroups = {
	"MAJ":ARP_MAJ,
	"MAJ7":ARP_MAJ7,
	"DOM7":ARP_DOM7,
	"MIN":ARP_MIN,
	"MIN7":ARP_MIN7,
	"MIN7b5":ARP_MIN7b5,
	"DIM":ARP_DIM,
	"MAJOR":SC_MAJOR,
	"LYDIAN":SC_LYDIAN,
	"MIXOLYDIAN":SC_MIXOLYDIAN,
	"DORIAN":SC_DORIAN,
	"AEOLIAN":SC_AEOLIAN,
	"PHRYGIAN":SC_PHRYGIAN,
	"LOCRIAN":SC_LOCRIAN,
	"DIMINISHED":SC_DIMINISHED,
	"MINHARM":SC_MINHARM,
	"MINMEL":SC_MINMEL,
	"ALTERED":SC_ALTERED,
	"LYDIANDOM":SC_LYDIANDOM,
	"PHRYGDOM":SC_PHRYGDOM,
	"LYDIANAUG":SC_LYDIANAUG,
	"MINNAT":SC_MINNAT,
	"MINJAZZ":SC_MINJAZZ,
	"PENTMIN":SC_PENTMIN,
	"PENTMAJ":SC_PENTMAJ,
	"PENTDOM":SC_PENTDOM,
	"PENTMELMIN":SC_PENTMELMIN
}

var FretboardModel = {
	// model to hold current Key, Notegroup and NG type for fretboard
	"chromNames" : CHROMFLAT,
	"key" : kC,
	"ng" : "SC_MAJOR",
	"ngType" : dictScales,

	"getChromNames" : function(){
			var cn = this["chromNames"];
			return cn;
		},
	"setChromNames" : function(cn){
		this["chromNames"] = cn;
	},
	"getKeyObj" : function(){
			var kObj = this["key"];
			return kObj;
		},
	"getKeyTextName" : function(){
		// return text html name for CURRENT key
			var kObj = this["key"];
			return kObj["name"];
		},

	"getKeySafeName" : function(){
		// returns safename for CURRENT key
			var kObj= this["key"];
			return kObj["safename"];
		},

	"getKeyInt" : function(){
		// returns int for CURRENT key
			var kObj = this["key"];
			return kObj["fromC"];
		},
	"setKey" : function(kObj){
			this["key"] = kObj;
			var keyInt = kObj.fromC;
			var basescale = kObj.baseScale;
			var newscale = new Array();
			var arrLen = basescale.length;
			for(var i=0, j=keyInt; i < arrLen; i++, j++){
				if(j==arrLen){j=0};
				var t = basescale[j];
				newscale[i] = basescale[j];
			}
			// chrom names array will start with KEY as root
			this["chromNames"] = newscale;
		},

	"getNotegroupDict" : function(){
		// returns CURRENT ng dictionary
			var d = this["ngType"];
			return d;
		},

	"getNotegroup" : function(){
			var dict = this["ngType"];
			var ng = dict[this["ng"]];
			return ng;
		},

	"setNotegroup" : function(ng, typeDict){
			if(arguments.length < 2){
				arr = ng.split('_');
				switch(arr[0]){
					case "SC":
						this["ngType"] = dictScales;
						break;
					case "ARP":
						this["ngType"] = dictArps;
						break;
					case "CHD":
						this["ngType"] = dictArps;
						break;
				}
			} else {
				this["ngType"] = typeDict;
			}

			this["ng"] = ng;

			if(QUIZZING == ST_QUIZZING_INTERVAL){
				ctl_updateQuizzingInterval(false);
			}
		},

	"getNGname" : function(){
			var dict = this["ngType"];
			var ng = dict[this["ng"]];
			return ng["name"];
	},

	"getNGintcolor" : function(){
			return this["ngType"][this["ng"]]["color"];
	},
	"getNGintnames" : function(){
			var dict = this["ngType"];
			var ng = dict[this["ng"]];
			return ng["intnames"]; // returns array of html texts
	},

};
