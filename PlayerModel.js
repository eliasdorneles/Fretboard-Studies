// JavaScript Document

var PS_STOPPED = "STOPPED";
var PS_PLAYING = "PLAYING";
var PS_PAUSED = "PS_PAUSED";
var DIR_FWD = "FORWARD";
var DIR_BACK = "BACKWARD";

var PlayerModel = {
	
	"aNoteGroupDivs" : []
	,
	"prevNG" : ""
	,
	
	"i" : 0
	,
	
	"playState" : PS_STOPPED
	,
	
	"looper" : "" //setInterval
	,
	
	"playSpeed" : 2000
	
	,
	
	"setNoteGroupDivs" : function(arr){
			this["aNoteGroupDivs"] = arr; // array of cNoteGroup divs in ngDashbaord
		}
	,
	"getNoteGroupDivs" : function(){
			return this["aNoteGroupDivs"];
		}
	,
	"setPrevNG" : function(ng){
			this["prevNG"] = ng;
		}
	,
	"getPrevNG" : function(){
			return this["prevNG"];
		}
	,
	"setPlaystate" : function(st){
			this["playState"] = st;
		}
	,
	"getPlaystate" : function(){
			return this["playState"];
		}
	,
	"setLooper" : function(interval){
			this["looper"] = interval;
		}
	,
	"getLooper" : function(){
			return this["looper"];
		}
			,
	"setPlaySpeed" : function(speed){
			this["playSpeed"] = Number(speed);
			if(this["playState"] == PS_PLAYING){
				this.setPlaystate(PS_PAUSED);
				clearInterval(this["looper"]);
				this.setLooper(setInterval(function(){animateNotegroups(true);},Number(speed)));
				//this["looper"] = setInterval(function(){animateNotegroups();},Number(speed));
				this.setPlaystate(PS_PLAYING);
			}
		}
	,
	"getPlaySpeed" : function(){
			return this["playSpeed"];
		}
	,
	"getNextNG" : function(){
		var arr =  this.aNoteGroupDivs;
		var ng = arr[this.i];
		this.prevNG = ng;
		this.i = (this.i +1) % this.aNoteGroupDivs.length;
		return ng;
	}
	,
	"getNextNGBack" : function(){
		var arr =  this.aNoteGroupDivs;
		this.prevNG = arr[this.i];
		this.i = ((this.i - 1) + this.aNoteGroupDivs.length) % this.aNoteGroupDivs.length;
		var ng = arr[this.i];
		return ng;
	}
	,
	
	"reloadNotegroups" : function(ngDiv){
		this["aNoteGroupDivs"] = ngDiv.children().toArray(); 
		// strip out playing css?
		this["i"] = 0;
		this["prevNG"] = this.aNoteGroupDivs[this.aNoteGroupDivs.length -1];
	}

}

var ctl_changeSpeed = function(){
		var timerSpeed = Math.round(1000 * 60 / $('#dashSpeed').val() );
		mPlayer.setPlaySpeed(timerSpeed);
	}

var ctl_stopPlayer = function(){
		mPlayer.setPlaystate(PS_STOPPED);
		clearInterval(mPlayer.getLooper());
		//remove all playing css in notegroups?
		var arr = mPlayer.getNoteGroupDivs();
		for(var ng in mPlayer.getNoteGroupDivs()){
			if($(arr[ng]).hasClass("playing") ){
			$(arr[ng]).removeClass("playing");	
		}
		}
		$('#dashPlayStop').val("Play");
	}

var ctl_playPlayer = function(){
		if($('#ngDashboard').children().length > 1){
			if(mPlayer.getPlaystate()!=PS_PAUSED){
				mPlayer.reloadNotegroups($('#ngDashboard'));
				//animateNotegroups(true);
			}
			if(mPlayer.getPlaystate()==PS_PAUSED){
				//animateNotegroups(true);
			}
			mPlayer.setPlaystate(PS_PLAYING);
			$('#dashPlayStop').val("Stop");	
			if(mPlayer.i == 0){
			animateNotegroups(true); // animate once to start instantly; true == forward
			}
			mPlayer.setLooper(setInterval(function(){animateNotegroups(true);},mPlayer.getPlaySpeed()));	
		} else {
			ctl_stopPlayer();
		}
	}
	
var ctl_pausePlayer = function(dir){
		PS_PAUSED.direction = dir;
		mPlayer.setPlaystate(PS_PAUSED);
		clearInterval(mPlayer.getLooper());
		$('#dashPlayStop').val("Play");
	}
	
var ctl_backPlayer = function(){
		var wasPlaySt = mPlayer.getPlaystate(); 
		ctl_pausePlayer(DIR_BACK);
		//mPlayer.setPlaystate(PS_PAUSEDBACK);
		
		animateNotegroups(false);
		
	}

var ctl_fwdPlayer= function(){
		var wasPlaySt = mPlayer.getPlaystate(); 
		ctl_pausePlayer(DIR_FWD);
		//mPlayer.setPlaystate(PS_PAUSEDFWD);
		
		animateNotegroups(true);
		
	}
	
var animateNotegroups = function(goForward){
	if(goForward){
		var prvNg = mPlayer.getPrevNG();
		if(prvNg != "" && $(prvNg).hasClass("playing") ){
			$(prvNg).removeClass("playing");	
			}
		var ng = $(mPlayer.getNextNG());
		ng.addClass("playing");
		var abDivArrID = ng.context.attributes["notegroup"].value.split('_');
		set_notes_per_notegroup(abDivArrID[0], abDivArrID[1], abDivArrID[2]);
	} else {
		var ng = $(mPlayer.getNextNGBack());
		ng.addClass("playing");
		var abDivArrID = ng.context.attributes["notegroup"].value.split('_');
		set_notes_per_notegroup(abDivArrID[0], abDivArrID[1], abDivArrID[2]);
		
		var prvNg = mPlayer.getPrevNG();
		if(prvNg != "" && $(prvNg).hasClass("playing") ){
			$(prvNg).removeClass("playing");	
		}
		
	}
}