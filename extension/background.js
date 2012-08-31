var ports = {};
var clickedElsFingerprint = {};

borkalizer.load();

var timeToSendPrivateTrainingDataToServer = function(){
  if(settings.sendSummarizedClassificationDataTimer > 0){
      return ((new Date())-settings.lastSummarizedClassificationDataSentTS) > settings.sendSummarizedClassificationDataTimer;
  } else {
    return false;
  }
}
var sendPrivateTrainingDataIfReady = function(){
  if(timeToSendPrivateTrainingDataToServer()){
    sendBayesPrivateDefsToServer(function(success){
      if(success){
        settings.save();
      }
    });
  }
}

sendPrivateTrainingDataIfReady();

// Set up the context menus
menuRootID = chrome.contextMenus.create({
  'title': 'The Borkalizer!',
  'contexts': ['all']
});
var menuItemLookup = {}
for(var cat in settings.classes){
  if(settings.classes[cat].showMenu){
    var menuItemId = chrome.contextMenus.create({
      'title': settings.classes[cat].desc,
      'contexts': ['all'],
      'parentId':menuRootID,
      'onclick': function(info, tab){
        storeClick(info, tab, menuItemLookup[info.menuItemId]);
      }
    });
    menuItemLookup[menuItemId]=settings.classes[cat].tag;
  }
}
chrome.contextMenus.create({
  'type': 'separator',
  'contexts': ['all'],
  'parentId': menuRootID
});
menuCurrentClassificationID = chrome.contextMenus.create({
  'title': 'Current Classification:',
  'contexts': ['all'],
  'parentId': menuRootID
});
menuToggleBorkID = chrome.contextMenus.create({
  'title': 'Restore Original',
  'contexts': ['all'],
  'parentId': menuRootID,
  'onclick': function(info, tab){
    ports[tab.id].postMessage({
      command:'toggleBork'
    });
  }
});

chrome.extension.onConnect.addListener(function(port){
  ports[port.sender.tab.id]=port;
  port.onMessage.addListener(function(msg){
    if(msg.command == 'classifyElement'){
      port.postMessage(
        {
          command: 'elementClassified',
          id: msg.fingerprint.id,
          bin: settings.classLookup[borkalizer.classify(msg.fingerprint)]
        });
      sendPrivateTrainingDataIfReady();

    } else if (msg.command == 'elementRightClicked'){
      var bin = borkalizer.classify(msg.fingerprint);
      // update the context menu with the classified element
      chrome.contextMenus.update(menuCurrentClassificationID,
        {
          'title': 'Current Classification: ' + settings.classLookup[bin].desc
        }
      );
      
      if(msg.currentState != 'none'){
        chrome.contextMenus.update(menuToggleBorkID,
          {
            'title': msg.currentState == 'restored' ? 'Re-Bork' : 'Restore Original',
            'type':'normal'
          });
      } else {
        chrome.contextMenus.update(menuToggleBorkID,
          {
            'title': "",
            'type':'separator'
          });
      }
      clickedElsFingerprint[port.sender.tab.id]=msg.fingerprint;
    }
  });
  port.onDisconnect.addListener(function(){
    delete ports[port.sender.tab.id];
  });
});

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.command === 'reload-settings'){
      settings.load();
      borkalizer.load();
    } else {
      debugger;
    }
  });

function storeClick(info, tab, category){
  var fingerprint = clickedElsFingerprint[tab.id];
  borkalizer.train(fingerprint, category);
  borkalizer.save();
  ports[tab.id].postMessage(
    {
      command: 'elementClassified',
      id: fingerprint.id,
      bin: settings.classLookup[category]
    });
}