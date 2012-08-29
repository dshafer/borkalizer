var Translate = {};

(function() {
  Translate.compile_translator = function(language){
    var translator = new Translator();
    translator.init_state = language.init_state;
    
    for(var s=0; s< language.states.length; s++){
      translator[language.states[s]] = [];
    }
    for(var r=0; r < language.rules.length; r++){
      var compiled_rule = Translate.compile_rule(language.rules[r]);
      for(var s=0; s<language.rules[r].states.length; s++){
        translator[language.rules[r].states[s]].push(compiled_rule);
      }
    }
    return translator;
  }
  
  Translate.compile_rule = function(rule){
    var toRet = {};
    toRet.regex = new RegExp('^' + rule.regex, 'i');
    toRet.replacement = (typeof(rule.output) == 'undefined') ? null : rule.output;
    toRet.nextState = (typeof(rule.nextState) == 'undefined') ? null : rule.nextState;
    return toRet;
  }
})();

var Translator = function(){
  this.vars = {};
  this.states = {};
}

Translator.prototype.capitalize = function(s){
  return s.charAt(0).toUpperCase() + s.slice(1);
}
Translator.prototype.ruleResult = function(rule, input){
  var m = input.match(rule.regex);
  if(m === null){
    return { success: false};
  } else {
    return {
      success: true,
      numCharactersConsumed: m[0].length,
      output: (rule.replacement !== null) ? rule.replacement.replace('$0', m[1]) : m[0],
      nextState: rule.nextState
    };
  }
}

Translator.prototype.translate = function(input){
  var output = '';
  var tok;
  var state = this[this.init_state];
  while(input.length > 0){
    var capitalized = /^[A-Z]/.test(input);
    for(var i = 0; i < state.length; i++){
      var r = this.ruleResult(state[i], input);
      if(r.success){
        input = input.substring(r.numCharactersConsumed);
        output += capitalized ? this.capitalize(r.output) : r.output;
        if(r.nextState !== null){
          state = this[r.nextState];
        }
        break;
      }
    }
  }
  return output;
}
