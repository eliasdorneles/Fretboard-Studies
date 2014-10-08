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
        rrq_LoFret: 0,
        rrq_HiFret: 19,
        rrq_LoStr: 1,
        rrq_HiStr: 6,
        rrq_Notegroups : [],
      },
  init : function(aNotegroups, maxFret, maxString){
    this.aPrefs.rrq_HiFret = maxFret;
    this.aPrefs.rrq_HiStr = maxString;
    for(ng in aNotegroups){
      // Note: only pushing scales not arps or anything else
      this.aPrefs.rrq_Notegroups.push([dictScales[ng].ngtype+'_'+dictScales[ng].varname, true]);
    }
  }
  ,
  usingUserPrefs:false
  ,
  writePrefCookie : function(){
    // put form values in mPref.aPrefs and save to cookie, or local storage if chrome

    // random root
    mPref.aPrefs.rrq_LoFret = $('#spRR_LoFret').spinner().spinner( "value" );
    mPref.aPrefs.rrq_HiFret = $('#spRR_HiFret').spinner().spinner( "value" );
    mPref.aPrefs.rrq_LoStr = $('#spRR_LoStr').spinner().spinner( "value" );
    mPref.aPrefs.rrq_HiStr = $('#spRR_HiStr').spinner().spinner( "value" );
    // go through Notegroup inputs in the preferences popup and align with aPrefs.rrq_Notegroups
    // 0 is name and 1 is true or false (checked or unchecked)
    for (var ng in mPref.aPrefs.rrq_Notegroups){
      if($('#prefRRQ_'+mPref.aPrefs.rrq_Notegroups[ng][0]).is(':checked')){
        mPref.aPrefs.rrq_Notegroups[ng][1] = true;
      } else{
        mPref.aPrefs.rrq_Notegroups[ng][1] = false;
      }
    }


    // local chrome will not save cookies
    var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    //set cookies
    if(is_chrome)$.localStorage('fs_userPrefs', this.aPrefs);
    else $.cookies.set('fs_userPrefs', this.aPrefs);
  }
  ,
  retrieveUserPrefs : function(){
    var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

    //get cookies
    var fs_userPrefs=(is_chrome)?$.localStorage('fs_userPrefs'):$.cookies.get('fs_userPrefs');
    if(fs_userPrefs!=null){
        this.aPrefs = fs_userPrefs;
        this.usingUserPrefs = true;
    }
    //alert( fs_userPrefs +' '+fs_userPrefs.rrq_LoFret+' '+fs_userPrefs.rrq_HiFret);

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


}