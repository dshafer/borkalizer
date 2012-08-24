function getInnerTextFromChildrenClass(e, className){
  var toRet = '';
  var els = e.getElementsByClassName(className);
  for(var i=0; i< els.length; i++){
    toRet += els[i].innerText + ' ';
  }
  return toRet;
}

function getHrefHostnameFromChildrenClass(e, className){
  var toRet = '';
  var els = e.getElementsByClassName(className);
  for(var i=0; i< els.length; i++){
    var a = els[i].getElementsByTagName('a');
    for(var j=0; j< a.length; j++){
      toRet += ' href_' + a.getAttribute('href').match(/:\/\/(.*?)\//)[1].replace('.', '_');
    }
  }
  return toRet;
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