var contentContainerClasses = ['genericStreamStory', 'fbTimelineUnit'];

function extractFingerprint(e){
  var n = e.cloneNode(true);
  removeChildrenWithClass(n, 'uiStreamHeadline');
  removeChildrenWithClass(n, '-cx-PRIVATE-fbTimelineUnitActor__root');
  removeChildrenWithClass(n, 'uiStreamHide');
  removeChildrenByTag(n, 'form');
  var toRet = n.innerText;
  return toRet;
}
