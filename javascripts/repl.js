(function($) {
  var REPL = {
    inputBuffer: "",
    prompt: "REPL>",
    readerFn: function(input) { 
      if (/;\s*$/.test(input)) {
        var output = REPL.inputBuffer+input.match(/^(.*);\s*$/)[1];
        REPL.inputBuffer = "";
        return output;
      } else {
        REPL.inputBuffer += input+"\n";
        return false;
      }
    }
  };

  $.fn.repl = function() {
    $(this).tty(REPL.prompt, REPL.readerFn);
  }
})(jQuery);
