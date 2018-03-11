chrome.contextMenus.create({
  id: "place-comment",
  title: "Place comment",
  contexts: ["page"]
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case "place-comment":
      var port = chrome.tabs.connect(tab.id);
      port.postMessage(tab);
      break;
  }
});
