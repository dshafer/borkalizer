//facebook-specific content script.  Look for "uiStreamStory" elements
var clickedEl = null;

document.addEventListener("mousedown", function(event){
    //right click
    if(event.button == 2) { 
        clickedEl = event.target;
    }
}, true);

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if(request == "getClickedEl") {
      var el = locateStreamStoryParent(clickedEl);
      if(el !== null)
      {
        sendResponse({'value': el.innerHTML});
      }
    }
});

function locateStreamStoryParent(el){
  while((el.tagName != 'BODY')){
    if((el.className.indexOf('genericStreamStory ') > -1)
      ||(el.className.indexOf('fbTimelineUnit ') > -1)){
      return el;
    }
    el = el.parentElement;
  }
  return null;
}