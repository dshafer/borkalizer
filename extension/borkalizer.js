(function(){
  var _global = this;

  var bayes_public = new classifier.Bayesian({thresholds:settings.thresholds});
  var bayes_private = new classifier.Bayesian({thresholds:settings.thresholds});
  
  var load = function(callback){
    callback = callback || function(s){};
    bayes_private = new classifier.Bayesian({thresholds:settings.thresholds});
    var privateTrainingData = localStorage['trainingData_private'];
    if((typeof(privateTrainingData)!='undefined') && (privateTrainingData !== null)){
      bayes_private.fromJSON(JSON.parse(privateTrainingData));
    }
    
    var trainingData= localStorage['trainingData_public'];
    bayes_public = new classifier.Bayesian({thresholds:settings.thresholds});
    if((typeof(trainingData ) != 'undefined') && (trainingData !== null)){
      bayes_public.fromJSON(JSON.parse(trainingData));
      callback(true);
    } else {
      loadFromServer(callback);
    }
  }
  
  var loadFromServer = function (callback){
    callback = callback || function(s){};
    var req = new XMLHttpRequest();
    req.open('GET', settings.trainingUrl, true);
    req.setRequestHeader('Content-Type', 'application/json');
    var toSend = {};
    req.onreadystatechange = function(){
      if(req.readyState === 4){
        try{
          bayes_public = new classifier.Bayesian({thresholds:settings.thresholds});
          bayes_public.fromJSON(JSON.parse(req.responseText));
          bayes_public.backend.incCounts(bayes_private.backend.catCounts, bayes_private.backend.wordCounts);
          localStorage['trainingData_public'] = req.responseText;
          callback(true);
        } catch (e){
          callback(false);
        }
      }
    }
    req.send(JSON.stringify(toSend));
  }
  
  function sendBayesPrivateDefsToServer(callback){
    callback = callback || function(s){};
    var bP = bayes_private.toJSON();
    if(numPrivateClassifications()>0){
      var req = new XMLHttpRequest();
      req.open('POST', settings.trainingUrl, true);
      req.setRequestHeader('Content-Type', 'application/json');
      var toSend = {
        'version':settings.version,
        'userId':settings.uniqueUserId,
        'timestamp': (new Date()).valueOf(),
        'cats':bP.cats,
        'words':bP.words
      };
      req.onreadystatechange = function(){
        if(req.readyState === 4){
          try{
            settings.lastSummarizedClassificationDataSentTS = (new Date()).valueOf();
            settings.save('lastSummarizedClassificationDataSentTS');
            bayes_private = new classifier.Bayesian({thresholds:settings.thresholds});
            save();
            callback(true);
          } catch (e){
            callback(false);
          }
        }
      }
      req.send(JSON.stringify(toSend));
    } else {
      callback(false);
    }
  }
  
  var save = function(){
    localStorage['trainingData_public'] = JSON.stringify(bayes_public.toJSON());
    localStorage['trainingData_private'] = JSON.stringify(bayes_private.toJSON());
  }
  
  var classify = function(fingerprint){
    if(typeof(settings.classifiedIds[fingerprint.id])!='undefined'){
      return settings.classifiedIds[fingerprint.id];
    } else {
      if(fingerprint.data.length > 0){
        return bayes_public.classify(fingerprint.data);
      } else {
        return 'unclassified';
      }
    }
  }
  
  var train = function(fingerprint, cat, callback){
    callback = callback || function(s){};
    bayes_public.train(fingerprint.data, cat);
    settings.classifiedIds[fingerprint.id] = cat;
    settings.save('classifiedIds');
    if(settings.sendIndividualClassificationData.toString() === 'true'){
      // don't train bayes_private; instead send the raw fingerprint data
      var req = new XMLHttpRequest();
      req.open('POST', settings.classificationUrl, true);
      req.setRequestHeader('Content-Type', 'application/json');
      var toSend = {
        'version':settings.version,
        'userId':settings.uniqueUserId,
        'timestamp': (new Date()).valueOf(),
        'classification':cat,
        'fingerprint':fingerprint
      };
      req.onreadystatechange = function(){
        if(req.readyState === 4){
          try{
            bayes = new classifier.Bayesian({thresholds:settings.thresholds});
            bayes.fromJSON(JSON.parse(req.responseText));
            save();
            callback(true);
          } catch (e){
            callback(false);
          }
        }
      }
      req.send(JSON.stringify(toSend));
    } else {
      // train bayes_private so the summarized private training can be sent later on
      bayes_private.train(fingerprint.data, cat);
      callback(true);
    }
  }
  
  var numPrivateClassifications = function(){
    var toRet = 0;
    for(var cat in bayes_private.backend.catCounts){
      toRet += bayes_private.backend.catCounts[cat];
    }
    return toRet;
  }
  
  var borkalizer = {};
  borkalizer.load = load;
  borkalizer.loadFromServer = loadFromServer;
  borkalizer.save = save;
  borkalizer.classify = classify;
  borkalizer.train = train;
  borkalizer.numPrivateClassifications = numPrivateClassifications;
  borkalizer.sendBayesPrivateDefsToServer = sendBayesPrivateDefsToServer;

  // export
  _global.borkalizer = borkalizer;
})();






