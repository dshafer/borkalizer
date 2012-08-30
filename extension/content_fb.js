var contentContainerClasses = ['uiStreamStory', 'fbTimelineUnit'];
var contentIgnoreClasses = [
  'uiStreamStoryAttachmentOnly',
  'recentActivityContainer'
  ];

var fingerprintDef = {
  classesToExclude:[
    'uiStreamHeadline', 
    '-cx-PRIVATE-fbTimelineUnitActor__root', 
    'uiStreamHide',
    'ogAggregationSubstory',
    'uiStreamHeadline',
    'timelineReportContainer',
    'pageMostRecentPostList'
    ],
  tagsToExclude:['form']
}

var borkifyDef = {
  containerClasses: ['storyContent', 'timelineUnitContainer'],
  translateClasses: ['userContent'],
  imageClasses: ['uiPhotoThumb'],
  videoClasses: ['uiVideoThumb']
}

var getElementUniqueId = function(el){
  var commentForm = el.getElementsByClassName('commentable_item')[0];
  if(typeof(commentForm) != 'undefined'){
    var inputs = commentForm.getElementsByTagName('INPUT');
    for(var i=0; i<inputs.length; i++){
      if(inputs[i].value.indexOf('target_fbid') > -1){
        return "fb_" + JSON.parse(inputs[i].value).target_fbid;
      }
    }
  }
  return el.id;
}