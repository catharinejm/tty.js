LISP = {};

$(function() {
  $('#buffer').focus();
  $.get("/", function(data) { 
    initREPL(data);
  });

  function initREPL(pageData) {
    var navMap = buildMapFromDOM($(pageData).find('nav'));
    LISP.command = $('span.command');
    LISP.cursor = $('span.cursor');
    LISP.afterCursor = $('span.after-cursor');
    LISP.typing = 0;
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
      if (e.metaKey) return;

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
        if (! (e.altKey || e.ctrlKey)) LISP.command.text(LISP.command.text() + String.fromCharCode(e.which));
      }
    });

    $(document).click(function() {
      $('#buffer').focus();
    });

    typingEvent("#buffer", "keydown", function(e) {
      if (e.metaKey) return;

      switch (e.which) {
      // Backward delete
      case 72: // H
        if (! e.ctrlKey) break;
      case 8: // Backspace
        if (e.ctrlKey || e.altKey)
          deleteBackWord();
        else
          deleteBack();
        break;

      // Forward delete
      case 68: // D
        if (e.ctrlKey)
          deleteForward();
        else if (e.altKey)
          deleteForwardWord();
        break;
      case 46: // DEL
        var text = LISP.afterCursor.text();
        if (text) {
          LISP.cursor.html(escapeHTML(text[0]));
          LISP.afterCursor.html(escapeHTML(text.substr(1, text.length)));
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
        if (e.ctrlKey)
          moveLeft();
        else if (e.altKey)
          moveBackWord();
        break;
      case 37: // Left arrow
        moveLeft();
        break;

      // cursor right
      case 70: // F
        if (e.ctrlKey)
          moveRight();
        else if (e.altKey)
          moveForwardWord();
        break;
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

  function escapeHTML(str) {
    return str.replace(/\s/g, "&nbsp;").replace(/>/g, "&gt;").replace(/</g, "&lt;");
  }

  function moveLeft() {
    if (LISP.command.text() == "") return;

    var text = LISP.command.text();
    var afterText = LISP.afterCursor.text();
    LISP.afterCursor.html(escapeHTML(LISP.cursor.text() + afterText));
    LISP.cursor.html(escapeHTML(text[text.length-1]));
    LISP.command.html(escapeHTML(text.substr(0, text.length-1)));
  }

  function matchBack() {
    return LISP.command.text().match(/^(.*)\b(\w+\W*)$/);
  }

  function moveBackWord() {
    var match = matchBack();
    if (! match) return;

    var before = match[1], after = match[2];

    LISP.afterCursor.html(escapeHTML(after.substr(1,after.length)) + LISP.cursor.html() + LISP.afterCursor.html());
    LISP.cursor.html(escapeHTML(after[0]));
    LISP.command.html(escapeHTML(before));
  }

  function deleteBack() {
    var text = LISP.command.text();
    LISP.command.html(escapeHTML(text.substr(0, text.length-1)));
  }

  function deleteBackWord() {
    var match = matchBack();

    if (match)
      LISP.command.html(escapeHTML(match[1]));
  }

  function moveRight() {
    var afterText = LISP.afterCursor.text();
    if (! afterText) return;

    var text = LISP.command.text();

    LISP.command.html(escapeHTML(text + LISP.cursor.text()));
    LISP.cursor.html(escapeHTML(afterText[0]));
    LISP.afterCursor.html(escapeHTML(afterText.substr(1, afterText.length)));
  }

  function matchForward() {
    return LISP.afterCursor.text().match(/^(\W*\w+)\b(.*)$/);
  }

  function moveForwardWord() {
    var match = matchForward();
    if (! match) return;

    var before = match[1], after = match[2];

    LISP.command.html(LISP.command.html() + LISP.cursor.html() + escapeHTML(before));
    LISP.cursor.html(escapeHTML(after[0]));
    LISP.afterCursor.html(escapeHTML(after.substr(1, after.length)));
  }

  function deleteForward() {
    var text = LISP.afterCursor.text();
    if (text) {
      LISP.cursor.html(escapeHTML(text[0]));
      LISP.afterCursor.html(escapeHTML(text.substr(1, text.length)));
    }
  }

  function deleteForwardWord() {
    var match = matchForward();
    if (! match) return;
    var after = match[2];
    LISP.cursor.html(escapeHTML(after[0]));
    LISP.afterCursor.html(escapeHTML(after.substr(1, after.length)));
  }

  function moveToBeginning() {
    var text = LISP.command.text();
    if (! text) return;

    LISP.afterCursor.html(escapeHTML(text.substr(1, text.length)) + LISP.cursor.html() + LISP.afterCursor.html());
    LISP.cursor.html(escapeHTML(text[0]));
    LISP.command.html("");
  }

  function moveToEnd() {
    var afterText = LISP.afterCursor.text();
    if (! afterText) return;

    LISP.command.html(LISP.command.html() + LISP.cursor.html() + escapeHTML(afterText));
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
    currentLine.html("REPL&gt;&nbsp" + escapeHTML(LISP.command.text()));

    newLine.find('.command').html('');
    newLine.find('.cursor').addClass("show-cursor");
    newLine.insertAfter(currentLine);

    LISP.command = $('.command');
    LISP.cursor = $('.cursor');
    LISP.afterCursor = $('.after-cursor');
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
