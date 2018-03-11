chrome.contextMenus.create({
  id: "place-comment",
  title: "Place comment",
  contexts: ["all"]
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case "place-comment":
      display = true;
      chrome.storage.local.set({ display });
      var port = chrome.tabs.connect(tab.id);
      port.postMessage("place-comment");
      break;
  }
});

var display = true;
chrome.storage.local.get("display", function (res) {
  display = res.display;
});
browser.commands.onCommand.addListener(function (name) {
  switch (name) {
    case "toggle-feature":
      display = !display;
      chrome.storage.local.set({ display });
      break;
  }
});
