(function(){
  var _global = this;
  
  var defaults = {
    'version':'0.1',
    'classes':{
        conservative:{tag:'c',desc:'Conservative',action:'bork',showMenu:true},
        liberal:{tag:'l',desc:'Liberal',action:'bork',showMenu:true},
        apolitical:{tag:'a',desc:'Non-Political',action:'none',showMenu:true},
        unclassified:{tag:'unclassified',desc:'Unclassified',action:'none',showMenu:false}
      },
    'uniqueUserID':uuid.v4(),
    'classifiedIds':[],
    'thresholds':{'c':2,'l':2,'a':1},
    'classificationUrl':'http://borkalizer.com/classified',
    'trainingUrl':'http://borkalizer.com/training',
    'sendIndividualClassificationData':false,
    'sendSummarizedClassificationDataTimer':24*60*60*1000,  // send summarized update every 24 hours by default
    'lastSummarizedClassificationDataSentTS':(new Date()).valueOf()
  };
  var load = function(){
    for(var setting in defaults){
      var val = localStorage[setting];
      if(typeof(val)!='undefined'){
        if(typeof(defaults[setting])==='string'){
          settings[setting]=val;
        } else {
          settings[setting]=JSON.parse(val);
        }
      } else {
        settings[setting]=defaults[setting];
      }
    }
    settings.classLookup = {};
    for(var cat in settings.classes){
      settings.classLookup[settings.classes[cat].tag] = settings.classes[cat];
    }
    settings.classifiedIdLookup = {};
    settings.classifiedIds.forEach(function(i){
      settings.classifiedIdLookup[i[0]]=i[1];
    });
  };
  
  var save = function(){
    for(var setting in defaults){
      if(typeof(defaults[setting])==='string'){
        localStorage[setting]=settings[setting];
      } else {
        localStorage[setting]=JSON.stringify(settings[setting]);
      }
    }
  }
  
  var settings = {};
  settings.load = load;
  settings.save = save;
  settings.load();
  
  // on the first execution, everything will be set to defaults, including uuid.
  // use that as a flag if we need to init localstorage
  if(settings.uniqueUserID === defaults.uniqueUserID){
    settings.save();
  }
  
  // Play nice with browsers
  var _previousRoot = _global.settings;

  // **`noConflict()` - reset global 'settings' var**
  settings.noConflict = function() {
    _global.settings = _previousRoot;
    return settings;
  }
  _global.settings = settings;
})();

debugger;