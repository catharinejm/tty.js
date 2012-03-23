var LISP = {};

$(function() {
  $('#buffer').focus();
  $.get("/", function(data) { 
    initREPL(data);
  });

  function initREPL(pageData) {
    var navMap = buildMapFromDOM($(pageData).find('nav'));
    LISP.cursor = $('span#cursor');
    LISP.typing = 0;
    LISP.command = $('span#command');
    LISP.input = "";
    blinkCursor(800);
    captureKeys();
  }

  function blinkCursor(interval) {
    setInterval(function() {
      if (LISP.typing) return;

      LISP.cursor.toggleClass('show-cursor');
    }, interval);
  }

  function captureKeys() {

    function typingEvent(element, eventName, bindingFn) {
      $(element).bind(eventName, function(e) {
        LISP.typing++;
        LISP.cursor.addClass("show-cursor");

        bindingFn(e);

        setTimeout(function() { LISP.typing--; }, 200);
      });
    }

    typingEvent(document, "keypress", function(e) {
      switch(e.which) {
      case 3: // C-c
        LISP.command.text(LISP.command.text() + "^C");
        drawNewLine();
        break;
      case 13: // CR
        bufferInput();
        drawNewLine();
        break;
      case 21: // C-u
        LISP.command.html("");
        break;
      case 32: // Space
        LISP.command.html(LISP.command.html() + "&nbsp;");
        break;
      default:
        LISP.command.text(LISP.command.text() + String.fromCharCode(e.which));
      }
    });

    $(document).click(function() {
      $('#buffer').focus();
    });

    typingEvent("#buffer", "keydown", function(e) {
      if (e.which == 8) {
        var text = LISP.command.text();
        LISP.command.html(text.substr(0, text.length-1).replace(/\s/g, "&nbsp;"));
      }
    });
  }

  function bufferInput() {
    LISP.input += LISP.command.text();
  }

  function drawNewLine() {
    var currentLine = $("li.current");
    var newLine = currentLine.clone();
    currentLine.removeClass("current");
    currentLine.html("REPL&gt;&nbsp" + LISP.command.text().replace(/\s/g, "&nbsp;"));
    newLine.find('#command').html('');
    newLine.find('#cursor').addClass("show-cursor");
    newLine.insertAfter(currentLine);

    LISP.command = $('#command');
    LISP.cursor = $('#cursor');
    $('#buffer').val('');
  }

  function buildMapFromDOM(jqDOM) {
    var map = {};
    jqDOM.find('li').each(function() {
      map[$(this).text()] = $(this).attr('href');
    });
    return map;
  }
});
