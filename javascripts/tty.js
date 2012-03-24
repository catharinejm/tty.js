TTY = {};

(function($) {
  TTY.init = function(jqObj, promptStr) {
    TTY.console = jqObj;
    initConsole();

    TTY.command = $T('span.command');
    TTY.cursor = $T('span.cursor');
    TTY.afterCursor = $T('span.after-cursor');
    TTY.typing = 0;
    TTY.input = "";
    TTY.promptStr = escapeHTML(promptStr);
    $T('span.prompt').html(TTY.promptStr);


    blinkCursor(800);
    captureKeys();

    function $T(selector) {
      return TTY.console.find(selector);
    }

    function initConsole() {
      TTY.console.html(
        '<textarea id="buffer"></textarea>' +
        '<ul>' +
        '  <li class="current">' +
        '    <span class="prompt"></span>' +
        '    <span class="command"></span>' +
        '    <span class="cursor show-cursor">&nbsp;</span>' +
        '    <span class="after-cursor"></span>' +
        '  </li>' +
        '</ul>'
      );
    }

    function blinkCursor(interval) {
      setInterval(function() {
        if (TTY.typing) return;

        TTY.cursor.toggleClass('show-cursor');
      }, interval);
    }

    function captureKeys() {

      function typingEvent(element, eventName, bindingFn) {
        $(element).bind(eventName, function(e) {
          TTY.typing++;
          TTY.cursor.addClass("show-cursor");

          bindingFn(e);

          setTimeout(function() { TTY.typing--; }, 200);
        });
      }

      typingEvent(document, "keypress", function(e) {
        if (e.metaKey) return;

        switch(e.which) {
        case 3: // C-c
          TTY.command.text(TTY.command.text() + "^C");
          drawNewLine();
          break;
        case 12: // C-l
          $T("li.current").prevAll().remove();
          break;
        case 13: // CR
          bufferInput();
          drawNewLine();
          break;
        case 21: // C-u
          TTY.command.html("");
          TTY.cursor.html("&nbsp;");
          TTY.afterCursor.html("");
          break;
        case 32: // Space
          TTY.command.html(TTY.command.html() + "&nbsp;");
          break;
        default:
          if (! (e.altKey || e.ctrlKey)) TTY.command.text(TTY.command.text() + String.fromCharCode(e.which));
        }
      });

      $(document).click(function() {
        $T('#buffer').focus();
      }).click();

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
          var text = TTY.afterCursor.text();
          if (text) {
            TTY.cursor.html(escapeHTML(text[0]));
            TTY.afterCursor.html(escapeHTML(text.substr(1, text.length)));
          }
          break;

        // Clear to end
        case 75: // K
          if (! e.ctrlKey) break;
          TTY.cursor.html("&nbsp;");
          TTY.afterCursor.html('');
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
      if (TTY.command.text() == "") return;

      var text = TTY.command.text();
      var afterText = TTY.afterCursor.text();
      TTY.afterCursor.html(escapeHTML(TTY.cursor.text() + afterText));
      TTY.cursor.html(escapeHTML(text[text.length-1]));
      TTY.command.html(escapeHTML(text.substr(0, text.length-1)));
    }

    function matchBack() {
      return TTY.command.text().match(/^(.*)\b(\w+\W*)$/);
    }

    function moveBackWord() {
      var match = matchBack();
      if (! match) return;

      var before = match[1], after = match[2];

      TTY.afterCursor.html(escapeHTML(after.substr(1,after.length)) + TTY.cursor.html() + TTY.afterCursor.html());
      TTY.cursor.html(escapeHTML(after[0]));
      TTY.command.html(escapeHTML(before));
    }

    function deleteBack() {
      var text = TTY.command.text();
      TTY.command.html(escapeHTML(text.substr(0, text.length-1)));
    }

    function deleteBackWord() {
      var match = matchBack();

      if (match)
        TTY.command.html(escapeHTML(match[1]));
    }

    function moveRight() {
      var afterText = TTY.afterCursor.text();
      if (! afterText) return;

      var text = TTY.command.text();

      TTY.command.html(escapeHTML(text + TTY.cursor.text()));
      TTY.cursor.html(escapeHTML(afterText[0]));
      TTY.afterCursor.html(escapeHTML(afterText.substr(1, afterText.length)));
    }

    function matchForward() {
      return TTY.afterCursor.text().match(/^(\W*\w+)\b(.*)$/);
    }

    function moveForwardWord() {
      var match = matchForward();
      if (! match) return;

      var before = match[1], after = match[2];

      TTY.command.html(TTY.command.html() + TTY.cursor.html() + escapeHTML(before));
      TTY.cursor.html(escapeHTML(after[0]));
      TTY.afterCursor.html(escapeHTML(after.substr(1, after.length)));
    }

    function deleteForward() {
      var text = TTY.afterCursor.text();
      if (text) {
        TTY.cursor.html(escapeHTML(text[0]));
        TTY.afterCursor.html(escapeHTML(text.substr(1, text.length)));
      }
    }

    function deleteForwardWord() {
      var match = matchForward();
      if (! match) return;
      var after = match[2];
      TTY.cursor.html(escapeHTML(after[0]));
      TTY.afterCursor.html(escapeHTML(after.substr(1, after.length)));
    }

    function moveToBeginning() {
      var text = TTY.command.text();
      if (! text) return;

      TTY.afterCursor.html(escapeHTML(text.substr(1, text.length)) + TTY.cursor.html() + TTY.afterCursor.html());
      TTY.cursor.html(escapeHTML(text[0]));
      TTY.command.html("");
    }

    function moveToEnd() {
      var afterText = TTY.afterCursor.text();
      if (! afterText) return;

      TTY.command.html(TTY.command.html() + TTY.cursor.html() + escapeHTML(afterText));
      TTY.cursor.html("&nbsp;");
      TTY.afterCursor.html('');
    }

    function bufferInput() {
      TTY.input += TTY.command.text();
    }

    function drawNewLine() {
      var currentLine = $T("li.current");
      var newLine = currentLine.clone();
      currentLine.removeClass("current");
      currentLine.html(TTY.promptStr + "&nbsp;" + escapeHTML(TTY.command.text()));

      newLine.find('.command').html('');
      newLine.find('.cursor').addClass("show-cursor");
      newLine.insertAfter(currentLine);

      TTY.command = $T('.command');
      TTY.cursor = $T('.cursor');
      TTY.afterCursor = $T('.after-cursor');
      $T('#buffer').val('');
    }
  }

  $.fn.tty = function(promptStr) {
    TTY.init($(this), promptStr);
  }
})(jQuery);
