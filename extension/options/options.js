chrome.storage.local.get(null, function (res) {
  $("#txbUpdate").val(res.updateRate);
});

$("#btnSave").click(function (e) {
  chrome.storage.local.set({
    updateRate:$("#txbUpdate").val()
  });
});
