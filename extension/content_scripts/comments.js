var config, itvId, captchaId, mousePos = { x:0, y:0 };
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
  $(document).mousemove(function (e) {
    mousePos.x = e.pageX;
    mousePos.y = e.pageY;
  })
  .keydown(function (e) {
    if (e.key === "Shift") {
      $(".wwc-editor").children().css("pointer-events","none");
    }
  })
  .keyup(function (e) {
    if (e.key === "Shift") {
      $(".wwc-editor").children().css("pointer-events", "");
    }
  });
  $.get(chrome.runtime.getURL("resources/container.html"), function (res) {
    $(res).appendTo("body");
    $("#wwc-container")[config.display[location.href] ? "show" : "hide"]();
    $(".wwc-editor").draggable({ cursor:"grabbing", containment:"document" }).hide();
    $("#wwc-txtComment")
      .keydown(function (e) {
        if (e.key === "Enter" && e.ctrlKey) {
          $("#wwc-btnPost").click();
        } else if (e.key === "Escape") {
          $("#wwc-btnCancel").click();
        }
      });
    $("#wwc-btnPost")
      .click(function (e) {
        var text = $("#wwc-txtComment").val().trim();
        var captcha = $("#wwc-recaptcha-token").val();
        if (text === "" || captcha === "") {
          $("#wwc-lblError").text("Please type text AND fulfil reCAPTCHA").show();
          return;
        }
        var offset = $(".wwc-editor").offset();
        var data = {
          url: location.href,
          text, captcha,
          x: offset.left / innerWidth * 100,
          y: offset.top / innerHeight * 100,
        };
        $.ajax({
          url:"https://webwidecomments.herokuapp.com/comments",
          method:"POST",
          data: JSON.stringify(data),
          contentType: "application/json",
          dataType: "json",
          done: function () {
            addComment(data);
            $(".wwc-editor").hide();
            console.log("success");
          },
          fail: function (e) {
            if (e.status >= 200 && e.status < 300) {
              addComment(data);
              $(".wwc-editor").hide();
            } else {
              console.log(JSON.stringify(e));
              $("#wwc-lblError").text("An error occured, try again later.").show();
            }
          }
        });
      });
    $("#wwc-btnCancel")
      .click(function (e) {
        $(".wwc-editor").hide();
        $("#wwc-txtComment").val("");
      });
    updateComments();
    itvId = setInterval(updateComments, config.updateRate * 1000);
    $(`<script src='https://www.google.com/recaptcha/api.js?render=explicit&onload=wwcLoadCallback'></script>`).appendTo("#wwc-container");
    $(`<script src="${chrome.runtime.getURL("resources/captcha.js")}"></script>`).appendTo("#wwc-container");
  });
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
    done: function (comments) {
      $(".wwc-comment").detach();
      comments.forEach(addComment);
    },
    fail: function (e) {
      console.log(JSON.stringify(e));
    }
  });
}

function openEditor() {
  if (Number($("#wwc-isWebsiteAnnoying").val())) {
    $(".wwc-editor").empty().append("<p>This website is annoying and is blocking this functionality</p>").show();
    return;
  }
  $(`<script id="wwcRender">wwcRenderCaptcha();</script>`).appendTo("#wwc-container");
  $(".wwc-editor").css({
    top: mousePos.y,
    left: mousePos.x
  }).show();
  $("#wwc-lblError").hide();
  $("#wwc-txtComment").val("").focus();
}

function addComment(data) {
  $("<pre>")
    .addClass("wwc-comment")
    .css({ top:data.y + "%", left:data.x + "%" })
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

chrome.runtime.onMessage.addListener(function (message) {
  switch (message.name) {
    case "place-comment":
      openEditor();
      break;
    case "update-comments":
      updateComments();
      break;
  }
});
