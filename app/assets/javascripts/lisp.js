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
    blinkCursor(800);
    captureKeys();
  }

  function blinkCursor(interval) {
    setInterval(function() {
      if (LISP.typing) return;

      if (LISP.cursor.text() == "_")
        LISP.cursor.text("");
      else
        LISP.cursor.text("_");
    }, interval);
  }

  function captureKeys() {

    function typingEvent(element, eventName, bindingFn) {
      $(element).bind(eventName, function(e) {
        LISP.typing++;
        LISP.cursor.text("_");

        bindingFn(e);

        setTimeout(function() { LISP.typing--; }, 200);
      });
    }

    typingEvent(document, "keypress", function(e) {
      var newChar;
      switch(e.which) {
      case 32:
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

  function buildMapFromDOM(jqDOM) {
    var map = {};
    jqDOM.find('li').each(function() {
      map[$(this).text()] = $(this).attr('href');
    });
    return map;
  }
});
