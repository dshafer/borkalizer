

function classify(fingerprint){
  if(typeof(classifiedIdLookup[fingerprint.id])!='undefined'){
    return classifiedIdLookup[fingerprint.id];
  } else {
    if(fingerprint.data.length > 0){
      return bayes.classify(fingerprint.data);
    } else {
      return 'unclassified';
    }
  }
}

reloadTrainingData();

var ports = {};
var clickedElsFingerprint = {};

chrome.extension.onConnect.addListener(function(port){
  ports[port.sender.tab.id]=port;
  port.onMessage.addListener(function(msg){
    if(msg.command == 'classifyElement'){
      port.postMessage(
        {
          command: 'elementClassified',
          id: msg.fingerprint.id,
          bin: DS.classLookup[classify(msg.fingerprint)]
        });
    } else if (msg.command == 'elementRightClicked'){
      var bin = classify(msg.fingerprint);
      // update the context menu with the classified element
      chrome.contextMenus.update(DS.MenuCurrentClassificationID,
        {
          'title': 'Current Classification: ' + DS.classLookup[bin].desc
        }
      );
      
      if(msg.currentState != 'none'){
        chrome.contextMenus.update(DS.MenuToggleBorkID,
          {
            'title': msg.currentState == 'restored' ? 'Re-Bork' : 'Restore Original',
            'type':'normal'
          });
      } else {
        chrome.contextMenus.update(DS.MenuToggleBorkID,
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

// Set up the context menus
DS.MenuRootID = chrome.contextMenus.create({
  'title': 'The Borkalizer!',
  'contexts': ['all']
});

var menuItemLookup = {}
for(var bin in DS.classes){
  if(DS.classes[bin].showMenu){
    var menuItemId = chrome.contextMenus.create({
      'title': DS.classes[bin].desc,
      'contexts': ['all'],
      'parentId':DS.MenuRootID,
      'onclick': function(info, tab){
        storeClick(info, tab, menuItemLookup[info.menuItemId]);
      }
    });
    menuItemLookup[menuItemId]=DS.classes[bin].tag;
  }
}


chrome.contextMenus.create({
  'type': 'separator',
  'contexts': ['all'],
  'parentId': DS.MenuRootID
});
DS.MenuCurrentClassificationID = chrome.contextMenus.create({
  'title': 'Current Classification:',
  'contexts': ['all'],
  'parentId': DS.MenuRootID
});
DS.MenuToggleBorkID = chrome.contextMenus.create({
  'title': 'Restore Original',
  'contexts': ['all'],
  'parentId': DS.MenuRootID,
  'onclick': function(info, tab){
    ports[tab.id].postMessage({
      command:'toggleBork'
    });
  }
});

function storeClick(info, tab, category){
  var fingerprint = clickedElsFingerprint[tab.id];

  bayes.train(fingerprint.data, category);
  DS.classifiedIds.push([fingerprint.id, category]);
  classifiedIdLookup[fingerprint.id]=category;
  localStorage['classifiedIds']=JSON.stringify(DS.classifiedIds);

  if(DS.sendIndividualClassificationData){
    // this is the case if users elect to send individual classified fingerprints to the server
    var req = new XMLHttpRequest();
    req.open('POST', 'http://borkalizer.com/classified', true);
    req.setRequestHeader('Content-Type', 'application/json');
    var toSend = {
      'version':DS.version,
      'userId':DS.uniqueUserId,
      'timestamp': (new Date()).valueOf(),
      'classification':category,
      'fingerprint':fingerprint
    };
    req.onreadystatechange = function(){
      if(req.readyState === 4){
        try{
          bayes = new classifier.Bayesian({thresholds:DS.thresholds});
          bayes.fromJSON(JSON.parse(req.responseText));
        } catch (e){
          debugger;
        }
      }
    }
    req.send(JSON.stringify(toSend));
  } else {
    // this is the normal case
    bayesPrivate.train(fingerprint.data, category);
  }

  saveTrainingData();

  ports[tab.id].postMessage(
    {
      command: 'elementClassified',
      id: fingerprint.id,
      bin: DS.classLookup[category]
    });
}