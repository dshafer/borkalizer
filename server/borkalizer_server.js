//vi:ts=2:expandtab
var fs = require('fs');
var classifier = require('classifier');
var flatiron = require('flatiron');

var app = flatiron.app;
app.use(flatiron.plugins.http);

var classified_log = 'classified.log';
var training_log = 'training.log';
var port = 8080;

var bayes = new classifier.Bayesian();
onEachLineOf(classified_log, '>>>>', trainIndividual, function(){
  onEachLineOf(training_log, '>>>>', trainDictionary, startServer);
});

function onEachLineOf(fileName, lineSeparator, lineCallback, onDone){
  if(!fs.existsSync(fileName)){
    if(typeof(onDone)=='function'){
      onDone();
    }
    return;
  }
  var input = fs.createReadStream(fileName);
  var remaining = '';
  var trainingCount = 0;
  input.on('data', function(data){
    remaining += data;
    var index = remaining.indexOf(lineSeparator);
    var last = 0;
    while(index>-1){
      var line = remaining.substring(last,index);
      last = index+4;
      if(line.length>0){
        lineCallback(line);
      }
      index = remaining.indexOf('>>>>', last);
    }
    remaining = remaining.substring(last);
  });
  
  input.on('end', function() {
    if(remaining.length>0){
      lineCallback(remaining);
    }
    if(typeof(onDone)=='function'){
      onDone();
    }
  });
}

function trainDictionary(line){
  var trainingData = JSON.parse(line);
  bayes.backend.incCounts(trainingData.cats, trainingData.words);
}
function trainIndividual(line){
  var trainingData = JSON.parse(line);
  bayes.train(trainingData.fingerprint.data, trainingData.classification);
}

function startServer(){
  console.log("setting up HTTP routes");

  // clients send individual classification data to /classified
  app.router.post('/classified', function(){
    console.log('received classified request:');
    console.log(this.req.body);
    fs.appendFile(classified_log, 
      ">>>>\n" +
      JSON.stringify(this.req.body) +
      "\n");
    bayes.train(this.req.body.fingerprint.data, this.req.body.classification);
    this.res.json(bayes.toJSON());
  });

  // clients send completed dictionaries to /training
  app.router.post('/training', function(){
    console.log('received training post:');
    console.log(this.req.body);
    fs.appendFile(training_log, 
      ">>>>\n" +
      JSON.stringify(this.req.body) +
      "\n");
    bayes.backend.incCounts(this.req.body.cats, this.req.body.words);
    this.res.json(bayes.toJSON());
  });

  // clients request most recent dictionary from /training
  app.router.get('/training', function(){
    console.log('received training data request');
    this.res.writeHead(200, { 'Content-Type': 'application/json' });
    this.res.json(bayes.toJSON());
  });

  console.log("starting server on port " + port.toString() + "\n");
  app.start(port);
}
