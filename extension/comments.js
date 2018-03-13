var config, itvId, captchaId;
chrome.storage.local.get(null, function (res) {
  config = res;
  if (res.display[location.href] === undefined) {
    res.display[location.href] = res.defaultDisplay;
    chrome.storage.local.set({ display: res.display });
  }
  startup();
});

function startup() {
  $("#wwc-container").detach();
  const container = $("<div>")
    .attr("id", "wwc-container")
    .appendTo(document.body);
  container[config.display[location.href] ? "show" : "hide"]();
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
  // $(`<iframe src="${chrome.extension.getURL("captcha.html")}" sandbox="allow-scripts allow-forms allow-top-navigation" id="ifrCaptcha"></iframe>`)
  //   .appendTo(editor);
  $(`<div id="g-recaptcha"></div>`)
    .appendTo(editor);
  $(`<input type="hidden" id="wwc-recaptcha-token"/>`)
    .appendTo(editor);
  $("<div id='wwc-container-btn'>")
    .append(
      $("<button id='btnPost'>POST</button>")
      .click(function (e) {
        var text = $("#txtComment").val().trim();
        var captcha = $("#wwc-recaptcha-token").val();
        if (text === "" || captcha === "") {
          $("#lblError").text("Please type text AND fulfil reCAPTCHA").show();
          return;
        }
        var offset = editor.offset();
        var data = {
          url: location.href,
          text, captcha,
          x: Math.floor(offset.left),
          y: Math.floor(offset.top),
        };
        $.ajax({
          // url:"http://localhost:8080/comments",
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
            } else {
              console.log(JSON.stringify(e));
              $("#lblError").text("An error occured, try again later.").show();
            }
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
  $("<p id='lblError'></p>").hide().appendTo(editor);
  updateComments();
  itvId = setInterval(updateComments, config.updateRate * 1000);
  $(`<script src='https://www.google.com/recaptcha/api.js?render=explicit&onload=wwcLoadCallback'></script>`).appendTo("head");
  $(`<script src="${chrome.runtime.getURL("captcha.js")}"></script>`).appendTo("head");
}

function updateComments() {
  if (!config.display[location.href]) return ;
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
  $("#lblError").hide();
  $("#txtComment").focus();
}

function addComment(data) {
  $("<div>")
    .addClass("wwc-comment")
    .css({ top:data.y, left:data.x })
    .append($(`<p class='wwc-text'>`).text(data.text))
    .append(`<p class='wwc-createdAt'>${moment(data.createdAt).format("YYYY-MM-DD H:m:s")}</p>`)
    .appendTo("#wwc-container");
}

chrome.storage.onChanged.addListener(function (changes, area) {
  for (var change in changes) {
    config[change] = changes[change].newValue;
  }
  if (area === "local") {
    if (changes.display)
      $("#wwc-container")[config.display[location.href] ? "show" : "hide"]();
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
    case "update-comments":
      updateComments();
      break;
  }
});
