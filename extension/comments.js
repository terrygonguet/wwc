const container = $("<div>").attr("id", "wwc-container").appendTo(document.body).hide();
const editor = $("<div>")
  .addClass("wwc-editor")
  .appendTo(container)
  .draggable()
  .hide();
$("<p>Enter comment :</p>").appendTo(editor);
$("<textarea id='txtComment' rows=3>").appendTo(editor);
$("<button>POST</button>")
  .click(function (e) {
    var offset = editor.offset();
    var data = {
      url: encodeURI(location.href),
      text: $("#txtComment").val(),
      x: Math.floor(offset.left),
      y: Math.floor(offset.top)
    };
    $.ajax({
      url:"https://webwidecomments.herokuapp.com/comments",
      method:"POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      dataType: "json",
      success: function () {
        addComment(data);
        editor.hide();
      },
      error: function (e) {
        if (e.status >= 200 && e.status < 300) {
          addComment(data);
          editor.hide();
        }
        console.log(JSON.stringify(e));
      }
    });
  })
  .appendTo(editor);
$("<button>CANCEL</button>")
  .click(function (e) {
    editor.hide();
    $("#txtComment").val("");
  })
  .appendTo(editor);

$.ajax({
  url:"https://webwidecomments.herokuapp.com/comments",
  method:"GET",
  data: {
    url:encodeURI(location.href)
  },
  dataType: "json",
  success: function (comments) {
    comments.forEach(addComment);
  },
  error: function (e) {
    console.log(JSON.stringify(e));
  }
});

function openEditor() {
  editor.css("top", $(document).scrollTop() + 0.5 * innerHeight).show();
}

function addComment(data) {
  $("<div>")
    .addClass("wwc-comment")
    .css({ top:data.y, left:data.x })
    .text(data.text)
    .appendTo(container);
}

chrome.storage.onChanged.addListener(function (changes, area) {
  if (area === "local" && changes.display) {
    container[changes.display.newValue ? "show" : "hide"]();
  }
});
chrome.storage.local.get("display", function (res) {
  container[res.display ? "show" : "hide"]();
});

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (type) {
    switch (type) {
      case "place-comment":
        openEditor();
        break;
    }
  });
});
