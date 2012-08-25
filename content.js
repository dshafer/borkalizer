
//generic content script.  page-specific sections should set up a custom contentContainerClasses array
var clickedEl = null;

var bayes;
chrome.extension.sendMessage({command:"getTrainingData"}, function(response){
  bayes = new classifier.Bayesian();
  bayes.fromJSON(JSON.parse(response));
});

var originalFingerprints = {};
function extractFingerprint(e){
  var toRet = originalFingerprints[e.id];
  if(typeof(toRet) == 'undefined'){
    var n = e.cloneNode(true);
    if(typeof(fingerprintDef) != 'undefined'){
      if(typeof(fingerprintDef.classesToExclude) != 'undefined'){
        for(var i = 0; i < fingerprintDef.classesToExclude.length; i++){
          removeChildrenWithClass(n, fingerprintDef.classesToExclude[i]);
        }
      }
      if(typeof(fingerprintDef.tagsToExclude) != 'undefined'){
        for(var i = 0; i < fingerprintDef.tagsToExclude.length; i++){
          removeChildrenByTag(n, fingerprintDef.tagsToExclude[i]);
        }
      }
    }
    toRet = getAllChildText(n);
    originalFingerprints[e.id] = toRet;
  }
  return toRet.trim();
}

document.addEventListener("mousedown", function(event){
    //right click
    if(event.button == 2) { 
        clickedEl = locateStreamStoryParent(event.target);
        if(clickedEl != null){
          var bin =  bayes.classify(extractFingerprint(clickedEl));
          chrome.extension.sendMessage({command:'elementClassified', data:bin});
        }
    }
}, true);


chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if(request.command === "getClickedElFingerprint") {
      if(clickedEl !== null)
      {
        sendResponse(extractFingerprint(clickedEl));
      }
      else
      {
        sendResponse({});
      }
    } else if(request.command === "updateTrainingData"){
      bayes = new classifier.Bayesian();
      bayes.fromJSON(request.data);
      reBorkDocument();
    }
});

function locateStreamStoryParent(el){
  while((el.tagName != 'BODY')){
    for(var i = 0; i < contentContainerClasses.length; i++){
      if(el.classList.contains(contentContainerClasses[i])){
        return el;
      }
    }
    el = el.parentElement;
  }
  return null;
}


var borkedElements = {};
function borkify(el){
  var bin = bayes.classify(extractFingerprint(el));
  var lookup = DS.classLookup[bin];
  if(typeof(lookup) != 'undefined'){
    if(typeof(lookup.bgcolor != 'undefined')){
      el.style.backgroundColor=lookup.bgcolor;
    }
    if(typeof(lookup.action) != 'undefined'){
      // save a copy of the original in case we want to revert later
      if(typeof(borkedElements[el.id]) == 'undefined'){
        borkedElements[el.id] = {
          action: lookup.action,
          original: el.cloneNode(true)
        };
      }
      
    }
  }
}

var eligibleElements={};
function reBorkDocument(){
  for(var i in eligibleElements){
    borkify(eligibleElements[i]);
  }
}

var mutationQueries = [];
for(var i=0; i<contentContainerClasses.length; i++){
  mutationQueries[i] = {
    element: '.' + contentContainerClasses[i]
  }
}

var idGen=0;
// hook up DOM observers to catch any added elements
var observer = new MutationSummary({
  callback: function(response){
    for(var i=0; i<response.length; i++){
      for(var j=0; j<response[i].added.length; j++){
        var el = response[i].added[j];
        if(el.id===""){
          el.id=(idGen++).toString();
        }
        borkify(el);
        if(typeof(eligibleElements[el.id])=='undefined'){
          eligibleElements[el.id]=el;
        }
      }
      for(var j=0; j<response[i].removed.length; j++){
        var el = response[i].removed[j];
        if(typeof(eligibleElements[el.id])!='undefined'){
          delete eligibleElements[el.id];
        }
      }
    }
  },
  queries: mutationQueries
});


