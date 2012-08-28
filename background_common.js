var bayes;

DS.uniqueUserId = localStorage['userId'];
if((typeof(DS.uniqueUserId) == 'undefined') || (DS.uniqueUserID === null)){
  DS.uniqueUserId = uuid.v4();
  localStorage['userId']=DS.uniqueUserId;
}

DS.storageIndex = localStorage['storageIndex'];
if((typeof(DS.storageIndex) == 'undefined') || (DS.storageIndex === null)){
  DS.storageIndex = 0;
}

DS.classifiedIds = localStorage['classifiedIds'];
var classifiedIdLookup={};

if((typeof(DS.classifiedIds)=='undefined') && (DS.classifiedIds == null)){
  DS.classifiedIds = [];
} else {
  DS.classifiedIds = JSON.parse(DS.classifiedIds);
  DS.classifiedIds.forEach(function(i){
    classifiedIdLookup[i[0]]=i[1];
  });
}

DS.sendClassificationData = localStorage['sendClassificationData'] === 'true'

function reloadTrainingData() {
  var trainingData= localStorage['TrainingData'];
  bayes = new classifier.Bayesian();
  if((typeof(trainingData ) != 'undefined') && (trainingData !== null)){
    bayes.fromJSON(JSON.parse(trainingData));
  } else {
    reloadTrainingDataFromServer();
  }
}

function reloadTrainingDataFromServer(){
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
        bayes = new classifier.Bayesian();
        bayes.fromJSON(JSON.parse(req.responseText));
        retrainFromLocalClassifications();
        localStorage['TrainingData'] = req.responseText;
      } catch (e){
      }
    }
  }
  req.send(JSON.stringify(toSend));
}

function saveTrainingData() {
  localStorage['TrainingData'] = JSON.stringify(bayes.toJSON());
}

function localStorageKey(x){
  return 'training_' + x.toString();
}

function retrainFromLocalClassifications() {
  var x = 0;
  var data = localStorage[localStorageKey(x)];
  while((typeof(data)!='undefined') && (data !== null)){
    data = JSON.parse(data);
    if(data[2]){
      bayes.train(data[0], data[1]);
    }
    data = localStorage[localStorageKey(x)];
  }
  saveTrainingData();
}