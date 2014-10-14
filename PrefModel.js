var INTSCHEME_A = "A";// constant
var INTSCHEME_B = "B";// constant

var PrefModel = {

  // intScheme : INTSCHEME_A
  // ,
  // rrq_LoFret : 0
  // ,
  // rrq_HiFret : 0
  // ,
  // rrq_Notegroups : []
  // ,
  notegroups: []
  ,
  aPrefs :
      {
        intScheme : INTSCHEME_A,
        riq_LoFret : 0,
        riq_HiFret :19,
        riq_StrDepth : 5,
        riq_FretDepth : 5,
        rrq_LoFret: 0,
        rrq_HiFret: 19,
        rrq_LoStr: 1,
        rrq_HiStr: 6,
        rrq_Notegroups : [],
      },
  usingUserPrefs:false
      ,
  is_chrome :false
      ,
  init : function(aNotegroups, maxFret, maxString){
    this.aPrefs.rrq_HiFret = this.aPrefs.riq_HiFret = maxFret;
    this.aPrefs.rrq_HiStr = this.aPrefs.riq_HiStr = maxString;
    // local chrome will not save cookies
    this.is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    this.aPrefs.rrq_Notegroups = [];
    for(ng in aNotegroups){
      // Note: only pushing scales not arps or anything else
      this.aPrefs.rrq_Notegroups.push([dictScales[ng].ngtype+'_'+dictScales[ng].varname, true]);
    }

  }
  ,

  writePrefCookie : function(){
    // put form values in mPref.aPrefs and save to cookie, or local storage if chrome

    mPref.aPrefs.riq_LoFret =  $('#spRIQ_LoFret').spinner( "value" );
    mPref.aPrefs.riq_HiFret =  $('#spRIQ_HiFret').spinner( "value" );
    mPref.aPrefs.riq_StrDepth =  $('#spRIQ_StrDepth').spinner( "value" );
    mPref.aPrefs.riq_FretDepth =  $('#spRIQ_FretDepth').spinner( "value" );

    // random root
    mPref.aPrefs.rrq_LoFret = $('#spRR_LoFret').spinner( "value" );
    mPref.aPrefs.rrq_HiFret = $('#spRR_HiFret').spinner( "value" );
    mPref.aPrefs.rrq_LoStr = $('#spRR_LoStr').spinner( "value" );
    mPref.aPrefs.rrq_HiStr = $('#spRR_HiStr').spinner( "value" );
    // go through Notegroup inputs in the preferences popup and align with aPrefs.rrq_Notegroups
    // 0 is name and 1 is true or false (checked or unchecked)
    for (var ng in mPref.aPrefs.rrq_Notegroups){
      if($('#prefRRQ_'+mPref.aPrefs.rrq_Notegroups[ng][0]).is(':checked')){
        mPref.aPrefs.rrq_Notegroups[ng][1] = true;
      } else{
        mPref.aPrefs.rrq_Notegroups[ng][1] = false;
      }
    }
    //set cookies
    if(this.is_chrome){
      var data = this.aPrefs;
      $.localStorage('fs_userPrefs', data);
    }
    else {
      $.cookie('fs_userPrefs', this.aPrefs);
    }

    var testStorage;
    // test cookie
    if(this.is_chrome){
        testStorage = $.localStorage('fs_userPrefs');
      }else{
        testStorage = $.cookie('fs_userPrefs')
      }
    //fs_userPrefs =(this.is_chrome)?$.localStorage('fs_userPrefs'):$.cookie('fs_userPrefs');
    alert('wrote: '+testStorage);
  }
  ,
  retrieveUserPrefs : function(){

    // cookie test-- Chrome does not save cookie if there is no webserver
    // $.cookie('test_cookie', 'test', { expires: 1 });
    // cookietest = $.cookie('test_cookie'); // => "the_value"
    // $.removeCookie('test_cookie');

    //get cookies-- Chrome does not save cookie if there is no webserver; must use storage
    var fs_userPrefs = null;
    //fs_userPrefs =(is_chrome)?$.localStorage('fs_userPrefs'):$.cookies.get('fs_userPrefs');

    if (this.is_chrome){
      fs_userPrefs = $.localStorage('fs_userPrefs');
    }else{
      fs_userPrefs = $.cookie('fs_userPrefs');
    }
    if(fs_userPrefs!=null ){
      var storageGood = false;
      try {
        if(fs_userPrefs.rrq_Notegroups.length >1){
        storageGood = true}
      }
      catch (e) {
         // statements to handle any exceptions
         storageGood = false;
      }
      if(storageGood){
        this.aPrefs = fs_userPrefs;
        this.usingUserPrefs = true;
      }
    }
    //alert( fs_userPrefs +' '+fs_userPrefs.rrq_LoFret+' '+fs_userPrefs.rrq_HiFret);

  },
  removePrefCookie : function(){
    if(this.is_chrome){
        $.localStorage('fs_userPrefs', null)
    } else {
        $.removeCookie('fs_userPrefs');
    }
  }
  ,
  notegroupInPrefs : function(ngKey){
    var rBool = false;
    var nGrps = this.aPrefs.rrq_Notegroups
    for(ng in nGrps){
      if(ngKey == nGrps[0][0].varname){
        rBool = true;
      }
    }
    return rBool;
  }
  ,
  checkAllNotegroups : function(){
      for (var ng in mPref.aPrefs.rrq_Notegroups){
        mPref.aPrefs.rrq_Notegroups[ng][1] = true;
      }

  }


}