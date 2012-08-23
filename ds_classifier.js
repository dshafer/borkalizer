var bayes;

function stringifyElementForClassifier(e){
  if(typeof(e) == 'string'){
    var ee = document.createElement('div');
    ee.innerHTML = e;
    e = ee;
  }
  return e.innerText;
}

function train(datum){
  bayes.train(stringifyElementForClassifier(datum[1]), datum[0]);
}