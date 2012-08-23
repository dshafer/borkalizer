DS = {};

DS.storageIndex = localStorage['storageIndex'];
if((typeof(DS.storageIndex)==='undefined') || (DS.storageIndex === 'null')){
  DS.storageIndex = 0;
}
// Set up the context menus
DS.MenuRootID = chrome.contextMenus.create({
  'title': 'Classify',
  'contexts': ['all']
});

DS.MenuConservativeID = chrome.contextMenus.create({
  'title': 'Conservative',
  'contexts': ['all'],
  'parentId': DS.MenuRootID,
  'onclick': function(info, tab){
    storeClick(info, tab, 'conservative');
  }
});
DS.MenuLiberalID = chrome.contextMenus.create({
  'title': 'Liberal',
  'contexts': ['all'],
  'parentId': DS.MenuRootID,
  'onclick': function(info, tab){
    storeClick(info, tab, 'liberal');
  }
});
DS.MenuApoliticalID = chrome.contextMenus.create({
  'title': 'Non-political',
  'contexts': ['all'],
  'parentId': DS.MenuRootID,
  'onclick': function(info, tab){
    storeClick(info, tab, 'apolitical');
  }
});
DS.MenuCurrentClassificationID = chrome.contextMenus.create({
  'type': 'separator',
  'contexts': ['all'],
  'parentId': DS.MenuRootID
});
DS.MenuCurrentClassificationID = chrome.contextMenus.create({
  'title': 'Current Classification:',
  'contexts': ['all'],
  'parentId': DS.MenuRootID
});

function storeClick(info, tab, category){
  chrome.tabs.sendRequest(tab.id, "getClickedEl", function(clickedEl) {
    localStorage[DS.storageIndex++]=JSON.stringify([category,clickedEl.value]);
    localStorage['storageIndex']=DS.storageIndex;
  });
}