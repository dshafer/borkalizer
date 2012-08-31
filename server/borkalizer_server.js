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
var dictCount=0;
var indivCount=0;
onEachLineOf(classified_log, '>>>>', trainIndividual, function(){
  onEachLineOf(training_log, '>>>>', trainDictionary, function(){
    console.log('finished training from ' + dictCount.toString() + ' dictionaries and ' + indivCount.toString() + ' individual fingerprints.');
    var tot=0;
    console.log('category data:');
    for(var cat in bayes.backend.catCounts){
      console.log('  ' + cat.toString() + ': ' + bayes.backend.catCounts[cat].toString());
      tot += bayes.backend.catCounts[cat];
    }
    startServer();
  });
});

function onEachLineOf(fileName, lineSeparator, lineCallback, onDone){
  onDone = onDone || function(){};
  if(!fs.existsSync(fileName)){
    onDone();
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
    onDone();
  });
}

function trainDictionary(line){
  dictCount++;
  var trainingData = JSON.parse(line);
  bayes.backend.incCounts(trainingData.cats, trainingData.words);
}
function trainIndividual(line){
  indivCount++;
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
    var b = this.req.body;
    for(var cat in b.cats){
      console.log('  ' + cat.toString() + ': ' + b.cats[cat].toString());
    }
    console.log(b);
    fs.appendFile(training_log, 
      ">>>>\n" +
      JSON.stringify(b) +
      "\n");
    bayes.backend.incCounts(b.cats, b.words);
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
