REPL = {
  inputBuffer: "",
  prompt: "REPL>",
  readerFn: function(input) { 
    if (/;\s*$/.test(input)) {
      var output = REPL.inputBuffer+input.match(/^[^;]*/);
      REPL.inputBuffer = "";
      return output;
    } else {
      REPL.inputBuffer += input+"\n";
      return false;
    }
  }
};

$(function() {
  $('#tty').tty(REPL.prompt, REPL.readerFn);
});
