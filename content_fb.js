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
    'timelineReportContainer'
    ],
  tagsToExclude:['form']
}

var borkifyDef = {
  containerClasses: ['storyContent', 'timelineUnitContainer'],
  translateClasses: ['userContent'],
  imageClasses: ['uiPhotoThumb'],
  videoClasses: ['uiVideoThumb']
}