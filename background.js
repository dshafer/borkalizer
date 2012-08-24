DS = {};

DS.storageIndex = localStorage['storageIndex'];
if((typeof(DS.storageIndex)==='undefined') || (DS.storageIndex === 'null')){
  DS.storageIndex = 0;
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

var classLookup = {};
var menuItemLookup = {}
for(var bin in classes){
  classLookup[classes[bin].tag] = classes[bin];
  var menuItemId = chrome.contextMenus.create({
    'title': classes[bin].desc,
    'contexts': ['all'],
    'parentId':DS.MenuRootID,
    'onclick': function(info, tab){
      storeClick(info, tab, menuItemLookup[info.menuItemId]);
    }
  });
  menuItemLookup[menuItemId]=classes[bin].tag;
}
classLookup.unclassified = {desc: 'Unclassified'};

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
  chrome.tabs.sendRequest(tab.id, "getClickedElFingerprint", function(fingerprint) {
    bayes.train(fingerprint, category);
    var s = JSON.stringify(bayes.toJSON());
    var l = s.length;
    localStorage['TrainingData'] = s;
    if(DS.sendClassificationData){
      var req = new XMLHttpRequest();
      req.open('POST', 'http://borkalizer.com/classified', true);
      req.setRequestHeader('Content-Type', 'application/json');
      var toSend = {
        'classification':category,
        'fingerprint':fingerprint
      };
      req.send(JSON.stringify(toSend));
    }
  });
}

chrome.extension.onMessage.addListener(
  function (request, sender, sendResponse){
    if(request.command == 'getTrainingData'){
      sendResponse(JSON.stringify(bayes.toJSON()));
    } else if (request.command == 'elementClassified'){
      // update the context menu with the classified element
      chrome.contextMenus.update(DS.MenuCurrentClassificationID,
        {
          'title': 'Current Classification: ' + classLookup[request.data].desc
        }
      );
    }
  }
);