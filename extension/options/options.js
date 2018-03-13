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
});

$("#btnSave").click(function (e) {
  if ($("#txbUpdate").val() < Number($("#txbUpdate").attr("min"))) {
    $("#txbUpdate").val(3);
  }
  chrome.storage.local.set({
    updateRate:$("#txbUpdate").val(),
    defaultDisplay:!!Number($("#ddlDisplay").val()),
  });
});
