var defaultColor = "blue";


function loadOptions() {
  var trainingData= localStorage['TrainingData'];
  
  if((typeof(trainingData) != 'undefined') && (trainingData !== null)){
    bayes = new classifier.Bayesian();
    bayes.fromJSON(JSON.parse(trainingData));
    document.getElementById('training_data').value=trainingData;
  }
  
  var x = 0;
  var raw_data = "[\n";
  var entry = localStorage[x.toString()];
  
  while((typeof(entry) != 'undefined') && (entry !== null)){
    raw_data += (x == 0 ? '' : ",\n") + entry;
    var entry = localStorage[(x++).toString()];
  }
  raw_data += ']';
  document.getElementById('raw_data').value = raw_data;
}

window.addEventListener('load', function(){
  loadOptions();
});
document.getElementById('btn_retrain').addEventListener('click', function(){
  var data = JSON.parse(document.getElementById('raw_data').value);
  bayes = new classifier.Bayesian();
  for(var i=0; i < data.length; i++){
    train(data[i]);
  }
  var s = JSON.stringify(bayes.toJSON());
  var l = s.length;
  localStorage['TrainingData'] = s;
  loadOptions();
});
