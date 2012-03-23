var LISP = {};

$(function() {
  $('#buffer').focus();
  $.get("/", function(data) { 
    initREPL(data);
  });

  function initREPL(pageData) {
    var navMap = buildMapFromDOM($(pageData).find('nav'));
    LISP.command = $('span#command');
    LISP.cursor = $('span#cursor');
    LISP.afterCursor = $('span#after-cursor');
    LISP.typing = 0;
    LISP.input = "";
    blinkCursor(800);
    captureKeys();
  }

  function blinkCursor(interval) {
    setInterval(function() {
      if (LISP.typing) return;

      // LISP.cursor.toggleClass('show-cursor');
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
      if (e.metaKey) return false;

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
        LISP.cursor.html("&nbsp;");
        LISP.afterCursor.html("");
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
      if (e.metaKey) return false;

      switch (e.which) {
      // Backward delete
      case 8: // Backspace
        var text = LISP.command.text();
        LISP.command.html(escapeSpaces(text.substr(0, text.length-1)));
        break;

      // Forward delete
      case 68: // D
        if (! e.ctrlKey) break;
      case 46: // DEL
        var text = LISP.afterCursor.text();
        if (text) {
          LISP.cursor.html(escapeSpaces(text[0]));
          LISP.afterCursor.html(escapeSpaces(text.substr(1, text.length)));
        }
        break;

      // Clear to end
      case 75: // K
        if (! e.ctrlKey) break;
        LISP.cursor.html("&nbsp;");
        LISP.afterCursor.html('');
        break;

      // cursor left
      case 66: // B
        if (! e.ctrlKey) break;
      case 37: // Left arrow
        moveLeft();
        break;

      // cursor right
      case 70: // F
        if (! e.ctrlKey) break;
      case 39: // Right arrow
        moveRight();
        break;

      // Cursor to beginning
      case 65: // A
        if (! e.ctrlKey) break;
      case 33: // Home
        moveToBeginning();
        break;

      // Cursor to end
      case 69: // E
        if (! e.ctrlKey) break;
      case 34: // End
        moveToEnd();
        break;
      }
    });
  }

  function escapeSpaces(str) {
    return str.replace(/\s/g, "&nbsp;");
  }

  function moveLeft() {
    if (LISP.command.text() == "") return;

    var text = LISP.command.text();
    var afterText = LISP.afterCursor.text();
    LISP.afterCursor.html(escapeSpaces(LISP.cursor.text() + afterText));
    LISP.cursor.html(escapeSpaces(text[text.length-1]));
    LISP.command.html(escapeSpaces(text.substr(0, text.length-1)));
  }

  function moveRight() {
    var afterText = LISP.afterCursor.text();
    if (! afterText) return;

    var text = LISP.command.text();

    LISP.command.html(escapeSpaces(text + LISP.cursor.text()));
    LISP.cursor.html(escapeSpaces(afterText[0]));
    LISP.afterCursor.html(escapeSpaces(afterText.substr(1, afterText.length)));
  }

  function moveToBeginning() {
    var text = LISP.command.text();
    if (! text) return;

    LISP.cursor.html(escapeSpaces(text[0]));
    LISP.afterCursor.html(escapeSpaces(text.substr(1, text.length)));
    LISP.command.html("");
  }

  function moveToEnd() {
    var afterText = LISP.afterCursor.text();
    if (! afterText) return;

    LISP.command.html(escapeSpaces(LISP.cursor.text() + afterText));
    LISP.cursor.html("&nbsp;");
    LISP.afterCursor.html('');
  }

  function bufferInput() {
    LISP.input += LISP.command.text();
  }

  function drawNewLine() {
    var currentLine = $("li.current");
    var newLine = currentLine.clone();
    currentLine.removeClass("current");
    currentLine.html("REPL&gt;&nbsp" + escapeSpaces(LISP.command.text()));
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
