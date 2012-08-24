var defaultColor = "blue";


function loadOptions() {
  var sendFeedback= localStorage['sendClassificationData'];
  document.getElementById("sendFeedbackData").checked = sendFeedback === 'true';
}

window.addEventListener('load', function(){
  loadOptions();
});
document.getElementById("btnSaveSettings").addEventListener('click', function(){
  localStorage['sendClassificationData'] = document.getElementById("sendFeedbackData").checked;
});
