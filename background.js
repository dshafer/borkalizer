
DS.uniqueUserId = localStorage['userId'];
if((typeof(DS.uniqueUserId) == 'undefined') || (DS.uniqueUserID === null)){
  DS.uniqueUserId = uuid.v4();
  localStorage['userId']=DS.uniqueUserId;
}

DS.sendClassificationData = localStorage['sendClassificationData'] === 'true'

var trainingData= localStorage['TrainingData'];
bayes = new classifier.Bayesian();
if((typeof(trainingData ) != 'undefined') && (trainingData !== null)){
  bayes.fromJSON(JSON.parse(trainingData));
}

// Set up the context menus
DS.MenuRootID = chrome.contextMenus.create({
  'title': 'Classify',
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

function storeClick(info, tab, category){
  chrome.tabs.sendRequest(tab.id, {command: "getClickedElFingerprint"}, function(fingerprint) {
    bayes.train(fingerprint, category);
    var s = JSON.stringify(bayes.toJSON());
    var l = s.length;
    localStorage['TrainingData'] = s;
    if(DS.sendClassificationData){
      var req = new XMLHttpRequest();
      req.open('POST', 'http://borkalizer.com/classified', true);
      req.setRequestHeader('Content-Type', 'application/json');
      var toSend = {
        'version':DS.version,
        'userId':DS.uniqueUserId,
        'timestamp': (new Date()).toString(),
        'classification':category,
        'fingerprint':fingerprint
      };
      req.send(JSON.stringify(toSend));
      sendTrainingData(tab);
    }
  });
}

function sendTrainingData(tab){
  chrome.tabs.sendRequest(tab.id, {command:"updateTrainingData", data:bayes.toJSON()})
}

chrome.extension.onMessage.addListener(
  function (request, sender, sendResponse){
    if(request.command == 'getTrainingData'){
      sendTrainingData(sender.tab);
      //sendResponse(JSON.stringify(bayes.toJSON()));
    } else if (request.command == 'elementClassified'){
      // update the context menu with the classified element
      chrome.contextMenus.update(DS.MenuCurrentClassificationID,
        {
          'title': 'Current Classification: ' + DS.classLookup[request.data].desc
        }
      );
    }
  }
);