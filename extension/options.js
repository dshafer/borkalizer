function timeOfDayString(d){
  var a_p = "";
  var curr_hour = d.getHours();
  if (curr_hour < 12){
    a_p = "AM";
  }
  else{
    a_p = "PM";
  }
  if (curr_hour == 0){
    curr_hour = 12;
  }
  if (curr_hour > 12){
    curr_hour = curr_hour - 12;
  }

  var curr_min = d.getMinutes();
  curr_min = curr_min + "";

  if (curr_min.length == 1){
    curr_min = "0" + curr_min;
  }

  return curr_hour + ":" + curr_min + " " + a_p;
}
function dateString(d){
  var curr_date = d.getDate();
  var curr_month = d.getMonth();
  curr_month++;
  var curr_year = d.getFullYear();
  return curr_month + "/" + curr_date + "/" + curr_year;
}

function dateNice(d){
  return timeOfDayString(d) + ' ' + dateString(d);
}

var sendIndividualClassificationData = document.getElementById("sendIndividualClassificationData");
var versionNumber = document.getElementById('versionNumber');
var lastSummarizedClassificationDataSentTS = document.getElementById('lastSummarizedClassificationDataSentTS');
var numPendingClassifications = document.getElementById('numPendingClassifications');
var sendSummarizedClassificationDataTimer = document.getElementById('sendSummarizedClassificationDataTimer');
function loadOptions() {
  sendIndividualClassificationData.checked = settings.sendIndividualClassificationData === 'true';
  versionNumber.innerText = settings.version;
  sendSummarizedClassificationDataTimer.value = ((0 + settings.sendSummarizedClassificationDataTimer) / (60 * 60 * 1000)).toString();
  lastSummarizedClassificationDataSentTS.innerHTML = 
    settings.lastSummarizedClassificationDataSentTS == -1 ?
      '<em>never</em>' : dateNice(new Date(settings.lastSummarizedClassificationDataSentTS));
  numPendingClassifications.innerText=borkalizer.numPrivateClassifications();
}

function saveOptions() {
  settings.sendIndividualClassificationData = sendIndividualClassificationData.checked.toString();
  settings.sendSummarizedClassificationDataTimer = sendSummarizedClassificationDataTimer.value * 60 * 60 * 1000;
  settings.save();
  tellBackgroundPageToReload();
}

function tellBackgroundPageToReload(){
  if(typeof(chrome.extension)!='undefined'){
    chrome.extension.sendMessage({command: 'reload-settings'});
  }
}

window.addEventListener('load', function(){
  borkalizer.load(function(s){loadOptions();});
  //loadOptions();
});
document.getElementById("btnSaveSettings").addEventListener('click', function(){
  saveOptions();
});

document.getElementById('btnUploadPendingClassifications').addEventListener('click', function(){
  borkalizer.sendBayesPrivateDefsToServer(function(success){
    if(success){
      saveOptions();
      loadOptions();
    } else {
      document.getElementById('uploadError').innerText="Upload Failed!";
    }
  });
});
