
var forEach = Array.prototype.forEach;

DS = { 'version':'0.1' };
DS.classes={
  conservative:{
    tag:'c',
    desc:'Conservative',
    bgcolor:'rgba(255,0,0,0.2)',
    action:'bork',
    showMenu:true
  },
  liberal:{
    tag:'l',
    desc:'Liberal',
    bgcolor:'rgba(0,0,255,0.2)',
    action:'bork',
    showMenu:true
  },
  apolitical:{
    tag:'a',
    desc:'Non-Political',
    bgcolor:'rgba(0,0,0,0.2)',
    action:'none',
    showMenu:true
  },
  unclassified:{
    tag:'unclassified',
    desc:'Unclassified',
    action:'none',
    showMenu:false
  }
}

DS.classLookup = {};
for(var bin in DS.classes){
  DS.classLookup[DS.classes[bin].tag] = DS.classes[bin];
}






