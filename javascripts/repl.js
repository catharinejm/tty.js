function StringStream(string) {
  this.string = string;
  this.index = 0;
  this.length = string.length;
}

StringStream.prototype.getc = function() { return this.string[this.index++]; }
StringStream.prototype.back = function() { this.index--; }
StringStream.prototype.chunk = function(regex) { 
  var match = (this.string.substr(this.index).match(regex || /^[^\s\(\)]*/) || [""])[0];
  this.index += match.length;
  return match; 
}
StringStream.prototype.jump = function() { while(/\s/.test(this.string[this.index++])); }
StringStream.prototype.isConsumed = function() { return this.index == this.length; }

(function($) {
  var REPL = {
    inputBuffer: "",
    prompt: "REPL>"
  }

  REPL.readerFn = function(input) { 
    try {
      var inputStream = new StringStream(input);
      var form = readForm(input);
      input.jump();
      if (! input.isConsumed()) throw("extraneous characters after end of input");
      return form;
    } catch(err) {
      return "READ ERROR: " + err;
    }

    var NIL = {}; // JS objects only == themselves, so this is OK for comparisons

    function readForm(input) {
      input.jump();
      var cur = input.getc();
      if (cur == ')') throw('unexpected ")"');

      if (/\d/.test(cur)) {
        input.back();
        return readNumber(input);
      } else if (cur == "'")
        return quote(readForm(input));
      else if (cur == '(')
        return readList(input);
      else if (cur == '"')
        return readString(input);
      else {
        input.back();
        return readSymbol(input);
      }
    }
    
    function readNumber(input) {
      var num = input.chunk();
      if (/\./.test(num))
        parsedNum = parseFloat(num);
      else
        parsedNum = parseInt(num);

      if (parsedNum != parsedNum) // NaN
        throw(num + " is not a valid number.");

      return parsedNum;
    }

    function quote(form) { return form; }

    function readList(input, idx) {
      input.jump();
      var cur = input.getc();
      if (cur == ".")
        return cons(readForm(input), readForm(input));
      else if (cur == ")")
        return NIL;

      input.back();
      return cons(readForm(input), readList(input));
    }

    function readString(input) {
      var string = "", escapes;
      do {
        string += input.chunk(/[^"]*/) || throw("unterminated string");
        escapes = (string.match(/\\*$/) || [""])[0];
      } while (escapes.length & 1);
      return string;
    }

    function readSymbol(input) {
      var sym = input.chunk();
    }
  };

  $.fn.repl = function() {
    $(this).tty(REPL.prompt, REPL.readerFn);
  }
})(jQuery);
