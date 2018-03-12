var config, itvId;
chrome.storage.local.get(null, function (res) {
  config = res;
  startup();
});

function startup() {
  $("#wwc-container").detach();
  const container = $("<div>")
    .attr("id", "wwc-container")
    .appendTo(document.body);
  container[config.display ? "show" : "hide"]();
  const editor = $("<div>")
    .addClass("wwc-editor")
    .appendTo(container)
    .draggable()
    .hide();
    $("<div id='wwc-tick'>").appendTo(editor);
    $("<p>Enter comment :</p>").appendTo(editor);
    $("<textarea id='txtComment' rows=3>")
    .keydown(function (e) {
      if (e.key === "Enter" && e.ctrlKey) {
        $("#btnPost").click();
      } else if (e.key === "Escape") {
        $("#btnCancel").click();
      }
    })
    .appendTo(editor);
  $("<div id='wwc-container-btn'>")
    .append(
      $("<button id='btnPost'>POST</button>")
      .click(function (e) {
        var txt = $("#txtComment").val().trim();
        if (txt === "") return;
        var offset = editor.offset();
        var data = {
          url: location.href,
          text: txt,
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
            } else
            console.log(JSON.stringify(e));
          }
        });
      })
    )
    .append(
      $("<button id='btnCancel'>CANCEL</button>")
      .click(function (e) {
        editor.hide();
        $("#txtComment").val("");
      })
    )
    .appendTo(editor);
  updateComments();
  itvId = setInterval(updateComments, config.updateRate * 1000);
}

function updateComments() {
  $.ajax({
    url:"https://webwidecomments.herokuapp.com/comments",
    method:"GET",
    data: {
      url:location.href
    },
    dataType: "json",
    success: function (comments) {
      $(".wwc-comment").detach();
      comments.forEach(addComment);
    },
    error: function (e) {
      console.log(JSON.stringify(e));
    }
  });
}

function openEditor() {
  $(".wwc-editor").css({
    top: $(document).scrollTop() + 0.5 * innerHeight,
    left: innerWidth * 0.5
  }).show();
  $("#txtComment").focus();
}

function addComment(data) {
  $("<div>")
    .addClass("wwc-comment")
    .css({ top:data.y, left:data.x })
    .append(`<p class='wwc-'>${data.text}</p>`)
    .append(`<p class='wwc-createdAt'>${moment(data.createdAt).format("YYYY-MM-DD H:m:s")}</p>`)
    .appendTo("#wwc-container");
}

chrome.storage.onChanged.addListener(function (changes, area) {
  for (var change in changes) {
    config[change] = changes[change].newValue;
  }
  if (area === "local") {
    if (changes.display)
      container[config.display ? "show" : "hide"]();
    if (changes.updateRate) {
      clearInterval(itvId);
      setInterval(updateComments, config.updateRate * 1000);
    }
  }
});

chrome.runtime.onConnect.addListener(function (port) {
  switch (port.name) {
    case "place-comment":
      openEditor();
      break;
  }
});
