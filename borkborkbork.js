var borkborkbork = {
  init_state: 'NIW',
  states: ['INW', 'INW_I', 'NIW'],
  rules: [
    { regex:'an', output:'un', states: ['INW', 'NIW'], nextState:'INW'},
    { regex:'au', output:'oo', states: ['INW', 'NIW'], nextState:'INW'},
    { regex:'a', output:'e', states: ['INW', 'INW_I']},
    { regex:'e\\b', output:'e-a', states: ['INW', 'INW_I']},
    { regex:'ew', output:'oo', states: ['INW', 'INW_I']},
    { regex:'e', output:'i', states: [ 'NIW' ], nextState:'INW'},
    { regex:'f', output:'ff', states: ['INW', 'INW_I']},
    { regex:'ir', output:'ur', states: ['INW', 'INW_I']},
    { regex:'i', output:'ee', states: ['INW'], nextState:'INW_I'},
    { regex:'ow', output:'oo', states: ['INW', 'INW_I']},
    { regex:'o', output:'oo', states: [ 'NIW' ], nextState:'INW'},
    { regex:'o', output:'u', states: ['INW', 'INW_I']},
    { regex:'tion', output:'shun', states: ['INW', 'INW_I']},
    { regex:'u', output:'oo', states: ['INW', 'INW_I']},
    { regex:'the', output:'zee', states: ['INW', 'NIW'], nextState:'INW'},
    { regex:'th\b', output:'t', states: ['INW', 'INW_I', 'NIW']},
    { regex:'v', output:'f', states: ['INW', 'NIW'], nextState:'INW'},
    { regex:'w', output:'v', states: ['INW', 'NIW'], nextState:'INW'},
    { regex:'bork\\b', output:'bork', states: [ 'NIW' ]},
    { regex:'([.!?])\s*$', output:'$0 Bork Bork Bork!', states: ['INW', 'INW_I', 'NIW'], nextState:'NIW'},
    { regex:'\\w', states: ['INW', 'INW_I', 'NIW'], nextState:'INW'},
    { regex:'\\W', states: ['INW', 'INW_I', 'NIW'], nextState:'NIW'}
  ]
}