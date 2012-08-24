
//generic content script.  page-specific sections should set up a custom contentContainerClasses array
var clickedEl = null;

chrome.extension.sendMessage({command:"getTrainingData"}, function(response){
  bayes = new classifier.Bayesian();
  bayes.fromJSON(JSON.parse(response));
});

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
    if(request == "getClickedElFingerprint") {
      if(clickedEl !== null)
      {
        sendResponse(extractFingerprint(clickedEl));
      }
      else
      {
        sendResponse({});
      }
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

