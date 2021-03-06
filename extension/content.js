var borkifiers={
  'bork':{
    translator: Translate.compile_translator(borkborkbork)
  }
}

var idGen = 0;
var getId = function(el){
  if(typeof(getElementUniqueId)==='function'){
    return getElementUniqueId(el);
  } else {
    if(el.id===""){
      el.id=(idGen++).toString();
    }
    return el.id;
  }
}

//generic content script.  page-specific sections should set up a custom contentContainerClasses array
var clickedEl = null;

var port = chrome.extension.connect();
//port.postMessage({command:"getTrainingData"});

port.onMessage.addListener(function(msg){
  if(msg.command === "elementClassified"){
    borkify(msg.id, msg.bin);
  } else if(msg.command === "getClickedElFingerprint"){
    if(clickedEl !== null)
    {
      port.postMessage({
        command:'lastClickedElFingerprint',
        fingerprint:extractFingerprint(clickedEl)
      });
    }
    else
    {
      port.postMessage({
        command:'lastClickedElFingerprint',
        fingerprint:null
      });
    }
  } else if(msg.command === "toggleBork"){
    toggleBork(clickedEl);
  }
});

var originalFingerprints = {};
function hasClass(e, className){
  return (' ' + e.className + ' ').indexOf(' ' + className + ' ') > -1;
}
function hasAnyClass(e, classList){
  return classList.some(function(c){ return hasClass(e, c); });
}
function getAllChildText(e){
  var toRet = '';
  for(var child = e.firstChild; !!child; child = child.nextSibling){
    if(child.nodeType === 3){
      try{
        toRet += ' ' + child.nodeValue.trim();
      } catch(e){
        debugger;
      }
    } else {
      toRet += ' ' + getAllChildText(child).trim();
    }
  }
  return toRet;
}
function transformAllChildText(e, f){
  for(var child = e.firstChild; !!child; child = child.nextSibling){
    if(child.nodeType === 3){
      if(typeof(child.originalText)=='undefined'){
        child.originalText = child.nodeValue;
      }
      child.nodeValue = f.translate(child.originalText);
    } else {
      transformAllChildText(child, f);
    }
  }
}
function removeChildrenWithClass(e, className){
  var els = e.getElementsByClassName(className);
  for(var i=0; i< els.length; i++){
    els[i].parentNode.removeChild(els[i]);
  }
}
function removeChildrenByTag(e, tagName){
  var els = e.getElementsByTagName(tagName);
  for(var i=0; i< els.length; i++){
    els[i].parentNode.removeChild(els[i]);
  }
}
function extractFingerprint(e){
  var id = getId(e);
  var toRet = originalFingerprints[id];
  if(typeof(toRet) == 'undefined'){
    toRet = {id:id};
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
    toRet.data = getAllChildText(n).trim();
    originalFingerprints[id] = toRet;
  }
  return toRet;
}

document.addEventListener("mousedown", function(event){
    //right click
    if(event.button == 2) { 
        clickedEl = locateStreamStoryParent(event.target);
        if(clickedEl != null){
          var id = getId(clickedEl);
          port.postMessage(
            {
              command:'elementRightClicked', 
              fingerprint:extractFingerprint(clickedEl),
              currentState: typeof(borkedElements[id]) != 'undefined' ? borkedElements[id].state : 'none'
            });
        }
    }
}, true);

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

function toggleBork(el){
  var id = getId(el);
  if(typeof(borkedElements[id]) != 'undefined'){
    if((borkedElements[id].state == 'none') || (borkedElements[id].state == 'restored')){
      borkedElements[id].state = borkedElements[id].action;
      el.innerHTML = borkedElements[id].borkedHTML;
    } else {
      borkedElements[id].state = 'restored';
      el.innerHTML = borkedElements[id].originalHTML;
    }
  }
}

var forEach = Array.prototype.forEach;
var borkedElements = {};
function borkify(id, bin){
  //var bin = classify(extractFingerprint(el));
  var lookup = bin;
  var el = eligibleElements[id];
  if(typeof(el)=='undefined'){
    debugger;
  }
  if(typeof(lookup) != 'undefined'){
    if(typeof(lookup.bgcolor) != 'undefined'){
      // change background color of all borkifyDef.containerClasses
      borkifyDef.containerClasses.forEach(function(c){
        forEach.call(el.getElementsByClassName(c), function(bgEl){
          bgEl.style.backgroundColor=lookup.bgcolor;
        });
      });
    }
    if((typeof(lookup.action) != 'undefined') && (lookup.action !== 'none')){
      // save a copy of the original in case we want to revert later
      if(typeof(borkedElements[id]) == 'undefined'){
        borkedElements[id] = {
          action: lookup.action,
          state: lookup.action,
          originalHTML: el.innerHTML
        };
      }
      
      if(typeof(borkifiers[lookup.action])!='undefined'){
        transformAllChildText(el, borkifiers[lookup.action].translator);
      }
      
      borkedElements[id].borkedHTML = el.innerHTML;
    } else {
      if((typeof(borkedElements[id]) != 'undefined') && (borkedElements[id].action != 'none')){
        // we've previously borked this element - need to restore
        borkedElements[id].state = 'restored'
        borkedElements[id].action = 'none';
        el.innerHTML=borkedElements[id].originalHTML;
      }
    }
  }
}

var eligibleElements={};
function reBorkDocument(){
  for(var i in eligibleElements){
    port.postMessage({
      command: 'classifyElement',
      fingerprint:extractFingerprint(eligibleElements[i])
    });
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
        // make sure it's not in one of our contentIgnoreClasses
        if(!hasAnyClass(el, contentIgnoreClasses)){
          var id = getId(el);
          if(typeof(eligibleElements[id])=='undefined'){
            eligibleElements[id]=el;
          }
          port.postMessage({
            command: 'classifyElement',
            fingerprint:extractFingerprint(el)
          });
          }
        }
        for(var j=0; j<response[i].removed.length; j++){
          var el = response[i].removed[j];
          if(typeof(eligibleElements[id])!='undefined'){
            delete eligibleElements[id];
          }
        }
      }
    },
  queries: mutationQueries
});


