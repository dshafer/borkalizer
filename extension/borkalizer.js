(function(){
  var _global = this;

  var bayes_public;
  var bayes_private;
  
  var load = function(){
    bayes_private = new classifier.bayesian({thresholds:settings.thresholds});
    var privateTrainingData = localStorage['trainingData_private'];
    if((typeof(privateTrainingData)!='undefined') && (privateTrainingData !== null)){
      bayes_private.fromJSON(JSON.parse(privateTrainingData));
    }
    
    var trainingData= localStorage['trainingData_public'];
    bayes_public = new classifier.Bayesian({thresholds:DS.thresholds});
    if((typeof(trainingData ) != 'undefined') && (trainingData !== null)){
      bayes_public.fromJSON(JSON.parse(trainingData));
    } else {
      reloadTrainingDataFromServer();
    }
  }
  
  var loadFromServer = function (){
    var req = new XMLHttpRequest();
    req.open('GET', settings.trainingUrl, true);
    req.setRequestHeader('Content-Type', 'application/json');
    var toSend = {};
    req.onreadystatechange = function(){
      if(req.readyState === 4){
        try{
          bayes_public = new classifier.Bayesian({thresholds:DS.thresholds});
          bayes_public.fromJSON(JSON.parse(req.responseText));
          bayes_public.backend.incCounts(bayes_private.backend.catCounts, bayes_private.backend.wordCounts);
          localStorage['trainingData_public'] = req.responseText;
        } catch (e){
        }
      }
    }
    req.send(JSON.stringify(toSend));
  }
  
  var save = function(){
    localStorage['trainingData_public'] = JSON.stringify(bayes_public.toJSON());
    localStorage['trainingData_private'] = JSON.stringify(bayes_private.toJSON());
  }
  
  var classify = function(fingerprint){
    if(typeof(settings.classifiedIdLookup[fingerprint.id])!='undefined'){
      return settings.classifiedIdLookup[fingerprint.id];
    } else {
      if(fingerprint.data.length > 0){
        return bayes_public.classify(fingerprint.data);
      } else {
        return 'unclassified';
      }
    }
  }
  
  var train = function(fingerprint, cat){
  }
  
  var borkalizer = {};
  borkalizer.load = reload;
  borkalizer.loadFromServer = reloadFromServer;
  borkalizer.save = save;
  borkalizer.classify = classify;
  borkalizer.train = train;
  
  

  // export
  _global.borkalizer = borkalizer;
})();






