function StringStream(string) {
  this.string = string;
  this.index = 0;
  this.length = string.length;
}

StringStream.prototype.getc = function() { return this.string[this.index++]; }
StringStream.prototype.peek = function() { return this.string[this.index]; }
StringStream.prototype.back = function() { this.index--; }
StringStream.prototype.chunk = function(regex) { 
  var match = (this.string.substr(this.index).match(regex || /^[^\s\n\(\)]*/) || [""])[0];
  this.index += match.length;
  return match; 
}
StringStream.prototype.jump = function() { 
  while(/[\s\n]/.test(this.string[this.index])) 
    this.index++;
}
StringStream.prototype.isConsumed = function() { return this.index == this.length; }
StringStream.prototype.rem = function() { return this.string.substr(this.index); }

function Cons(car, cdr) {
  this.car = car;
  this.cdr = cdr;
  this.quoted = false;
  this.type = "Cons";
}

NIL = {type: "Nil", quoted: true}; // JS objects only == themselves, so this is OK for comparisons


function Symbol(sym) {
  this.sym = sym;
  this.type = "Symbol";
  this.quoted = false;
}

(function($) {
  var REPL = {
    inputBuffer: "",
    prompt: "REPL>"
  }

  function UnterminatedInputError() {
    this.restartRead = true;
  }

  function quote(form) { 
    form.quoted = true;
    return form; 
  }

  function cons(car, cdr) {
    return new Cons(car, cdr);
  }

  function car(cons) { return cons.car; }
  function cdr(cons) { return cons.cdr; }

  function type(form) {
    return form.type || typeof(form);
  }

  REPL.readerFn = function(input) { 
    try {
      var inputStream = new StringStream(REPL.inputBuffer + input);
      var form = readForm(inputStream);

      REPL.inputBuffer = "";
      inputStream.jump();
      if (! inputStream.isConsumed()) throw("extraneous characters after end of input: \""+inputStream.rem()+'"');
      return printForm(form);
    } catch(err) {
      if (err.restartRead) {
        REPL.inputBuffer = inputStream.string + "\n";
        return false;
      } else
      return "READ ERROR: " + err;
    }
  }

  function readForm(input) {
    input.jump();
    if (input.isConsumed()) throw(new UnterminatedInputError());
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

  function printForm(form) {
    switch(type(form)) {
    case "number":
      return form.toString();
    case "string":
      return '"'+form+'"';
    case "Symbol":
      return form.sym;
    case "Nil":
      return "()";
    case "Cons":
      return "("+printList(form)+")";
    default:
      throw('type "'+type(form)+'" is invalid');
    }
  }

  function printList(form) {
    if (cdr(form) == NIL)
      return printForm(car(form));
    else if (type(cdr(form)) != "Cons")
      return printForm(car(form)) + " . " + printForm(cdr(form));
    else
      return printForm(car(form)) + " " + printList(cdr(form));
  }

  function readList(input, idx) {
    input.jump();
    var cur = input.getc();
    if (cur == ".") {
      var form = readForm(input);
      input.jump();
      if (input.getc() != ")") throw('only one form may come after " . "');
      return form;
    } else if (cur == ")")
      return NIL;

    input.back();
    return cons(readForm(input), readList(input));
  }

  function readString(input) {
    var string = "", escapes;
    do {
      var chunk = input.chunk(/[^"]*/);
      string += chunk;
      escapes = (string.match(/\\*$/) || [""])[0];
    } while (escapes.length & 1);
    if (input.getc() != '"') throw(new UnterminatedInputError(false));
    return string;
  }

  function readSymbol(input) {
    return new Symbol(input.chunk());
  }

  $.fn.repl = function() {
    $(this).tty(REPL.prompt, REPL.readerFn);
  }
})(jQuery);
