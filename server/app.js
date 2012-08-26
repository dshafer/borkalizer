//vi:ts=2:expandtab
var fs = require('fs');
var classifier = require('classifier');
var flatiron = require('flatiron');

var app = flatiron.app;
app.use(flatiron.plugins.http);

var classified_log = 'classified.log';
var app_log = 'app.log';
var port = 8080;

console.log("reading initial classification data from classified.log\n");
var bayes = new classifier.Bayesian();
var input = fs.createReadStream(classified_log);
var remaining = '';
var trainingCount = 0;
input.on('data', function(data){
  remaining += data;
  var index = remaining.indexOf('>>>>');
  var last = 0;
  while(index>-1){
    var line = remaining.substring(last,index);
    last = index+4;
    if(line.length>0){
      trainLine(line);
    }
    index = remaining.indexOf('>>>>', last);
  }
  remaining = remaining.substring(last);
});

input.on('end', function() {
  if(remaining.length>0){
    trainLine(remaining);
  }
  console.log('finished initial training; count is ' + trainingCount);
  startServer();
});

function trainLine(line){
  var trainingData = JSON.parse(line);
  bayes.train(trainingData.fingerprint, trainingData.classification);
  trainingCount++;
}

function startServer(){
  console.log("setting up HTTP routes");
  app.router.get('/', function () {
    console.log('received request on root');
    this.res.writeHead(200, { 'Content-Type': 'text/plain' });
    this.res.end('borkalizer!\n');
  });

  app.router.post('/classified', function(){
    console.log('received classified request:');
    console.log(this.req.body);
    fs.appendFile('classified.log', 
      ">>>>\n" +
      JSON.stringify(this.req.body) +
      "\n");
    this.res.json('{"result":"ok"}');
  });

  app.router.get('/training', function(){
        console.log('received training data request');
        fs.appendFile('app.log',
          ">>>>\ntraining:" +
          JSON.stringify(this.req.body) + 
          "\n");
        this.res.json(JSON.stringify(bayes.toJSON()));
  });

  console.log("starting server on port " + port.toString() + "\n");
  app.start(port);
}
