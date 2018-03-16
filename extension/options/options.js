chrome.storage.local.get(null, function (res) {
  $("#txbUpdate").val(res.updateRate);
  if (res.defaultDisplay)
    $("option[value=1]").attr("selected", "selected");
  else
    $("option[value=0]").attr("selected", "selected");
  for (var page in res.display) {
    $("<tr>")
      .append(`<td>${page}</td>`)
      .append(`<td><img data-url="${page}" src="${res.display[page] ? "shown" : "hidden"}.png"/></td>`)
      .appendTo("#tblPages");
  }
  $("#tblPages img").click(function (e) {
    var url = $(this).attr("data-url");
    res.display[url] = !res.display[url];
    $(this).attr("src", (res.display[url] ? "shown" : "hidden") + ".png");
    chrome.storage.local.set({ display:res.display });
  });

  chrome.commands.getAll(function (commands) {
    for (var com of commands) {
      $("#" + com.name).val(com.shortcut);
    }
  });

  $("#btnBug").click(function () {
    $.ajax({
      url:"https://webwidecomments.herokuapp.com/bugs",
      method:"POST",
      data: {
        bug:$("#txtBug").val(),
        email:$("#txbEmail").val()
      },
      dataType:"json",
      success: function (res) {
        $("#txtBug").val("Thanks !");
        $("#txbEmail").val("");
        $("#btnBug").removeAttr("disabled");
      },
      error: function (e) {
        if (e.status >= 200 && e.status < 300) {
          $("#txtBug").val("Thanks !");
          $("#txbEmail").val("");
        } else {
          var txt = $("#txtBug").val();
          $("#txtBug").val(txt + "\n" + JSON.stringify(e));
        }
        $("#btnBug").removeAttr("disabled");
      }
    });
    $(this).attr("disabled", "disabled");
  });
});

$("#btnSave").click(function (e) {
  if ($("#txbUpdate").val() < Number($("#txbUpdate").attr("min"))) {
    $("#txbUpdate").val(10);
  }
  chrome.storage.local.set({
    updateRate:$("#txbUpdate").val(),
    defaultDisplay:!!Number($("#ddlDisplay").val()),
  });
});
