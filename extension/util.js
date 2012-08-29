function getAllChildText(e){
  var toRet = '';
  for(var child = e.firstChild; !!child; child = child.nextSibling){
    if(child.nodeType === 3){
      toRet += ' ' + child.nodeValue.trim();
    } else {
      toRet += ' ' + getAllChildText(child).trim();
    }
  }
  return toRet;
}

function transformAllChildText(e, f){
  for(var child = e.firstChild; !!child; child = child.nextSibling){
    if(child.nodeType === 3){
      child.nodeValue = f(child.nodeValue);
    } else {
      transformAllChildText(child, f);
    }
  }
}

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

function hasClass(e, className){
  return (' ' + e.className + ' ').indexOf(' ' + className + ' ') > -1;
}

function hasAnyClass(e, classList){
  return classList.some(function(c){ return hasClass(e, c); });
}

